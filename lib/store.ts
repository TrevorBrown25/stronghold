"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";

import {
  captainRoster,
  projectCatalog,
  recruitmentCatalog,
  troopRoster
} from "./data";
import type {
  Captain,
  EventEntry,
  IncomeType,
  Mission,
  NoteEntry,
  ProjectInstance,
  ProjectTemplate,
  RecruitmentInstance,
  RecruitmentOption,
  ResourceType,
  Troop
} from "./types";

export type PhaseKey =
  | "Dashboard"
  | "Income & Edict"
  | "Projects"
  | "Recruitment"
  | "PC Actions"
  | "Missions"
  | "Events";

export const PHASES: PhaseKey[] = [
  "Dashboard",
  "Income & Edict",
  "Projects",
  "Recruitment",
  "PC Actions",
  "Missions",
  "Events"
];

interface StrongholdState {
  turn: number;
  activePhase: PhaseKey;
  resources: Record<ResourceType, number>;
  festivalUsed: boolean;
  income?: IncomeType;
  incomeTurn?: number;
  edict?: "Harvest" | "Trade" | "Town Hall" | "Draft";
  edictTurn?: number;
  projects: ProjectInstance[];
  recruitments: RecruitmentInstance[];
  captains: Captain[];
  troops: Troop[];
  missions: Mission[];
  events: EventEntry[];
  notes: NoteEntry[];
  turnHistory: string[];
  incrementResource: (resource: ResourceType, delta: number) => void;
  applyIncome: (income: StrongholdState["income"]) => void;
  applyEdict: (edict: StrongholdState["edict"]) => void;
  runFestival: () => boolean;
  startProject: (template: ProjectTemplate) => void;
  advanceProject: (id: string) => void;
  rushProject: (id: string) => { roll: number; success: boolean } | null;
  removeProject: (id: string) => void;
  startRecruitment: (option: RecruitmentOption) => void;
  advanceRecruitment: (id: string) => void;
  removeRecruitment: (id: string) => void;
  addMission: (mission: Omit<Mission, "id" | "turn">) => void;
  updateMission: (missionId: string, updates: Partial<Mission>) => void;
  resolveMissionRoll: (missionId: string, modifier: number) => void;
  deleteMission: (missionId: string) => void;
  toggleCaptainAssignment: (missionId: string, captainId: string) => void;
  toggleTroopAssignment: (missionId: string, troopId: string) => void;
  updateTroopStatus: (troopId: string, status: Troop["status"], deltaMission?: number) => void;
  removeTroop: (troopId: string) => void;
  addEvent: (entry: Omit<EventEntry, "id" | "turn">) => void;
  toggleEventResolved: (id: string) => void;
  addNote: (note: Omit<NoteEntry, "id" | "turn">) => void;
  setPhase: (phase: PhaseKey) => void;
  nextPhase: () => void;
  completeTurn: () => void;
  exportState: () => string;
  resetCampaign: () => void;
}

const MAX_RESOURCE = 5;
const MIN_RESOURCE = 0;

type PersistedStrongholdState = Omit<StrongholdState, "turnHistory">;

const storage = typeof window !== "undefined"
  ? createJSONStorage<PersistedStrongholdState>(() => localStorage)
  : undefined;

const baseWorkOrderCapacity = 2;
const baseTrainingCapacity = 1;

const STARTING_RESOURCES: Record<ResourceType, number> = {
  wealth: 2,
  supplies: 2,
  loyalty: 1
};

const INCOME_EFFECTS: Record<IncomeType, Partial<Record<ResourceType, number>>> = {
  "Collect Taxes": { wealth: 1 },
  "Trade Commodities": { wealth: 1, supplies: -1 },
  "Purchase Reserves": { wealth: -1, supplies: 1 },
  "Supply Expedition": { supplies: 1 }
};

function applyCost(
  resources: StrongholdState["resources"],
  cost: Partial<Record<ResourceType, number>>
) {
  const updated = { ...resources };
  for (const key of Object.keys(cost) as ResourceType[]) {
    updated[key] = Math.max(
      MIN_RESOURCE,
      Math.min(MAX_RESOURCE, updated[key] - (cost[key] ?? 0))
    );
  }
  return updated;
}

function refundCost(
  resources: StrongholdState["resources"],
  refund: Partial<Record<ResourceType, number>>
) {
  const updated = { ...resources };
  for (const key of Object.keys(refund) as ResourceType[]) {
    updated[key] = Math.max(
      MIN_RESOURCE,
      Math.min(MAX_RESOURCE, updated[key] + (refund[key] ?? 0))
    );
  }
  return updated;
}

function canAfford(
  resources: StrongholdState["resources"],
  cost: Partial<Record<ResourceType, number>>
) {
  return (Object.keys(cost) as ResourceType[]).every(
    (resource) => (resources[resource] ?? 0) >= (cost[resource] ?? 0)
  );
}

function workOrderSlots(projects: ProjectInstance[]): number {
  const active = projects.filter((p) => !p.completedTurn);
  return active.reduce((slots, project) => {
    switch (project.tier) {
      case "wonder":
        return slots + 3;
      case "advanced":
        return slots + 2;
      default:
        return slots + 1;
    }
  }, 0);
}

function workOrderCapacity(projects: ProjectInstance[]): number {
  let capacity = baseWorkOrderCapacity;
  if (projects.some((p) => p.id.includes("guildhall") && p.completedTurn)) {
    capacity += 1;
  }
  if (
    projects.some((p) => p.id.includes("captains-quarters-upgrade") && p.completedTurn)
  ) {
    capacity += 1;
  }
  if (projects.some((p) => p.id.includes("war-council") && p.completedTurn)) {
    capacity += 1;
  }
  return capacity;
}

function trainingCapacity(projects: ProjectInstance[]): number {
  let capacity = baseTrainingCapacity;
  if (projects.some((p) => p.id.includes("barracks") && p.completedTurn)) {
    capacity += 1;
  }
  if (projects.some((p) => p.id.includes("grand-barracks") && p.completedTurn)) {
    capacity += 1;
  }
  return capacity;
}

function hasCompletedProject(projects: ProjectInstance[], templateId: string): boolean {
  return projects.some((project) => project.id.includes(templateId) && project.completedTurn);
}

function meetsProjectRequirements(
  projects: ProjectInstance[],
  required?: string[]
): boolean {
  if (!required || required.length === 0) {
    return true;
  }
  return required.every((templateId) => hasCompletedProject(projects, templateId));
}

function createTroopFromRecruitment(option: RecruitmentOption): Troop {
  return {
    id: uuid(),
    name: option.name,
    tier: option.type,
    type: option.name,
    status: "active",
    advantages: option.result,
    missionsCompleted: 0
  };
}

function determineMissionResult(total: number): string {
  if (total >= 23) return "Critical Success";
  if (total >= 17) return "Success";
  if (total >= 13) return "Success with Consequences";
  return "Failure";
}

export const useStrongholdStore = create<StrongholdState>()(
  devtools(
    persist<StrongholdState, [], [], PersistedStrongholdState>(
      (set, get) => ({
        turn: 1,
        activePhase: PHASES[0],
        resources: {
          wealth: 2,
          supplies: 2,
          loyalty: 1
        },
        festivalUsed: false,
        income: undefined,
        incomeTurn: undefined,
        edict: undefined,
        edictTurn: undefined,
        projects: [],
        recruitments: [],
        captains: captainRoster,
        troops: troopRoster,
        missions: [],
        events: [],
        notes: [],
        turnHistory: [],
        incrementResource: (resource, delta) => {
          set((state) => {
            const next = Math.max(
              MIN_RESOURCE,
              Math.min(MAX_RESOURCE, state.resources[resource] + delta)
            );
            return {
              resources: {
                ...state.resources,
                [resource]: next
              }
            };
          });
        },
        runFestival: () => {
          const { resources, festivalUsed } = get();
          if (festivalUsed) return false;
          const cost: Partial<Record<ResourceType, number>> = {
            wealth: 1,
            supplies: 1
          };
          if (!canAfford(resources, cost)) return false;
          set({
            resources: {
              ...applyCost(resources, cost),
              loyalty: Math.min(MAX_RESOURCE, resources.loyalty + 1)
            },
            festivalUsed: true
          });
          return true;
        },
        applyIncome: (income) => {
          if (!income) return;
          set((state) => {
            if (state.incomeTurn === state.turn) {
              return { income };
            }
            const adjustments = INCOME_EFFECTS[income] ?? {};
            const cost: Partial<Record<ResourceType, number>> = {};
            for (const [resource, value] of Object.entries(adjustments) as [
              ResourceType,
              number
            ][]) {
              if (value < 0) {
                cost[resource] = Math.abs(value);
              }
            }
            if (!canAfford(state.resources, cost)) {
              return {};
            }
            const adjusted = { ...state.resources };
            for (const [key, value] of Object.entries(adjustments) as [
              ResourceType,
              number
            ][]) {
              adjusted[key] = Math.max(
                MIN_RESOURCE,
                Math.min(MAX_RESOURCE, adjusted[key] + value)
              );
            }
            return {
              income,
              incomeTurn: state.turn,
              resources: adjusted
            };
          });
        },
        applyEdict: (edict) => {
          if (!edict) return;
          set((state) => {
            if (state.edictTurn === state.turn) {
              return { edict };
            }
            const resourceChanges: Partial<Record<ResourceType, number>> = {};
            switch (edict) {
              case "Harvest":
                resourceChanges.supplies = 1;
                break;
              case "Trade":
                resourceChanges.wealth = 1;
                break;
              case "Town Hall":
                resourceChanges.loyalty = 1;
                break;
              case "Draft":
                resourceChanges.supplies = 1;
                resourceChanges.loyalty = -1;
                break;
            }
            const adjusted = { ...state.resources };
            for (const [key, value] of Object.entries(resourceChanges) as [
              ResourceType,
              number
            ][]) {
              adjusted[key] = Math.max(
                MIN_RESOURCE,
                Math.min(MAX_RESOURCE, adjusted[key] + value)
              );
            }
            return {
              edict,
              edictTurn: state.turn,
              resources: adjusted
            };
          });
        },
        startProject: (template) => {
          const { projects } = get();
          const capacity = workOrderCapacity(projects);
          const slotsUsed = workOrderSlots(projects);
          const templateSlots = template.tier === "wonder" ? 3 : template.tier === "advanced" ? 2 : 1;
          if (slotsUsed + templateSlots > capacity) {
            throw new Error("Work order capacity exceeded");
          }
          set((state) => {
            if (!canAfford(state.resources, template.cost)) {
              throw new Error("Insufficient resources");
            }
            return {
              projects: [
                ...state.projects,
                {
                  ...template,
                  id: `${template.id}-${uuid()}`,
                  progress: 0,
                  startedTurn: state.turn
                }
              ],
              resources: applyCost(state.resources, template.cost)
            };
          });
        },
        advanceProject: (id) => {
          set((state) => ({
            projects: state.projects.map((project) => {
              if (project.id !== id || project.completedTurn) return project;

              if (state.turn <= project.startedTurn) {
                return project;
              }

              if (project.lastProgressTurn === state.turn) {
                return project;
              }

              const progressed = Math.min(
                project.turnsRequired,
                project.progress + 1
              );
              return {
                ...project,
                progress: progressed,
                lastProgressTurn: state.turn,
                completedTurn:
                  progressed >= project.turnsRequired
                    ? state.turn
                    : project.completedTurn
              };
            })
          }));
        },
        rushProject: (id) => {
          const state = get();
          const target = state.projects.find((project) => project.id === id);
          if (!target || target.completedTurn) return null;
          if (state.turn <= target.startedTurn) return null;
          if (target.lastProgressTurn === state.turn) return null;
          if (!canAfford(state.resources, { wealth: 1 })) return null;
          const roll = Math.floor(Math.random() * 12) + 1 + Math.floor(Math.random() * 12) + 1;
          const success = roll >= 13;
          set({
            resources: applyCost(state.resources, { wealth: 1 }),
            projects: state.projects.map((project) => {
              if (project.id !== id) return project;
              if (!success) {
                return {
                  ...project,
                  rushRisked: true
                };
              }
              const progressed = Math.min(
                project.turnsRequired,
                project.progress + 1
              );
              return {
                ...project,
                rushRisked: true,
                progress: progressed,
                lastProgressTurn: state.turn,
                completedTurn:
                  progressed >= project.turnsRequired ? state.turn : project.completedTurn
              };
            })
          });
          return { roll, success };
        },
        removeProject: (id) => {
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id)
          }));
        },
        startRecruitment: (option) => {
          const { recruitments, projects } = get();
          const active = recruitments.filter((rec) => !rec.completedTurn).length;
          const capacity = trainingCapacity(projects);
          if (active >= capacity) {
            throw new Error("Recruitment capacity exceeded");
          }
          if (!meetsProjectRequirements(projects, option.requiresProjects)) {
            throw new Error("Required project not completed");
          }
          set((state) => {
            if (!canAfford(state.resources, option.cost)) {
              throw new Error("Insufficient resources");
            }

            const id = `${option.id}-${uuid()}`;
            const isMilitia = option.type === "militia";
            let recruitment: RecruitmentInstance = {
              ...option,
              id,
              progress: isMilitia ? option.turnsRequired : 0,
              startedTurn: state.turn,
              ...(isMilitia
                ? { completedTurn: state.turn, lastProgressTurn: state.turn }
                : {})
            };

            if (isMilitia) {
              const troop = createTroopFromRecruitment(option);
              recruitment = {
                ...recruitment,
                convertedTroopId: troop.id
              };
              return {
                recruitments: [...state.recruitments, recruitment],
                resources: applyCost(state.resources, option.cost),
                troops: [...state.troops, troop]
              };
            }

            return {
              recruitments: [...state.recruitments, recruitment],
              resources: applyCost(state.resources, option.cost)
            };
          });
        },
        advanceRecruitment: (id) => {
          set((state) => {
            const newTroops: Troop[] = [];
            const recruitments = state.recruitments.map((rec) => {
              if (rec.id !== id || rec.completedTurn) return rec;

              if (state.turn <= rec.startedTurn) {
                return rec;
              }

              if (rec.lastProgressTurn === state.turn) {
                return rec;
              }
              const progressed = Math.min(rec.turnsRequired, rec.progress + 1);
              const isComplete = progressed >= rec.turnsRequired;
              const updated: RecruitmentInstance = {
                ...rec,
                progress: progressed,
                completedTurn: isComplete ? state.turn : rec.completedTurn,
                lastProgressTurn: state.turn,
                convertedTroopId: rec.convertedTroopId
              };
              if (isComplete && !rec.convertedTroopId) {
                const troop = createTroopFromRecruitment(rec);
                newTroops.push(troop);
                updated.convertedTroopId = troop.id;
              }
              return updated;
            });

            if (newTroops.length === 0) {
              return { recruitments };
            }

            return {
              recruitments,
              troops: [...state.troops, ...newTroops]
            };
          });
        },
        removeRecruitment: (id) => {
          set((state) => {
            const target = state.recruitments.find(
              (rec) => rec.id === id && !rec.completedTurn
            );
            const remaining = state.recruitments.filter((rec) => rec.id !== id);
            if (!target) {
              return { recruitments: remaining };
            }
            return {
              recruitments: remaining,
              resources: refundCost(state.resources, target.cost)
            };
          });
        },
        addMission: (mission) => {
          set((state) => ({
            missions: [
              ...state.missions,
              {
                ...mission,
                id: uuid(),
                turn: state.turn
              }
            ]
          }));
        },
        updateMission: (missionId, updates) => {
          set((state) => ({
            missions: state.missions.map((mission) =>
              mission.id === missionId ? { ...mission, ...updates } : mission
            )
          }));
        },
        resolveMissionRoll: (missionId, modifier) => {
          set((state) => ({
            missions: state.missions.map((mission) => {
              if (mission.id !== missionId) return mission;
              const roll = Math.floor(Math.random() * 12) + 1 + Math.floor(Math.random() * 12) + 1;
              const total = roll + modifier;
              return {
                ...mission,
                roll,
                modifier,
                result: determineMissionResult(total)
              };
            })
          }));
        },
        deleteMission: (missionId) => {
          set((state) => ({
            missions: state.missions.filter((mission) => mission.id !== missionId),
            captains: state.captains.map((captain) =>
              captain.assignedMissionId === missionId
                ? { ...captain, assignedMissionId: null }
                : captain
            )
          }));
        },
        toggleCaptainAssignment: (missionId, captainId) => {
          set((state) => {
            const captain = state.captains.find((c) => c.id === captainId);
            const alreadyAssigned = captain?.assignedMissionId === missionId;
            const newAssignment = alreadyAssigned ? null : missionId;
            return {
              captains: state.captains.map((c) =>
                c.id === captainId ? { ...c, assignedMissionId: newAssignment } : c
              ),
              missions: state.missions.map((mission) => {
                if (mission.id === missionId) {
                  const missionHasCaptain = mission.assignedCaptainId === captainId;
                  return {
                    ...mission,
                    assignedCaptainId: missionHasCaptain ? undefined : captainId
                  };
                }
                if (!alreadyAssigned && mission.assignedCaptainId === captainId) {
                  return { ...mission, assignedCaptainId: undefined };
                }
                return mission;
              })
            };
          });
        },
        toggleTroopAssignment: (missionId, troopId) => {
          set((state) => ({
            missions: state.missions.map((mission) => {
              if (mission.id !== missionId) return mission;
              const isAssigned = mission.assignedTroopIds.includes(troopId);
              return {
                ...mission,
                assignedTroopIds: isAssigned
                  ? mission.assignedTroopIds.filter((id) => id !== troopId)
                  : [...mission.assignedTroopIds, troopId]
              };
            })
          }));
        },
        updateTroopStatus: (troopId, status, deltaMission = 0) => {
          const currentTurn = get().turn;
          set((state) => ({
            troops: state.troops.map((troop) => {
              if (troop.id !== troopId) return troop;

              const isRecoveringLocked =
                troop.status === "recovering" &&
                troop.recoveringUntilTurn !== undefined &&
                currentTurn <= troop.recoveringUntilTurn &&
                status !== "recovering";

              if (isRecoveringLocked) {
                return troop;
              }

              const missionsCompleted = Math.max(
                0,
                troop.missionsCompleted + deltaMission
              );

              const recoveringUntilTurn =
                status === "recovering"
                  ? currentTurn + 1
                  : undefined;

              return {
                ...troop,
                status,
                missionsCompleted,
                recoveringUntilTurn
              };
            })
          }));
        },
        removeTroop: (troopId) => {
          set((state) => ({
            troops: state.troops.filter((troop) => troop.id !== troopId)
          }));
        },
        addEvent: (entry) => {
          set((state) => ({
            events: [
              ...state.events,
              {
                ...entry,
                id: uuid(),
                turn: state.turn
              }
            ]
          }));
        },
        toggleEventResolved: (id) => {
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id ? { ...event, resolved: !event.resolved } : event
            )
          }));
        },
        addNote: (note) => {
          set((state) => ({
            notes: [
              ...state.notes,
              {
                ...note,
                id: uuid(),
                turn: state.turn
              }
            ]
          }));
        },
        setPhase: (phase) => set({ activePhase: phase }),
        nextPhase: () => {
          const { activePhase } = get();
          const index = PHASES.findIndex((phase) => phase === activePhase);
          const nextIndex = (index + 1) % PHASES.length;
          set({ activePhase: PHASES[nextIndex] });
        },
        completeTurn: () => {
          const state = get();
          const summary = `Turn ${state.turn} summary: ${state.missions.length} missions, ${state.projects.length} projects.`;
          set({
            turn: state.turn + 1,
            activePhase: PHASES[0],
            missions: state.missions.map((mission) => ({
              ...mission,
              assignedCaptainId: undefined,
              assignedTroopIds: [],
              roll: undefined,
              result: mission.result,
              consequences: mission.consequences
            })),
            captains: state.captains.map((captain) => ({
              ...captain,
              assignedMissionId: null
            })),
            resources: { ...state.resources },
            festivalUsed: false,
            turnHistory: [...state.turnHistory, summary]
          });
        },
        exportState: () => {
          const state = get();
          return JSON.stringify(state, null, 2);
        },
        resetCampaign: () => {
          set({
            turn: 1,
            activePhase: PHASES[0],
            resources: {
              wealth: 2,
              supplies: 2,
              loyalty: 1
            },
            festivalUsed: false,
            income: undefined,
            incomeTurn: undefined,
            edict: undefined,
            edictTurn: undefined,
            projects: [],
            recruitments: [],
            captains: captainRoster,
            troops: troopRoster,
            missions: [],
            events: [],
            notes: [],
            turnHistory: []
          });
        }
      }),
      {
        name: "stronghold-store",
        storage,
        partialize: ({ turnHistory, ...rest }): PersistedStrongholdState => rest
      }
    )
  )
);

export const selectors = {
  availableProjects: () => projectCatalog,
  availableRecruitment: (state: StrongholdState) =>
    recruitmentCatalog.filter((option) => {
      if (!meetsProjectRequirements(state.projects, option.requiresProjects)) {
        return false;
      }

      if (option.type === "elite") {
        const hasTroop = state.troops.some(
          (troop) => troop.type === option.name && troop.tier === "elite"
        );
        if (hasTroop) {
          return false;
        }

        const inProgress = state.recruitments.some(
          (rec) =>
            rec.type === "elite" &&
            rec.name === option.name &&
            !rec.completedTurn
        );

        if (inProgress) {
          return false;
        }
      }

      return true;
    }),
  availableCaptains: (state: StrongholdState) => state.captains,
  availableTroops: (state: StrongholdState) => state.troops,
  workOrderSummary: (state: StrongholdState) => ({
    used: workOrderSlots(state.projects),
    capacity: workOrderCapacity(state.projects)
  }),
  recruitmentSummary: (state: StrongholdState) => {
    const inProgress = state.recruitments.filter((rec) => !rec.completedTurn).length;
    const troopById = new Map(state.troops.map((troop) => [troop.id, troop]));
    const matchedFallbackTroops = new Set<string>();
    const ready = state.recruitments.reduce((count, rec) => {
      if (!rec.completedTurn) {
        return count;
      }

      if (rec.convertedTroopId) {
        const troop = troopById.get(rec.convertedTroopId);
        if (troop) {
          matchedFallbackTroops.add(troop.id);
        }
        if (troop?.status === "active") {
          return count + 1;
        }
        return count;
      }

      const fallbackTroop = state.troops.find((troop) => {
        if (matchedFallbackTroops.has(troop.id)) return false;
        return troop.name === rec.name && troop.tier === rec.type;
      });

      if (!fallbackTroop) {
        return count;
      }

      matchedFallbackTroops.add(fallbackTroop.id);
      if (fallbackTroop.status === "active") {
        return count + 1;
      }
      return count;
    }, 0);
    return {
      inProgress,
      ready,
      capacity: trainingCapacity(state.projects)
    };
  },
  readyForces: (state: StrongholdState) => {
    const readyTroops = state.troops.filter((troop) => troop.status === "active");
    return readyTroops.length;
  }
};

export { STARTING_RESOURCES };
export type { StrongholdState };
