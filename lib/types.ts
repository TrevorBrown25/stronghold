export type ResourceType = "wealth" | "supplies" | "loyalty";

export const RESOURCE_TYPES: ResourceType[] = [
  "wealth",
  "supplies",
  "loyalty"
];

export type IncomeType =
  | "Collect Taxes"
  | "Trade Commodities"
  | "Purchase Reserves"
  | "Supply Expedition";

export type ProjectTier = "standard" | "advanced" | "wonder";

export interface ProjectTemplate {
  id: string;
  name: string;
  tier: ProjectTier;
  cost: Partial<Record<ResourceType, number>>;
  turnsRequired: number;
  effects: string;
}

export interface ProjectInstance extends ProjectTemplate {
  progress: number;
  rushRisked?: boolean;
  completedTurn?: number;
  startedTurn: number;
  lastProgressTurn?: number;
}

export type RecruitmentType = "militia" | "regular" | "elite";

export interface RecruitmentOption {
  id: string;
  name: string;
  type: RecruitmentType;
  cost: Partial<Record<ResourceType, number>>;
  turnsRequired: number;
  result: string;
  requiresProjects?: string[];
}

export interface RecruitmentInstance extends RecruitmentOption {
  progress: number;
  completedTurn?: number;
  startedTurn: number;
  lastProgressTurn?: number;
}

export type MissionCategory =
  | "Military"
  | "Exploration"
  | "Diplomacy"
  | "Spy"
  | "Trade";

export type MissionScale = "Skirmish" | "Raid" | "Battle" | "Siege";

export interface Captain {
  id: string;
  name: string;
  specialty: string;
  notes?: string;
  assignedMissionId?: string | null;
  traits?: string[];
}

export type TroopStatus = "active" | "deployed" | "recovering";

export interface Troop {
  id: string;
  name: string;
  tier: "militia" | "regular" | "elite" | "unique";
  type: string;
  status: TroopStatus;
  advantages: string;
  missionsCompleted: number;
  recoveringUntilTurn?: number;
}

export interface Mission {
  id: string;
  name: string;
  category: MissionCategory;
  scale: MissionScale;
  description?: string;
  assignedCaptainId?: string;
  assignedTroopIds: string[];
  roll?: number;
  modifier: number;
  result?: string;
  consequences?: string;
  turn: number;
}

export interface EventEntry {
  id: string;
  title: string;
  description: string;
  turn: number;
  resolved: boolean;
}

export interface NoteEntry {
  id: string;
  turn: number;
  player: string;
  details: string;
}
