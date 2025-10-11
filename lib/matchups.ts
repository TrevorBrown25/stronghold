export type Regular =
  | "Cavalry"
  | "Infantry"
  | "Shield"
  | "Mages"
  | "Archers"
  | "Militia"
  | "Scouts";

export type Elite =
  | "Spellknights"
  | "Battlemages"
  | "Pathfinders"
  | "Cataphracts"
  | "Dreadguard";

export type Troop = Regular | Elite;

export const ALL_REGULAR: Regular[] = [
  "Cavalry",
  "Infantry",
  "Shield",
  "Mages",
  "Archers",
  "Militia",
  "Scouts"
];

export const ALL_ELITE: Elite[] = [
  "Spellknights",
  "Battlemages",
  "Pathfinders",
  "Cataphracts",
  "Dreadguard"
];

export const ALL_TROOPS: Troop[] = [...ALL_REGULAR, ...ALL_ELITE];

const BEATS: Record<Regular, Regular[]> = {
  Cavalry: ["Infantry", "Mages", "Scouts"],
  Infantry: ["Shield", "Scouts"],
  Shield: ["Archers", "Scouts"],
  Mages: ["Shield"],
  Archers: ["Cavalry"],
  Militia: [],
  Scouts: ["Mages", "Archers"]
};

const ELITE: Record<Elite, [Regular, Regular]> = {
  Spellknights: ["Cavalry", "Mages"],
  Battlemages: ["Infantry", "Mages"],
  Pathfinders: ["Infantry", "Scouts"],
  Cataphracts: ["Cavalry", "Shield"],
  Dreadguard: ["Infantry", "Shield"]
};

const isElite = (troop: Troop): troop is Elite => ELITE[troop as Elite] !== undefined;

const MILITIA = "Militia" satisfies Regular;

function regularMatchup(attacker: Regular, defender: Regular): number {
  if (attacker === defender) return 0;
  if (attacker === MILITIA && defender !== MILITIA) return -2;
  if (defender === MILITIA && attacker !== MILITIA) return +2;
  if (BEATS[attacker].includes(defender)) return +2;
  if (BEATS[defender].includes(attacker)) return -2;
  return 0;
}

const expandToRegular = (troop: Troop): Regular[] =>
  isElite(troop) ? ELITE[troop] : [troop as Regular];

export function getMatchupModifier(attacker: Troop, defender: Troop): number {
  const attackerParts = expandToRegular(attacker);
  const defenderParts = expandToRegular(defender);

  let total = 0;
  for (const a of attackerParts) {
    for (const d of defenderParts) {
      total += regularMatchup(a, d);
    }
  }
  return total;
}

export function buildMatchupMatrix(): Record<Troop, Record<Troop, number>> {
  const matrix: Record<Troop, Record<Troop, number>> = {} as Record<Troop, Record<Troop, number>>;
  for (const attacker of ALL_TROOPS) {
    matrix[attacker] = {} as Record<Troop, number>;
    for (const defender of ALL_TROOPS) {
      matrix[attacker][defender] = getMatchupModifier(attacker, defender);
    }
  }
  return matrix;
}

export const isTroopType = (value: string): value is Troop =>
  (ALL_TROOPS as string[]).includes(value);

export type MatchupSummary = {
  strongAgainst: Troop[];
  weakAgainst: Troop[];
  evenWith: Troop[];
};

let cachedMatrix: Record<Troop, Record<Troop, number>> | null = null;

const getCachedMatrix = () => {
  if (!cachedMatrix) {
    cachedMatrix = buildMatchupMatrix();
  }
  return cachedMatrix;
};

export function summarizeMatchups(troop: Troop): MatchupSummary {
  const row = getCachedMatrix()[troop];
  const strongAgainst: Troop[] = [];
  const weakAgainst: Troop[] = [];
  const evenWith: Troop[] = [];
  for (const opponent of ALL_TROOPS) {
    if (troop === opponent) continue;
    const result = row[opponent];
    if (result > 0) strongAgainst.push(opponent);
    else if (result < 0) weakAgainst.push(opponent);
    else evenWith.push(opponent);
  }
  return { strongAgainst, weakAgainst, evenWith };
}

if (process.env.NODE_ENV !== "production") {
  const matrix = getCachedMatrix();

  for (const a of ALL_TROOPS) {
    for (const d of ALL_TROOPS) {
      const forward = matrix[a][d];
      const backward = matrix[d][a];
      if (forward !== -backward) {
        throw new Error(`Symmetry broken for ${a} vs ${d}`);
      }
    }
  }

  const expect = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
  };

  expect(getMatchupModifier("Archers", "Cavalry") === 2, "Archers should beat Cavalry");
  expect(getMatchupModifier("Shield", "Archers") === 2, "Shield should beat Archers");
  expect(getMatchupModifier("Scouts", "Mages") === 2, "Scouts should beat Mages");
  expect(getMatchupModifier("Scouts", "Cavalry") === -2, "Cavalry should beat Scouts");
  expect(getMatchupModifier("Cataphracts", "Scouts") === 4, "Cataphracts double up on Scouts");
  expect(
    getMatchupModifier("Militia", "Spellknights") === -4,
    "Everything should beat Militia and elite stacks should double"
  );
  expect(
    getMatchupModifier("Spellknights", "Dreadguard") === 4,
    "Spellknights should gain +4 versus Dreadguard"
  );
}
