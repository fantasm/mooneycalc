import { type Bonuses, addBonuses, zeroBonuses } from "./buffs";
import { gameData } from "./data";
import { items } from "./items";

export const TEA_PER_HOUR = 12;
export const teas = items
	.filter((item) => item.categoryHrid === "/item_categories/drink")
	.sort((a, b) => a.sortIndex - b.sortIndex);

// TODO: add wisdom tea
// TODO: add processing tea
const teaCombinationsByActionType: Record<string, string[]> = {
	"/action_types/milking": [
		"/items/efficiency_tea",
		"/items/gathering_tea",
	],
	"/action_types/foraging": [
		"/items/efficiency_tea",
		"/items/gathering_tea",
	],
	"/action_types/woodcutting": [
		"/items/efficiency_tea",
		"/items/gathering_tea",
	],
	"/action_types/cheesesmithing": [
		"/items/efficiency_tea",
		"/items/artisan_tea",
	],
	"/action_types/crafting": [

		"/items/efficiency_tea",
		"/items/artisan_tea",
	],
	"/action_types/tailoring": [
		"/items/efficiency_tea",
		"/items/artisan_tea",
	],
	"/action_types/cooking": [
		"/items/efficiency_tea",
		"/items/gourmet_tea",
	],
	"/action_types/brewing": [
		"/items/gourmet_tea",
		"/items/artisan_tea",
	],
	"/action_types/alchemy": [
		"/items/efficiency_tea",
		"/items/catalytic_tea",
	],
};

export interface TeaLoadout {
	teaHrids: string[];
	bonuses: Bonuses;
}

export const emptyTeaLoadout: TeaLoadout = {
	teaHrids: [],
	bonuses: zeroBonuses,
};

function getTeaBonuses(actionType: string, teaHrid: string) {
	const tea = gameData.itemDetailMap[teaHrid]!;
	const buffEffects = { ...zeroBonuses };

	if (!tea.consumableDetail) {
		console.log(`No consumable details for tea ${teaHrid}`);
		return buffEffects;
	}

	if (tea.consumableDetail.usableInActionTypeMap![actionType] !== true) {
		console.log(`Tea ${teaHrid} is not usable in action type ${actionType}`);
		return buffEffects;
	}

	for (const buff of tea.consumableDetail.buffs ?? []) {
		buffEffects[buff.typeHrid]! += buff.flatBoost;
		buffEffects[buff.typeHrid]! += buff.ratioBoost;
	}
	return buffEffects;
}

export const teaLoadoutByActionType: Record<string, TeaLoadout> = {};

for (const [actionTypeHrid, teaHrids] of Object.entries(teaCombinationsByActionType)) {
	const bonuses = teaHrids.reduce((acc, teaHrid) => {
		return addBonuses(acc, getTeaBonuses(actionTypeHrid, teaHrid));
	}, zeroBonuses);

	teaLoadoutByActionType[actionTypeHrid] = {
		teaHrids,
		bonuses,
	};
}

