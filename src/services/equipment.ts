import {
	type Bonuses,
	BUFF_TYPE_ACTION_SPEED,
	BUFF_TYPE_EFFICIENCY,
	BUFF_TYPE_ENHANCING_SUCCESS,
	BUFF_TYPE_GATHERING,
	BUFF_TYPE_RARE_FIND,
	BUFF_TYPE_WISDOM,
	zeroBonuses,
} from "./buffs";
import { gameData } from "./data";

export const equipmentTypes = Object.values(
	gameData.equipmentTypeDetailMap,
).sort((a, b) => a.sortIndex - b.sortIndex);

export function equipmentTypeName(hrid: string) {
	return gameData.equipmentTypeDetailMap[hrid]?.name ?? hrid;
}

export function getEquipmentBonuses(
	actionType: string,
	equipmentType: string,
	equipmentHrid: string | null,
	equipmentLevel: number,
) {
	if (equipmentHrid === null) return zeroBonuses;

	const bonuses: Bonuses = { ...zeroBonuses };
	const equipment = gameData.itemDetailMap[equipmentHrid]!;

	if (!equipment?.equipmentDetail) return bonuses;
	const stats = equipment.equipmentDetail.noncombatStats;
	if (!stats) return bonuses;

	bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.skillingEfficiency ?? 0);
	bonuses[BUFF_TYPE_ENHANCING_SUCCESS] = (bonuses[BUFF_TYPE_ENHANCING_SUCCESS] ?? 0) + (stats.enhancingSuccess ?? 0);
	bonuses[BUFF_TYPE_GATHERING] = (bonuses[BUFF_TYPE_GATHERING] ?? 0) + (stats.gatheringQuantity ?? 0);
	bonuses[BUFF_TYPE_RARE_FIND] = (bonuses[BUFF_TYPE_RARE_FIND] ?? 0) + (stats.skillingRareFind ?? 0);
	bonuses[BUFF_TYPE_WISDOM] = (bonuses[BUFF_TYPE_WISDOM] ?? 0) + (stats.skillingExperience ?? 0);

	if (actionType === "/action_types/milking") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.milkingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.milkingEfficiency ?? 0);
	}
	if (actionType === "/action_types/foraging") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.foragingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.foragingEfficiency ?? 0);
	}
	if (actionType === "/action_types/woodcutting") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.woodcuttingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.woodcuttingEfficiency ?? 0);
	}
	if (actionType === "/action_types/cheesesmithing") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.cheesesmithingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.cheesesmithingEfficiency ?? 0);
	}
	if (actionType === "/action_types/crafting") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.craftingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.craftingEfficiency ?? 0);
	}
	if (actionType === "/action_types/tailoring") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.tailoringSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.tailoringEfficiency ?? 0);
	}
	if (actionType === "/action_types/cooking") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.cookingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.cookingEfficiency ?? 0);
	}
	if (actionType === "/action_types/brewing") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.brewingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.brewingEfficiency ?? 0);
	}
	if (actionType === "/action_types/enhancing") {
		bonuses[BUFF_TYPE_ACTION_SPEED] = (bonuses[BUFF_TYPE_ACTION_SPEED] ?? 0) + (stats.enhancingSpeed ?? 0);
		bonuses[BUFF_TYPE_EFFICIENCY] = (bonuses[BUFF_TYPE_EFFICIENCY] ?? 0) + (stats.enhancingSuccess ?? 0);
	}

	const isJewelry = [
		"/equipment_types/earrings",
		"/equipment_types/rings",
		"/equipment_types/necklaces",
	].includes(equipmentType);
	const jewelryMultiplier = isJewelry ? 5 : 1;

	const multiplier =
		1 +
		0.01 *
		jewelryMultiplier *
		gameData.enhancementLevelTotalBonusMultiplierTable[equipmentLevel]!;

	for (const key of Object.keys(bonuses)) {
		bonuses[key] = (bonuses[key] ?? 0) * multiplier;
	}

	return bonuses;
}