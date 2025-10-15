import type { EdictType, IncomeType } from "./types";

const incomeChoices = [
  { type: "Collect Taxes", description: "+1 Wealth" },
  {
    type: "Trade Commodities",
    description: "Convert 1 Supplies into +1 Wealth"
  },
  {
    type: "Purchase Reserves",
    description: "Convert 1 Wealth into +1 Supplies"
  },
  { type: "Supply Expedition", description: "+1 Supplies" }
] as const satisfies ReadonlyArray<{ type: IncomeType; description: string }>;

export const INCOME_CHOICES = incomeChoices;

export const INCOME_EFFECT_DESCRIPTIONS: Record<IncomeType, string> =
  Object.fromEntries(
    incomeChoices.map(({ type, description }) => [type, description])
  ) as Record<IncomeType, string>;

const edictChoices = [
  { type: "Harvest", description: "+1 Supplies" },
  { type: "Trade", description: "+1 Wealth" },
  { type: "Town Hall", description: "+1 Loyalty" },
  { type: "Draft", description: "+1 Supplies, -1 Loyalty" }
] as const satisfies ReadonlyArray<{ type: EdictType; description: string }>;

export const EDICT_CHOICES = edictChoices;

export const EDICT_EFFECT_DESCRIPTIONS: Record<EdictType, string> =
  Object.fromEntries(
    edictChoices.map(({ type, description }) => [type, description])
  ) as Record<EdictType, string>;
