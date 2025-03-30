import { gameData } from "./data";

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
export const tailoringActions = [...actions.filter(a => a.type === "/action_types/tailoring" && !a.name.includes("From")), ...actions.filter(a => a.type === "/action_types/tailoring" && a.name.includes("From"))];
export const cookingActions = actions.filter(a => a.type === "/action_types/cooking");
export const brewingActions = actions.filter(a => a.type === "/action_types/brewing");