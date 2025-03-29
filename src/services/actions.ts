import { gameData, type DropTableEntry, type ItemCount } from "./data";

export const actions = Object.values(gameData.actionDetailMap).sort(
	(a, b) =>
		1000 * gameData.actionTypeDetailMap[a.type]!.sortIndex +
		a.sortIndex -
		(1000 * gameData.actionTypeDetailMap[b.type]!.sortIndex + b.sortIndex),
);

export const actionTypes = Object.keys(gameData.actionTypeDetailMap);

export const milkingActions = actions.filter(a => a.type === "/action_types/milking");
export const foragingActions = actions.filter(a => a.type === "/action_types/foraging");
export const woodcuttingActions = actions.filter(a => a.type === "/action_types/woodcutting");
export const cheesemakingActions = actions.filter(a => a.type === "/action_types/cheesemaking");
export const craftingActions = actions.filter(a => a.type === "/action_types/crafting");
export const tailoringActions = actions.filter(a => a.type === "/action_types/tailoring");
export const cookingActions = actions.filter(a => a.type === "/action_types/cooking");
export const brewingActions = actions.filter(a => a.type === "/action_types/brewing");

const alchemyActions = [];

function createAlchemyActions(itemName: string, suffix: string, successRate: number, inputItems: ItemCount[], outputItems: ItemCount[], essenceDropTable: DropTableEntry[], rareDropTable: DropTableEntry[]) {
	alchemyActions.push({
		name: itemName + "(" + suffix + ")",
		type: "/action_types/alchemy",
		category: "/action_categories/alchemy/" + suffix,
		successRate: successRate,
		inputItems: [
			{
				itemHrid: "alchemy:herb",
				quantity: 1,
			},
		],
		outputItems: [
			{
				itemHrid: itemName,
				quantity: 1,
			},
		],
	},
	);
}

function getAlchemyEssenceDropTable(itemLevel: number, baseTimeCost: number) {
	const dropRate = (baseTimeCost / 36e11) * ((itemLevel + 100) / 100);
	return [{
		itemHrid: "/items/alchemy_essence",
		dropRate: dropRate,
		minCount: 1,
		maxCount: 1
	}];
}

function getAlchemyRareDropTable(itemLevel: number, baseTimeCost: number) {
	const dropRate = (1 * baseTimeCost) / (8 * 36e11);
	let itemHrid: string;
	let scale: number;

	if (itemLevel < 35) {
		itemHrid = "/items/small_artisans_crate";
		scale = (itemLevel + 100) / 100;
	} else if (itemLevel < 70) {
		itemHrid = "/items/medium_artisans_crate";
		scale = (itemLevel - 35 + 100) / 150;
	} else {
		itemHrid = "/items/large_artisans_crate";
		scale = (itemLevel - 70 + 100) / 200;
	}

	return [{
		itemHrid: itemHrid,
		dropRate: dropRate * scale,
		minCount: 1,
		maxCount: 1
	}];
}