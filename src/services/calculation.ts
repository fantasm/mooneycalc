import { actionTypes, actions } from "./actions";
import {
	BUFF_TYPE_EFFICIENCY,
	BUFF_TYPE_GATHERING,
	BUFF_TYPE_ACTION_SPEED,
	addBonuses,
	zeroBonuses,
	type Bonuses,
	BUFF_TYPE_GOURMET,
	BUFF_TYPE_ARTISAN,
	BUFF_TYPE_ACTION_LEVEL,
	getLevelBonus,
} from "./buffs";
import { communityBuffs } from "./community-buffs";
import { gameData, type ItemCount, type ActionDetail } from "./data";
import { getEquipmentBonuses } from "./equipment";
import { houseRooms } from "./house-rooms";
import { itemName } from "./items";
import { type Market } from "./market-fetch";
import { type Settings } from "./settings";
import {
	TEA_PER_HOUR,
	type TeaLoadout,
	emptyTeaLoadout,
	teaLoadoutsByActionType,
} from "./teas";

export interface ComputedAction {
	id: string;
	name: string;
	skillHrid: string;
	levelRequired: number;
	teas: string[];
	inputs: ItemCount[];
	inputsPrice: number;
	outputs: ItemCount[];
	outputsPrice: number;
	outputMaxBidAskSpread: number;
	actionsPerHour: number;
	profit: number;
}

interface SimpleActionDetail {
	hrid: string;
	name: string;
	type: string;
	levelRequirement: {
		skillHrid: string;
		level: number;
	};
	baseTimeCost: number;
	inputItems: ItemCount[];
	outputItems: ItemCount[];
	dropTable: {
		itemHrid: string;
		dropRate: number;
		minCount: number;
		maxCount: number;
	}[];
	essenceDropTable: {
		itemHrid: string;
		dropRate: number;
		minCount: number;
		maxCount: number;
	}[];
	rareDropTable: {
		itemHrid: string;
		dropRate: number;
		minCount: number;
		maxCount: number;
	}[];
	upgradeItemHrid: string;
	successRate: number;
}

function lerp(a: number, b: number, t: number) {
	// This is needed to support cases where a or b is infinity
	if (t <= 0) return a;
	if (t >= 1) return b;

	return a + (b - a) * t;
}

function getHouseBonuses(actionType: string, settings: Settings) {
	const buffEffects = { ...zeroBonuses };

	for (const houseRoom of houseRooms) {
		const level = settings.houseRooms[houseRoom.hrid]!;

		if (level === 0) continue;
		if (houseRoom.usableInActionTypeMap[actionType] !== true) continue;

		for (const buff of [...houseRoom.actionBuffs, ...houseRoom.globalBuffs]) {
			buffEffects[buff.typeHrid]! +=
				buff.flatBoost + buff.flatBoostLevelBonus * (level - 1);
		}
	}

	return buffEffects;
}

function getCommunityBuffBonuses(actionType: string, settings: Settings) {
	const buffEffects = { ...zeroBonuses };

	for (const buff of communityBuffs) {
		const level = settings.communityBuffs[buff.hrid]!;

		if (level === 0) continue;
		if (buff.usableInActionTypeMap[actionType] !== true) continue;

		buffEffects[buff.buff.typeHrid]! +=
			buff.buff.flatBoost + buff.buff.flatBoostLevelBonus * (level - 1);
	}

	return buffEffects;
}

function getInputPrice(itemHrid: string, settings: Settings, market: Market) {
	if (itemHrid === "/items/coin") return 1;

	let { bid, ask } = market.market[itemName(itemHrid)] ?? {
		bid: -1,
		ask: -1,
	};
	if (ask === -1) ask = Number.POSITIVE_INFINITY;
	if (bid === -1) bid = ask;

	const p = settings.market.inputBidAskProportion;
	const marketPrice = lerp(ask, bid, p);

	return marketPrice;
}

function getOutputPrice(itemHrid: string, settings: Settings, market: Market) {
	if (itemHrid === "/items/coin") return 1;

	let { bid, ask } = market.market[itemName(itemHrid)] ?? {
		bid: -1,
		ask: -1,
	};
	if (bid === -1) bid = 0;
	if (ask === -1) ask = bid;

	const p = settings.market.outputBidAskProportion;
	const marketPrice = lerp(bid, ask, p) * 0.98;

	// Use the higher of the market price and the sell price
	const sellPrice = gameData.itemDetailMap[itemHrid]!.sellPrice;
	const bestPrice = Math.max(marketPrice, sellPrice);

	return bestPrice;
}

function computeSingleAction(
	action: SimpleActionDetail,
	teaLoadout: TeaLoadout,
	equipmentBonuses: Bonuses,
	settings: Settings,
	market: Market,
): ComputedAction {
	// Compute bonuses
	const houseBonuses = getHouseBonuses(action.type, settings);
	const communityBonuses = getCommunityBuffBonuses(action.type, settings);
	const teaBonuses = teaLoadout.bonuses;
	const bonuses = addBonuses(
		equipmentBonuses,
		houseBonuses,
		communityBonuses,
		teaBonuses,
	);

	// Compute level efficiency
	let baseLevel = settings.levels[action.levelRequirement.skillHrid]!;
	if (baseLevel < action.levelRequirement.level)
		baseLevel = action.levelRequirement.level;
	const levelBonus = getLevelBonus(action.levelRequirement.skillHrid, bonuses);
	const boostedLevel = baseLevel + levelBonus;
	const actionLevel =
		action.levelRequirement.level + bonuses[BUFF_TYPE_ACTION_LEVEL]!;
	const levelsAboveRequirement = Math.max(0, boostedLevel - actionLevel);
	const levelEfficiency = 0.01 * levelsAboveRequirement;

	// Compute actions per hour
	const baseActionsPerHour = 3600_000_000_000 / action.baseTimeCost;
	const speed = 1 + bonuses[BUFF_TYPE_ACTION_SPEED]!;
	const efficiency = 1 + bonuses[BUFF_TYPE_EFFICIENCY]! + levelEfficiency;
	if (action.hrid === "/actions/milking/holy_cow")
		console.log(action.name, speed, efficiency);
	const actionsPerHour = baseActionsPerHour * speed * efficiency;

	// Compute inputs
	let inputs = action.inputItems?.slice() ?? [];

	// Apply artisan bonus
	const artisanBonus = 1 - bonuses[BUFF_TYPE_ARTISAN]!;
	inputs = inputs.map(({ itemHrid, count }) => ({
		itemHrid,
		count: count * artisanBonus,
	}));

	if (action.upgradeItemHrid) {
		inputs.push({ itemHrid: action.upgradeItemHrid, count: 1 });
	}
	// Compute outputs
	let outputs = action.outputItems ?? [];

	// Apply gourmet bonus
	const gourmetBonus = 1 + bonuses[BUFF_TYPE_GOURMET]!;
	outputs =
		outputs.map(({ itemHrid, count }) => ({
			itemHrid,
			count: count * gourmetBonus,
		})) ?? [];

	// Apply gathering bonus and add drop table to outputs
	const gatheringBonus = 1 + bonuses[BUFF_TYPE_GATHERING]!;
	if (action.dropTable) {
		const dropTableOutputs = action.dropTable.map((e) => ({
			itemHrid: e.itemHrid,
			count: e.dropRate * 0.5 * (e.minCount + e.maxCount) * gatheringBonus,
		}));
		outputs = [...outputs, ...dropTableOutputs];
	}

	const inputsCost = inputs.reduce(
		(sum, input) =>
			sum + getInputPrice(input.itemHrid, settings, market) * input.count,
		0,
	);
	const revenue = outputs.reduce((sum, output) => {
		return (
			sum + getOutputPrice(output.itemHrid, settings, market) * output.count
		);
	}, 0);

	const outputBidAskSpreads = outputs.map((output) => {
		const { bid, ask } = market.market[itemName(output.itemHrid)] ?? {
			bid: -1,
			ask: -1,
		};
		if (ask === -1 || bid === -1) return 1;

		return (ask - bid) / ask;
	});
	const outputMaxBidAskSpread = Math.max(...outputBidAskSpreads);

	const teasCost = teaLoadout.teaHrids.reduce(
		(sum, tea) => sum + getInputPrice(tea, settings, market),
		0,
	);

	const profit =
		(revenue - inputsCost) * actionsPerHour - teasCost * TEA_PER_HOUR;

	return {
		id: action.hrid,
		name: action.name,
		skillHrid: action.levelRequirement.skillHrid,
		levelRequired: action.levelRequirement.level,
		teas: teaLoadout.teaHrids,
		inputs,
		inputsPrice: inputsCost,
		outputs,
		outputsPrice: revenue,
		outputMaxBidAskSpread,
		actionsPerHour,
		profit,
	};
}

function simplfyActions(actions: ActionDetail[]): SimpleActionDetail[] {
	// Simplify actions
	const simplifiedActions = actions.map((a) => {
		const action: SimpleActionDetail = {
			hrid: a.hrid,
			name: a.name,
			type: a.type,
			levelRequirement: a.levelRequirement,
			baseTimeCost: a.baseTimeCost,
			inputItems: a.inputItems ?? [],
			outputItems: a.outputItems ?? [],
			dropTable: a.dropTable ?? [],
			essenceDropTable: a.essenceDropTable ?? [],
			rareDropTable: a.rareDropTable ?? [],
			upgradeItemHrid: a.upgradeItemHrid,
			successRate: 1,
		};
		return action;
	});
	return simplifiedActions;
}

export function computeActions(settings: Settings, market: Market) {
	let filteredActions = simplfyActions(actions);

	// Filter out combat and enhancement actions
	filteredActions = filteredActions.filter(
		(a) =>
			a.type !== "/action_types/combat" && a.type !== "/action_types/enhancing" && a.type !== "/action_types/alchemy",
	);

	// Filter out actions with unmet level requirements
	if (settings.filters.hideUnmetLevelRequirements) {
		filteredActions = filteredActions.filter((a) => {
			const level = settings.levels[a.levelRequirement.skillHrid]!;
			return level >= a.levelRequirement.level;
		});
	}

	// Precompute equipment bonuses for each action type
	const equipmentBonusesByActionType: Record<string, Bonuses> = {};
	for (const actionType of actionTypes) {
		equipmentBonusesByActionType[actionType] = addBonuses(
			...Object.entries(settings.equipment).map(
				([equipmentType, equipmentHrid]) => {
					if (equipmentHrid === null) return zeroBonuses;

					return getEquipmentBonuses(
						actionType,
						equipmentType,
						equipmentHrid,
						settings.equipmentLevels[equipmentType]!,
					);
				},
			),
		);
	}

	const computedActions = filteredActions.flatMap((a) => {
		let teaLoadouts: TeaLoadout[] = settings.filters.showAutoTeas
			? teaLoadoutsByActionType[a.type] ?? [emptyTeaLoadout]
			: [emptyTeaLoadout];

		const drinkSlots = 2;
		teaLoadouts = teaLoadouts.filter((teaLoadout) => {
			return teaLoadout.teaHrids.length <= drinkSlots;
		});

		const candidateActions = teaLoadouts.map((teaLoadout) => {
			return computeSingleAction(
				a,
				teaLoadout,
				equipmentBonusesByActionType[a.type]!,
				settings,
				market,
			);
		});

		// Keep candidate acton with the maximum profit
		const bestAction = candidateActions.reduce((best, current) => {
			return current.profit > best.profit ? current : best;
		});

		return bestAction;
	});
	return computedActions;
}
