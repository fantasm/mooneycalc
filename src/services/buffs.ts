import { gameData } from "./data";

export const buffTypes = Object.values(gameData.buffTypeDetailMap).sort(
  (a, b) => a.sortIndex - b.sortIndex,
);
export const BUFF_TYPE_ACTION_SPEED = "/buff_types/action_speed";
export const BUFF_TYPE_EFFICIENCY = "/buff_types/efficiency";
export const BUFF_TYPE_ENHANCING_SUCCESS = "/buff_types/enhancing_success";
export const BUFF_TYPE_GATHERING = "/buff_types/gathering";
export const BUFF_TYPE_TASK_SPEED = "/buff_types/task_speed";
export const BUFF_TYPE_RARE_FIND = "/buff_types/rare_find";
export const BUFF_TYPE_WISDOM = "/buff_types/wisdom";
export const BUFF_TYPE_PROCESSING = "/buff_types/processing";
export const BUFF_TYPE_GOURMET = "/buff_types/gourmet";
export const BUFF_TYPE_ARTISAN = "/buff_types/artisan";
export const BUFF_TYPE_ACTION_LEVEL = "/buff_types/action_level";

export type Bonuses = Record<string, number>;

export const zeroBonuses: Bonuses = Object.fromEntries(
  buffTypes.map((buffType) => [buffType.hrid, 0]),
);

export function addBonuses(...effects: Bonuses[]) {
  const result: Bonuses = { ...zeroBonuses };
  for (const effect of effects) {
    for (const [key, value] of Object.entries(effect)) {
      result[key]! += value;
    }
  }
  return result;
}

export function getLevelBonus(skillHrid: string, bonuses: Bonuses) {
  const skillToBonusMap: Record<string, string> = {
    "/skills/milking": "/buff_types/milking_level",
    "/skills/foraging": "/buff_types/foraging_level",
    "/skills/woodcutting": "/buff_types/woodcuttinglevel",
    "/skills/cheesesmithing": "/buff_types/cheesesmithing_level",
    "/skills/crafting": "/buff_types/crafting_level",
    "/skills/tailoring": "/buff_types/tailoring_level",
    "/skills/cooking": "/buff_types/cooking_level",
    "/skills/brewing": "/buff_types/brewing_level",
    "/skills/enhancing": "/buff_types/enhancing_level",
  };

  const bonusName = skillToBonusMap[skillHrid];

  if (bonusName === undefined) {
    console.warn(`No level bonus for skill ${skillHrid}`);
    return 0;
  }

  return bonuses[bonusName] ?? 0;
}
