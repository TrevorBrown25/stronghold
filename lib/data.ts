import { v4 as uuid } from "uuid";

import {
  Captain,
  ProjectTemplate,
  RecruitmentOption,
  Troop
} from "./types";

export const projectCatalog: ProjectTemplate[] = [
  // Standard projects
  {
    id: "barracks",
    name: "Barracks",
    tier: "standard",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 2,
    effects: "Recruit regular troops, military missions"
  },
  {
    id: "armory",
    name: "Armory",
    tier: "standard",
    cost: { supplies: 2 },
    turnsRequired: 2,
    effects: "Craft +1 armor"
  },
  {
    id: "blacksmith",
    name: "Blacksmith",
    tier: "standard",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 2,
    effects: "Craft +1 weapons"
  },
  {
    id: "market",
    name: "Market",
    tier: "standard",
    cost: { wealth: 2 },
    turnsRequired: 2,
    effects: "Enables trade missions, Wealth Edict"
  },
  {
    id: "granary",
    name: "Granary",
    tier: "standard",
    cost: { supplies: 2 },
    turnsRequired: 2,
    effects: "Unlocks Supplies Edict"
  },
  {
    id: "watchtowers",
    name: "Watchtowers",
    tier: "standard",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 2,
    effects: "Scout missions, recruit scouts"
  },
  {
    id: "shrine",
    name: "Shrine",
    tier: "standard",
    cost: { wealth: 1, loyalty: 1 },
    turnsRequired: 2,
    effects: "Unlocks Loyalty Edict"
  },
  {
    id: "tavern-square",
    name: "Tavern Square",
    tier: "standard",
    cost: { supplies: 1, loyalty: 1 },
    turnsRequired: 2,
    effects: "Enables festivals"
  },
  {
    id: "captains-quarters",
    name: "Captain's Quarters",
    tier: "standard",
    cost: { supplies: 2 },
    turnsRequired: 2,
    effects: "Add captains to missions & events"
  },
  {
    id: "safehouse",
    name: "Safehouse",
    tier: "standard",
    cost: { wealth: 2 },
    turnsRequired: 2,
    effects: "Spy missions, recruit spies"
  },
  {
    id: "rebel-court",
    name: "Rebel Court",
    tier: "standard",
    cost: { loyalty: 2 },
    turnsRequired: 2,
    effects: "Diplomacy missions"
  },
  // Advanced projects
  {
    id: "guildhall",
    name: "Guildhall",
    tier: "advanced",
    cost: { wealth: 2, supplies: 1 },
    turnsRequired: 3,
    effects: "+1 Work Order capacity, unlocks artisan contracts"
  },
  {
    id: "captains-quarters-upgrade",
    name: "Captain's Quarters Upgrade",
    tier: "advanced",
    cost: { wealth: 1, supplies: 2 },
    turnsRequired: 2,
    effects: "+1 Work Order capacity, improves captain morale"
  },
  {
    id: "grand-barracks",
    name: "Grand Barracks",
    tier: "advanced",
    cost: { wealth: 1, supplies: 2 },
    turnsRequired: 3,
    effects: "+1 Training Capacity"
  },
  // Wonder projects
  {
    id: "war-council",
    name: "War Council",
    tier: "wonder",
    cost: { wealth: 3, supplies: 2, loyalty: 1 },
    turnsRequired: 4,
    effects: "+1 Work Order capacity, +1 to all mission rolls"
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
