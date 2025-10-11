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
    effects: "Recruit regular troops, military missions, recruitment edict"
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
    cost: { wealth: 2, supplies: 2 },
    turnsRequired: 3,
    effects: "Recruit elite troops, unlocks advanced military missions"
  },
  {
    id: "armorers-hall",
    name: "Armorer's Hall",
    tier: "advanced",
    cost: { supplies: 2, wealth: 1 },
    turnsRequired: 3,
    effects: "Craft +2 armor"
  },
  {
    id: "master-forge",
    name: "Master Forge",
    tier: "advanced",
    cost: { wealth: 2, supplies: 2 },
    turnsRequired: 3,
    effects: "Craft +2 weapons"
  },
  {
    id: "guildhall",
    name: "Guildhall",
    tier: "advanced",
    cost: { wealth: 3 },
    turnsRequired: 3,
    effects: "Market upgrade, unlocks advanced trade missions"
  },
  {
    id: "mage-tower",
    name: "Mage Tower",
    tier: "advanced",
    cost: { wealth: 2, loyalty: 1 },
    turnsRequired: 3,
    effects: "Recruit mages"
  },
  {
    id: "archery-academy",
    name: "Archery Academy",
    tier: "advanced",
    cost: { supplies: 2, wealth: 1 },
    turnsRequired: 3,
    effects: "Recruit archers"
  },
  {
    id: "diplomatic-embassy",
    name: "Diplomatic Embassy",
    tier: "advanced",
    cost: { loyalty: 2, wealth: 1 },
    turnsRequired: 3,
    effects: "Upgrade Rebel Court, unlocks advanced diplomacy missions"
  },
  {
    id: "spy-academy",
    name: "Spy Academy",
    tier: "advanced",
    cost: { wealth: 2, supplies: 1 },
    turnsRequired: 3,
    effects: "Upgrade Safehouse, +2 counter-intel, unlocks advanced spy missions"
  },
  {
    id: "hidden-grove",
    name: "Hidden Grove",
    tier: "advanced",
    cost: { supplies: 2, loyalty: 1 },
    turnsRequired: 3,
    effects: "Upgrade Watchtowers, +2 scout rolls"
  },
  {
    id: "war-council",
    name: "War Council",
    tier: "advanced",
    cost: { loyalty: 3 },
    turnsRequired: 3,
    effects: "Recruit unique elite troops"
  },
  // Wonder projects
  {
    id: "skyport",
    name: "Skyport",
    tier: "wonder",
    cost: { supplies: 3, wealth: 2, loyalty: 1 },
    turnsRequired: 6,
    effects: "Enables skyborne missions"
  },
  {
    id: "grand-cathedral",
    name: "Grand Cathedral",
    tier: "wonder",
    cost: { supplies: 1, wealth: 2, loyalty: 3 },
    turnsRequired: 6,
    effects: "Enables skyborne missions"
  },
  {
    id: "forge-of-spells",
    name: "Forge of Spells Restoration",
    tier: "wonder",
    cost: { supplies: 3, wealth: 3 },
    turnsRequired: 6,
    effects: "Unknown"
  }
];

export const recruitmentCatalog: RecruitmentOption[] = [
  {
    id: "regular-infantry",
    name: "Infantry Company",
    type: "regular",
    cost: { supplies: 2 },
    turnsRequired: 2,
    result: "Regular infantry excel against shield formations (+2) but are vulnerable to cavalry charges (-2).",
    requiresProjects: ["barracks"]
  },
  {
    id: "regular-shield",
    name: "Shield Wall",
    type: "regular",
    cost: { supplies: 1, loyalty: 1 },
    turnsRequired: 2,
    result: "Shield units blunt cavalry assaults (+2) yet struggle against disciplined infantry (-2).",
    requiresProjects: ["barracks"]
  },
  {
    id: "regular-cavalry",
    name: "Cavalry Squadron",
    type: "regular",
    cost: { wealth: 2, supplies: 1 },
    turnsRequired: 3,
    result: "Cavalry run down infantry (+2) but falter when facing shield walls (-2).",
    requiresProjects: ["barracks"]
  },
  {
    id: "regular-archers",
    name: "Archer Regiment",
    type: "regular",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 2,
    result: "Archers punish exposed cavalry (+2) but are pressured by shield troops (-2).",
    requiresProjects: ["barracks", "archery-academy"]
  },
  {
    id: "regular-mages",
    name: "Mage Circle",
    type: "regular",
    cost: { wealth: 2, loyalty: 1 },
    turnsRequired: 3,
    result: "Battle-mages shatter shields (+2) yet are prime targets for cavalry (-2).",
    requiresProjects: ["barracks", "mage-tower"]
  },
  {
    id: "regular-scouts",
    name: "Scout Detachment",
    type: "regular",
    cost: { supplies: 1, loyalty: 1 },
    turnsRequired: 1,
    result: "Scouts harry mages and archers (+2) but risk capture by cavalry, infantry, and shields (-2).",
    requiresProjects: ["barracks", "watchtowers"]
  },
  {
    id: "elite-spellknights",
    name: "Spellknights",
    type: "elite",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 3,
    result:
      "Spellknights meld Cavalry Squadrons with Mage Circles, crushing shield walls (+2) but exposed to elusive scouts (-2).",
    requiresProjects: ["barracks", "grand-barracks", "mage-tower"]
  },
  {
    id: "elite-battlemages",
    name: "Battlemages",
    type: "elite",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 3,
    result:
      "Battlemages unite Infantry Companies and Mage Circles, overwhelming shields (+2) yet vulnerable to cavalry flanking (-2).",
    requiresProjects: ["barracks", "grand-barracks", "mage-tower"]
  },
  {
    id: "elite-pathfinders",
    name: "Pathfinders",
    type: "elite",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 3,
    result:
      "Pathfinders combine Infantry Companies with Scout Detachments, neutralising mages (+2) but wary of cavalry pursuit (-2).",
    requiresProjects: ["barracks", "grand-barracks", "watchtowers"]
  },
  {
    id: "elite-cataphracts",
    name: "Cataphracts",
    type: "elite",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 3,
    result:
      "Cataphracts fuse Cavalry Squadrons with Shield Walls, devastating infantry (+2) yet slowed by concentrated mage fire (-2).",
    requiresProjects: ["barracks", "grand-barracks"]
  },
  {
    id: "elite-dreadguard",
    name: "Dreadguard",
    type: "elite",
    cost: { wealth: 1, supplies: 1 },
    turnsRequired: 3,
    result:
      "Dreadguard arise from Infantry Companies and Shield Walls, holding fast against cavalry (+2) but susceptible to mage barrages (-2).",
    requiresProjects: ["barracks", "grand-barracks"]
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
    id: "tricky",
    name: "Tricky",
    specialty: "Advantage on Diplomacy & Trade",
    traits: ["Diplomacy advantage", "Trade advantage"]
  }
];

export const troopRoster: Troop[] = [
  {
    id: uuid(),
    name: "Militia",
    tier: "militia",
    type: "Militia",
    status: "active",
    advantages: "None",
    missionsCompleted: 0
  }
];
