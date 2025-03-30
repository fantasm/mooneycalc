import { gameData, type DropTableEntry, type ItemCount } from "./data";
import { type SimpleActionDetail } from "./calculation"

function createAlchemyAction(itemName: string, suffix: string, level: number, successRate: number, inputItems: ItemCount[], outputItems: ItemCount[], essenceDropTable: DropTableEntry[], rareDropTable: DropTableEntry[]): SimpleActionDetail {
	return {
		hrid: "/skills/alchemy/" + suffix + "/" + itemName,
		name: itemName + "(" + suffix + ")",
		type: "/action_types/alchemy",
		levelRequirement: { skillHrid: "/skills/alchemy", level: level },
		category: "/action_categories/alchemy/" + suffix,
		baseTimeCost: 20000000000,
		successRate: successRate,
		inputItems: inputItems,
		outputItems: outputItems,
		dropTable: [],
		essenceDropTable: essenceDropTable,
		rareDropTable: rareDropTable,
		upgradeItemHrid: "",
	} as SimpleActionDetail;
}

function getAlchemyEssenceDropTable(itemLevel: number, baseTimeCost: number) {
	const dropRate = (baseTimeCost / 36e10) * ((itemLevel + 100) / 100);
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

function initializeAlchemyActions(): SimpleActionDetail[] {
	const alchemyActions: SimpleActionDetail[] = [];

	for (const item of Object.values(gameData.itemDetailMap)) {
		if (item.alchemyDetail) {
			const essenceDropTable = getAlchemyEssenceDropTable(item.itemLevel ?? 0, 2e10);
			const rareDropTable = getAlchemyRareDropTable(item.itemLevel ?? 0, 2e10);
			if (item.alchemyDetail.isCoinifiable) {
				alchemyActions.push(createAlchemyAction(item.name, "coinify", item.itemLevel ?? 0, 0.7,
					[{ itemHrid: item.hrid, count: 1 * item.alchemyDetail.bulkMultiplier }],
					[{ itemHrid: "/items/coin", count: 5 * item.sellPrice * item.alchemyDetail.bulkMultiplier }],
					essenceDropTable, rareDropTable
				));
			}
			if (item.alchemyDetail.decomposeItems) {
				alchemyActions.push(createAlchemyAction(item.name, "decompose", item.itemLevel ?? 0, 0.6,
					[
						{ itemHrid: item.hrid, count: 1 * item.alchemyDetail.bulkMultiplier },
						{ itemHrid: "/items/coin", count: 5 * (item.itemLevel ?? 0 + 10) * item.alchemyDetail.bulkMultiplier }
					],
					item.alchemyDetail.decomposeItems.map(a => ({ ...a, count: a.count * item.alchemyDetail!.bulkMultiplier })),
					essenceDropTable, rareDropTable
				));
			}
			if (item.alchemyDetail.transmuteDropTable && item.alchemyDetail.transmuteSuccessRate) {
				alchemyActions.push(createAlchemyAction(item.name, "transmute", item.itemLevel ?? 0, item.alchemyDetail.transmuteSuccessRate,
					[
						{ itemHrid: item.hrid, count: 1 * item.alchemyDetail.bulkMultiplier },
						{ itemHrid: "/items/coin", count: Math.max(50, 0.2 * (item.sellPrice ?? 0)) * item.alchemyDetail.bulkMultiplier }
					],
					item.alchemyDetail.transmuteDropTable.map(a => ({ ...a, count: (a.maxCount + a.minCount) / 2 * a.dropRate * item.alchemyDetail!.bulkMultiplier })),
					essenceDropTable, rareDropTable
				));
			}
		}
	}

	return alchemyActions;
}

export const alchemyActions = initializeAlchemyActions();

