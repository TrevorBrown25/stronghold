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
  | "Income & Edict"
  | "Projects"
  | "Recruitment"
  | "PC Actions"
  | "Missions"
  | "Events";

export const PHASES: PhaseKey[] = [
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
  resources: Record<ResourceType, number> & {
    intel: number;
    festivalUsed: boolean;
  };
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
  spendIntel: () => boolean;
  addIntel: () => void;
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
  if (projects.some((p) => p.id.includes("captains-quarters") && p.completedTurn)) {
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
          wealth: 3,
          supplies: 3,
          loyalty: 3,
          intel: 0,
          festivalUsed: false
        },
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
        spendIntel: () => {
          const { resources } = get();
          if (resources.intel <= 0) return false;
          set({
            resources: {
              ...resources,
              intel: resources.intel - 1
            }
          });
          return true;
        },
        addIntel: () => {
          set((state) => ({
            resources: {
              ...state.resources,
              intel: Math.min(3, state.resources.intel + 1)
            }
          }));
        },
        runFestival: () => {
          const { resources } = get();
          if (resources.festivalUsed) return false;
          const cost: Partial<Record<ResourceType, number>> = {
            wealth: 1,
            supplies: 1
          };
          if (!canAfford(resources, cost)) return false;
          set({
            resources: {
              ...applyCost(resources, cost),
              loyalty: Math.min(MAX_RESOURCE, resources.loyalty + 1),
              festivalUsed: true
            }
          });
          return true;
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
                  progress: 0
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
              const progressed = Math.min(
                project.turnsRequired,
                project.progress + 1
              );
              return {
                ...project,
                progress: progressed,
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
            throw new Error("Training capacity exceeded");
          }
          set((state) => {
            if (!canAfford(state.resources, option.cost)) {
              throw new Error("Insufficient resources");
            }
            return {
              recruitments: [
                ...state.recruitments,
                {
                  ...option,
                  id: `${option.id}-${uuid()}`,
                  progress: 0
                }
              ],
              resources: applyCost(state.resources, option.cost)
            };
          });
        },
        advanceRecruitment: (id) => {
          set((state) => ({
            recruitments: state.recruitments.map((rec) => {
              if (rec.id !== id || rec.completedTurn) return rec;
              const progressed = Math.min(rec.turnsRequired, rec.progress + 1);
              return {
                ...rec,
                progress: progressed,
                completedTurn:
                  progressed >= rec.turnsRequired ? state.turn : rec.completedTurn
              };
            })
          }));
        },
        removeRecruitment: (id) => {
          set((state) => ({
            recruitments: state.recruitments.filter((rec) => rec.id !== id)
          }));
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
          set((state) => ({
            troops: state.troops.map((troop) => {
              if (troop.id !== troopId) return troop;
              const missionsCompleted = Math.max(
                0,
                troop.missionsCompleted + deltaMission
              );
              let nextStatus = status;
              if (missionsCompleted >= 2 && status !== "destroyed") {
                nextStatus = "veteran";
              }
              return {
                ...troop,
                status: nextStatus,
                missionsCompleted
              };
            })
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
            resources: {
              ...state.resources,
              festivalUsed: false
            },
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
              wealth: 3,
              supplies: 3,
              loyalty: 3,
              intel: 0,
              festivalUsed: false
            },
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
  availableRecruitment: () => recruitmentCatalog,
  availableCaptains: (state: StrongholdState) => state.captains,
  availableTroops: (state: StrongholdState) => state.troops,
  workOrderSummary: (state: StrongholdState) => ({
    used: workOrderSlots(state.projects),
    capacity: workOrderCapacity(state.projects)
  }),
  trainingSummary: (state: StrongholdState) => ({
    active: state.recruitments.filter((rec) => !rec.completedTurn).length,
    capacity: trainingCapacity(state.projects)
  })
};

export type { StrongholdState };
