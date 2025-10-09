import { v4 as uuid } from "uuid";

import {
  Captain,
  ProjectTemplate,
  RecruitmentOption,
  Troop
} from "./types";

export const projectCatalog: ProjectTemplate[] = [
  {
    id: "guildhall",
    name: "Guildhall",
    tier: "advanced",
    cost: { wealth: 2, supplies: 1 },
    turnsRequired: 3,
    effects: "+1 Work Order capacity, unlocks artisan contracts"
  },
  {
    id: "captains-quarters",
    name: "Captain's Quarters",
    tier: "advanced",
    cost: { wealth: 1, supplies: 2 },
    turnsRequired: 2,
    effects: "+1 Work Order capacity, improves captain morale"
  },
  {
    id: "war-council",
    name: "War Council",
    tier: "wonder",
    cost: { wealth: 3, supplies: 2, loyalty: 1 },
    turnsRequired: 4,
    effects: "+1 Work Order capacity, +1 to all mission rolls"
  },
  {
    id: "town-market",
    name: "Town Market",
    tier: "standard",
    cost: { wealth: 1 },
    turnsRequired: 2,
    effects: "+1 Wealth during Income phase"
  },
  {
    id: "barracks",
    name: "Barracks",
    tier: "standard",
    cost: { supplies: 1 },
    turnsRequired: 2,
    effects: "+1 Training Capacity"
  },
  {
    id: "grand-barracks",
    name: "Grand Barracks",
    tier: "advanced",
    cost: { wealth: 1, supplies: 2 },
    turnsRequired: 3,
    effects: "+1 Training Capacity"
  }
];

export const recruitmentCatalog: RecruitmentOption[] = [
  {
    id: "militia-spears",
    name: "Militia Spear Levy",
    type: "militia",
    cost: { loyalty: 1 },
    turnsRequired: 1,
    result: "Adds a Militia infantry troop to the roster"
  },
  {
    id: "regular-archers",
    name: "Regular Archers",
    type: "regular",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 2,
    result: "Adds a Regular archer unit"
  },
  {
    id: "elite-spellknights",
    name: "Elite Spellknights",
    type: "elite",
    cost: { wealth: 2, supplies: 2 },
    turnsRequired: 3,
    result: "Adds an Elite Spellknight troop"
  }
];

export const captainRoster: Captain[] = [
  {
    id: "takk",
    name: "Takk",
    specialty: "Advantage on Battle rolls",
    notes: "Orc war leader",
    traits: ["Battle advantage"]
  },
  {
    id: "jeff",
    name: "Jeff",
    specialty: "+3 to Spy missions",
    traits: ["Spy +3"]
  },
  {
    id: "molly",
    name: "Molly",
    specialty: "Mages ignore weaknesses",
    traits: ["Mages ignore weaknesses"]
  },
  {
    id: "gundren",
    name: "Gundren",
    specialty: "+3 to defensive missions",
    traits: ["Defense +3"]
  },
  {
    id: "tricky",
    name: "Tricky",
    specialty: "Advantage on Diplomacy & Trade",
    traits: ["Diplomacy advantage", "Trade advantage"]
  }
];

export const troopRoster: Troop[] = [
  {
    id: uuid(),
    name: "Infantry",
    tier: "regular",
    type: "Infantry",
    status: "active",
    advantages: "Defense",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Shield Bearers",
    tier: "regular",
    type: "Shield",
    status: "active",
    advantages: "Hold the line",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Cavalry",
    tier: "regular",
    type: "Cavalry",
    status: "active",
    advantages: "Flanking",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Archers",
    tier: "regular",
    type: "Archers",
    status: "active",
    advantages: "Ranged support",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Mages",
    tier: "regular",
    type: "Mages",
    status: "active",
    advantages: "Arcane bombardment",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Scouts",
    tier: "regular",
    type: "Scouts",
    status: "active",
    advantages: "Reconnaissance",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Spellknights",
    tier: "elite",
    type: "Spellknights",
    status: "active",
    advantages: "Magical cavalry",
    missionsCompleted: 0
  },
  {
    id: uuid(),
    name: "Shadowblades",
    tier: "unique",
    type: "Shadowblades",
    status: "active",
    advantages: "Sabotage, stealth",
    missionsCompleted: 0
  }
];
