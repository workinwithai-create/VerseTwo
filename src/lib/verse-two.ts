export const STEPS_PER_BAR = 16;
export const V1_BARS = 8;
export const V2_BARS = 8;
export const TOTAL_BARS = 16;

export type GrooveId = "after-hours" | "fold-radio" | "night-market" | "porch-light" | "carbon-copy";
export type RecipeId =
  | "answer-guitar"
  | "bass-walk"
  | "kit-open"
  | "counter-line"
  | "held-pad"
  | "extra-chair"
  | "ghost-pocket"
  | "harmony-stack"
  | "stop-then-go"
  | "new-figure";
export type ChairId = "drums" | "bass" | "piano" | "guitar" | "horn" | "strings";
export type PlayMode = "copy" | "develop" | "verse";

export interface ChordBar {
  symbol: string;
  piano: number[];
  guitar: number[];
  bass: number;
  walk: number[];
  horn: number[];
  strings: number[];
  answer: number[];
}

export interface DrumFeel {
  kick: number[];
  snare: number[];
  hat: number[];
  hatGain: number;
}

export interface Groove {
  id: GrooveId;
  name: string;
  blurb: string;
  bpm: number;
  keyName: string;
  swing: number;
  bars: ChordBar[];
  drums: DrumFeel;
}

export interface Recipe {
  id: RecipeId;
  name: string;
  blurb: string;
  chairs: ChairId[];
  punch: string;
}

export const CHAIRS: { id: ChairId; label: string; short: string }[] = [
  { id: "drums", label: "Kit", short: "K" },
  { id: "bass", label: "Upright", short: "B" },
  { id: "piano", label: "Piano", short: "P" },
  { id: "guitar", label: "Nylon", short: "G" },
  { id: "horn", label: "Lead", short: "L" },
  { id: "strings", label: "Violin", short: "V" },
];

export const RECIPES: Recipe[] = [
  {
    id: "answer-guitar",
    name: "Answer guitar",
    blurb: "Nylon fills the holes V1 left. Off-beat answers, not a second vocal.",
    chairs: ["guitar"],
    punch: "V2: nylon answers on the ands. Leave the vocal space. Do not double the topline.",
  },
  {
    id: "bass-walk",
    name: "Bass walk",
    blurb: "Upright walks a new route. V1 stays on roots.",
    chairs: ["bass"],
    punch: "V2: walking bass, four to the bar. V1 remains root on 1 and 3.",
  },
  {
    id: "kit-open",
    name: "Kit open",
    blurb: "Hats to 16ths. Crash on bar 9. Same kick pattern.",
    chairs: ["drums"],
    punch: "V2: 16th hats, crash on 1 of bar 9. Do not change the kick.",
  },
  {
    id: "counter-line",
    name: "Counter line",
    blurb: "Trumpet plays a new figure under the same topline.",
    chairs: ["horn"],
    punch: "V2: new trumpet counter on beats 2 and 4. Keep the V1 melody in the vocal.",
  },
  {
    id: "held-pad",
    name: "Held pad",
    blurb: "Violin enters and stays. V1 had air. V2 has a bed.",
    chairs: ["strings"],
    punch: "V2: strings enter on bar 9 and hold whole notes. Mute them in V1.",
  },
  {
    id: "extra-chair",
    name: "Extra chair",
    blurb: "Piano voicings go up an octave. Nylon sits in.",
    chairs: ["piano", "guitar"],
    punch: "V2: piano up an octave, nylon on 1 and 3. V1 is piano only, mid register.",
  },
  {
    id: "ghost-pocket",
    name: "Ghost pocket",
    blurb: "Snare ghosts on the e's. The groove gets a second story.",
    chairs: ["drums"],
    punch: "V2: ghost snares on 1e and 3e. Keep backbeat 2 and 4.",
  },
  {
    id: "harmony-stack",
    name: "Harmony stack",
    blurb: "Violin a third above the lead. The photocopy never stacked.",
    chairs: ["horn", "strings"],
    punch: "V2: violin a third above the trumpet figure. Not a unison.",
  },
  {
    id: "stop-then-go",
    name: "Stop then go",
    blurb: "Hits on 9 and 10. Band returns on 11. Verse 2 earns its entrance.",
    chairs: ["drums", "bass", "piano"],
    punch: "V2: stop-time hits on bar 9 and 10, full groove from bar 11.",
  },
  {
    id: "new-figure",
    name: "New figure",
    blurb: "Nylon plays a syncopated figure V1 never had.",
    chairs: ["guitar"],
    punch: "V2: guitar on 2+, 3+, 4+. Mute guitar in V1.",
  },
];

const KICK_14 = [0, 8];
const SNARE_24 = [4, 12];
const HAT_8 = [0, 2, 4, 6, 8, 10, 12, 14];
const HAT_16 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const FOUR = [0, 4, 8, 12];

function bar(
  symbol: string,
  piano: number[],
  guitar: number[],
  bass: number,
  walk: number[],
  horn: number[],
  strings: number[],
  answer: number[],
): ChordBar {
  return { symbol, piano, guitar, bass, walk, horn, strings, answer };
}

export const GROOVES: Groove[] = [
  {
    id: "after-hours",
    name: "After Hours",
    blurb: "Late R&B. V2 has to move or the night stalls.",
    bpm: 88,
    keyName: "D minor",
    swing: 0.14,
    drums: { kick: [0, 6, 8], snare: SNARE_24, hat: HAT_8, hatGain: 0.09 },
    bars: [
      bar("Dm9", [50, 53, 57, 62], [50, 57, 62], 38, [38, 41, 43, 45], [62, 65], [57, 62], [69, 65, 62]),
      bar("Gm7", [43, 50, 53, 58], [43, 50, 55], 31, [31, 34, 36, 38], [58, 62], [53, 58], [65, 62, 58]),
      bar("Bbmaj7", [46, 53, 57, 62], [46, 53, 58], 34, [34, 36, 38, 41], [58, 62], [53, 58], [65, 62, 58]),
      bar("A7", [45, 49, 52, 55], [45, 52, 57], 33, [33, 36, 37, 40], [57, 61], [52, 57], [64, 61, 57]),
      bar("Dm9", [50, 53, 57, 62], [50, 57, 62], 38, [38, 41, 43, 45], [62, 65], [57, 62], [69, 65, 62]),
      bar("Fmaj7", [41, 48, 53, 57], [41, 48, 53], 41, [41, 43, 45, 48], [53, 57], [48, 53], [65, 60, 57]),
      bar("Gm7", [43, 50, 53, 58], [43, 50, 55], 31, [31, 34, 36, 38], [58, 62], [53, 58], [65, 62, 58]),
      bar("A7", [45, 49, 52, 55], [45, 52, 57], 33, [33, 36, 37, 40], [57, 61], [52, 57], [64, 61, 57]),
    ],
  },
  {
    id: "fold-radio",
    name: "Fold Radio",
    blurb: "Pop radio. The photocopy is why verse 2 vanishes.",
    bpm: 104,
    keyName: "G major",
    swing: 0,
    drums: { kick: KICK_14, snare: SNARE_24, hat: HAT_8, hatGain: 0.08 },
    bars: [
      bar("G", [43, 47, 50, 55], [43, 47, 50], 31, [31, 33, 35, 38], [55, 59], [50, 55], [67, 64, 62]),
      bar("D", [50, 54, 57, 62], [50, 54, 57], 38, [38, 40, 42, 45], [62, 66], [54, 57], [69, 66, 62]),
      bar("Em", [40, 43, 47, 52], [40, 47, 52], 28, [28, 31, 33, 35], [59, 64], [52, 59], [64, 59, 55]),
      bar("C", [48, 52, 55, 60], [48, 52, 55], 36, [36, 38, 40, 43], [60, 64], [55, 60], [67, 64, 60]),
      bar("G", [43, 47, 50, 55], [43, 47, 50], 31, [31, 33, 35, 38], [55, 59], [50, 55], [67, 64, 62]),
      bar("Bm", [47, 50, 54, 59], [47, 54, 59], 35, [35, 38, 40, 42], [59, 66], [54, 59], [66, 62, 59]),
      bar("Am", [45, 48, 52, 57], [45, 52, 57], 33, [33, 36, 38, 40], [57, 64], [52, 57], [64, 60, 57]),
      bar("D", [50, 54, 57, 62], [50, 54, 57], 38, [38, 40, 42, 45], [62, 66], [54, 57], [69, 66, 62]),
    ],
  },
  {
    id: "night-market",
    name: "Night Market",
    blurb: "Four on the floor. V2 needs a new chair, not more volume.",
    bpm: 120,
    keyName: "A minor",
    swing: 0,
    drums: { kick: FOUR, snare: SNARE_24, hat: HAT_16, hatGain: 0.05 },
    bars: [
      bar("Am", [45, 48, 52, 57], [45, 52, 57], 33, [33, 36, 38, 40], [57, 64], [52, 57], [69, 64, 60]),
      bar("Am", [45, 48, 52, 57], [45, 52, 57], 33, [33, 31, 28, 33], [57, 64], [52, 57], [67, 64, 60]),
      bar("F", [41, 45, 48, 53], [41, 48, 53], 41, [41, 43, 45, 48], [53, 60], [48, 53], [65, 60, 57]),
      bar("G", [43, 47, 50, 55], [43, 47, 50], 31, [31, 33, 35, 38], [55, 62], [50, 55], [67, 62, 59]),
      bar("Am", [45, 48, 52, 57], [45, 52, 57], 33, [33, 36, 38, 40], [57, 64], [52, 57], [69, 64, 60]),
      bar("C", [48, 52, 55, 60], [48, 52, 55], 36, [36, 38, 40, 43], [60, 67], [55, 60], [67, 64, 60]),
      bar("Dm", [50, 53, 57, 62], [50, 57, 62], 38, [38, 41, 43, 45], [62, 65], [57, 62], [69, 65, 62]),
      bar("E7", [40, 44, 47, 52], [40, 47, 52], 28, [28, 31, 32, 35], [64, 67], [52, 56], [71, 67, 64]),
    ],
  },
  {
    id: "porch-light",
    name: "Porch Light",
    blurb: "Slow soul. The second verse is where the story turns.",
    bpm: 76,
    keyName: "E major",
    swing: 0.08,
    drums: { kick: [0, 8], snare: [8], hat: [0, 8], hatGain: 0.07 },
    bars: [
      bar("E", [40, 44, 47, 52], [40, 47, 52], 28, [28, 31, 33, 35], [64, 68], [52, 59], [71, 68, 64]),
      bar("B", [47, 51, 54, 59], [47, 54, 59], 35, [35, 38, 40, 42], [59, 66], [54, 59], [71, 66, 63]),
      bar("C#m", [49, 52, 56, 61], [49, 56, 61], 37, [37, 40, 42, 44], [61, 68], [56, 61], [73, 68, 64]),
      bar("A", [45, 49, 52, 57], [45, 52, 57], 33, [33, 36, 37, 40], [57, 64], [52, 57], [69, 64, 61]),
      bar("E", [40, 44, 47, 52], [40, 47, 52], 28, [28, 31, 33, 35], [64, 68], [52, 59], [71, 68, 64]),
      bar("G#m", [44, 47, 51, 56], [44, 51, 56], 32, [32, 35, 37, 39], [59, 63], [51, 56], [68, 63, 59]),
      bar("F#m", [42, 45, 49, 54], [42, 49, 54], 30, [30, 33, 35, 37], [61, 66], [49, 54], [66, 61, 57]),
      bar("B", [47, 51, 54, 59], [47, 54, 59], 35, [35, 38, 40, 42], [59, 66], [54, 59], [71, 66, 63]),
    ],
  },
  {
    id: "carbon-copy",
    name: "Carbon Copy",
    blurb: "Indie four-chord. Named after the problem.",
    bpm: 98,
    keyName: "C major",
    swing: 0,
    drums: { kick: [0, 7, 8], snare: SNARE_24, hat: HAT_8, hatGain: 0.07 },
    bars: [
      bar("C", [48, 52, 55, 60], [48, 52, 55], 36, [36, 38, 40, 43], [60, 64], [55, 60], [67, 64, 60]),
      bar("G", [43, 47, 50, 55], [43, 47, 50], 31, [31, 33, 35, 38], [55, 59], [50, 55], [67, 62, 59]),
      bar("Am", [45, 48, 52, 57], [45, 48, 52], 33, [33, 36, 38, 40], [57, 60], [52, 57], [64, 60, 57]),
      bar("F", [41, 45, 48, 53], [41, 45, 48], 41, [41, 43, 45, 48], [53, 57], [48, 53], [65, 60, 57]),
      bar("C", [48, 52, 55, 60], [48, 52, 55], 36, [36, 38, 40, 43], [60, 64], [55, 60], [67, 64, 60]),
      bar("Em", [40, 43, 47, 52], [40, 47, 52], 28, [28, 31, 33, 35], [59, 64], [52, 59], [64, 59, 55]),
      bar("Dm", [50, 53, 57, 62], [50, 53, 57], 38, [38, 41, 43, 45], [62, 65], [57, 62], [65, 62, 57]),
      bar("G", [43, 47, 50, 55], [43, 47, 50], 31, [31, 33, 35, 38], [55, 59], [50, 55], [67, 62, 59]),
    ],
  },
];

export function grooveById(id: GrooveId): Groove {
  return GROOVES.find((g) => g.id === id) ?? GROOVES[0];
}

export function recipeById(id: RecipeId): Recipe {
  return RECIPES.find((r) => r.id === id) ?? RECIPES[0];
}

export type MelodicHit = {
  kind: "note";
  step: number;
  inst: "piano" | "bass" | "guitar" | "trumpet" | "violin";
  midi: number;
  dur: number;
  gain: number;
};

export type DrumHit = {
  kind: "drum";
  step: number;
  pad: "kick" | "snare" | "hat" | "tom1" | "tom2" | "tom3" | "crash";
  gain: number;
};

export type Hit = MelodicHit | DrumHit;

export interface Project {
  grooveId: GrooveId;
  recipeId: RecipeId;
  muted: Record<ChairId, boolean>;
}

export const STORAGE_KEY = "versetwo.v1";

export const DEFAULT_MUTED: Record<ChairId, boolean> = {
  drums: false,
  bass: false,
  piano: false,
  guitar: false,
  horn: false,
  strings: false,
};

export const DEFAULT_PROJECT: Project = {
  grooveId: "after-hours",
  recipeId: "answer-guitar",
  muted: { ...DEFAULT_MUTED },
};

export function startStep(mode: PlayMode): number {
  return mode === "verse" ? V1_BARS * STEPS_PER_BAR : 0;
}

export function totalSteps(mode: PlayMode): number {
  return mode === "verse" ? V2_BARS * STEPS_PER_BAR : TOTAL_BARS * STEPS_PER_BAR;
}

function seated(muted: Record<ChairId, boolean>, id: ChairId) {
  return !muted[id];
}

function isV2(barIndex: number) {
  return barIndex >= V1_BARS;
}

function v1Chairs(recipe: Recipe, chair: ChairId): boolean {
  switch (recipe.id) {
    case "held-pad":
      return chair !== "strings" && chair !== "guitar";
    case "extra-chair":
      return chair !== "guitar";
    case "harmony-stack":
      return chair !== "strings";
    case "new-figure":
    case "answer-guitar":
      return chair !== "guitar";
    case "counter-line":
      return chair !== "horn";
    default:
      return chair !== "strings" && chair !== "guitar";
  }
}

function v2Chairs(recipe: Recipe, chair: ChairId, barInV2: number): boolean {
  if (recipe.id === "stop-then-go" && barInV2 < 2) {
    return chair === "drums" || chair === "bass" || chair === "piano";
  }
  switch (recipe.id) {
    case "answer-guitar":
    case "new-figure":
      return chair !== "strings";
    case "held-pad":
      return true;
    case "extra-chair":
      return true;
    case "harmony-stack":
      return true;
    case "counter-line":
      return chair !== "guitar";
    default:
      return chair !== "guitar" || recipe.chairs.includes("guitar");
  }
}

function allows(recipe: Recipe, chair: ChairId, barIndex: number, copy: boolean): boolean {
  if (copy) {
    return chair !== "strings" && chair !== "guitar";
  }
  if (!isV2(barIndex)) return v1Chairs(recipe, chair);
  return v2Chairs(recipe, chair, barIndex - V1_BARS);
}

function pushGrooveDrums(
  hits: Hit[],
  groove: Groove,
  barIndex: number,
  opts: {
    hats16?: boolean;
    ghosts?: boolean;
    crash?: boolean;
    hitsOnly?: boolean;
  },
) {
  const base = barIndex * STEPS_PER_BAR;
  if (opts.hitsOnly) {
    hits.push({ kind: "drum", step: base, pad: "kick", gain: 0.92 });
    hits.push({ kind: "drum", step: base, pad: "snare", gain: 0.48 });
    hits.push({ kind: "drum", step: base, pad: "crash", gain: 0.4 });
    return;
  }
  groove.drums.kick.forEach((s) => hits.push({ kind: "drum", step: base + s, pad: "kick", gain: 0.88 }));
  groove.drums.snare.forEach((s) => hits.push({ kind: "drum", step: base + s, pad: "snare", gain: 0.62 }));
  const hats = opts.hats16 ? HAT_16 : groove.drums.hat;
  const hatGain = opts.hats16 ? groove.drums.hatGain * 0.85 : groove.drums.hatGain;
  hats.forEach((s) => hits.push({ kind: "drum", step: base + s, pad: "hat", gain: hatGain }));
  if (opts.ghosts) {
    [1, 3, 9, 11].forEach((s) => hits.push({ kind: "drum", step: base + s, pad: "snare", gain: 0.18 }));
  }
  if (opts.crash) hits.push({ kind: "drum", step: base, pad: "crash", gain: 0.55 });
}

function pushBassRoot(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  hits.push({ kind: "note", step: base, inst: "bass", midi: chord.bass, dur: 8, gain: 0.68 });
  hits.push({ kind: "note", step: base + 8, inst: "bass", midi: chord.bass, dur: 8, gain: 0.6 });
}

function pushBassWalk(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  chord.walk.forEach((midi, i) => {
    hits.push({ kind: "note", step: base + i * 4, inst: "bass", midi, dur: 4, gain: 0.66 - i * 0.02 });
  });
}

function pushPiano(hits: Hit[], chord: ChordBar, barIndex: number, octave: number) {
  const base = barIndex * STEPS_PER_BAR;
  chord.piano.forEach((midi, i) => {
    hits.push({
      kind: "note",
      step: base,
      inst: "piano",
      midi: midi + octave,
      dur: 16,
      gain: 0.26 + i * 0.02,
    });
  });
}

function pushGuitarStrum(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  [0, 8].forEach((off) => {
    chord.guitar.forEach((midi, i) => {
      hits.push({ kind: "note", step: base + off, inst: "guitar", midi, dur: 8, gain: 0.22 + i * 0.02 });
    });
  });
}

function pushGuitarAnswer(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  const notes = chord.answer;
  [
    [6, notes[0] ?? 64, 2],
    [10, notes[1] ?? 62, 2],
    [14, notes[2] ?? 60, 2],
  ].forEach(([step, midi, dur]) => {
    hits.push({ kind: "note", step: base + step, inst: "guitar", midi, dur, gain: 0.34 });
  });
}

function pushGuitarFigure(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  const g = chord.guitar;
  [
    [6, g[0] ?? 52],
    [10, g[1] ?? 55],
    [14, g[2] ?? 59],
  ].forEach(([step, midi]) => {
    hits.push({ kind: "note", step: base + step, inst: "guitar", midi, dur: 2, gain: 0.36 });
  });
}

function pushLead(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  const a = chord.horn[0] ?? 64;
  const b = chord.horn[1] ?? a + 3;
  hits.push({ kind: "note", step: base, inst: "trumpet", midi: a, dur: 8, gain: 0.46 });
  hits.push({ kind: "note", step: base + 8, inst: "trumpet", midi: b, dur: 8, gain: 0.4 });
}

function pushCounter(hits: Hit[], chord: ChordBar, barIndex: number) {
  const base = barIndex * STEPS_PER_BAR;
  const notes = chord.answer;
  hits.push({ kind: "note", step: base + 4, inst: "trumpet", midi: notes[0] ?? 69, dur: 4, gain: 0.4 });
  hits.push({ kind: "note", step: base + 12, inst: "trumpet", midi: notes[1] ?? 65, dur: 4, gain: 0.36 });
}

function pushStrings(hits: Hit[], chord: ChordBar, barIndex: number, third = false) {
  const base = barIndex * STEPS_PER_BAR;
  if (third) {
    const a = (chord.horn[0] ?? 64) + 4;
    const b = (chord.horn[1] ?? 67) + 3;
    hits.push({ kind: "note", step: base, inst: "violin", midi: a, dur: 8, gain: 0.28 });
    hits.push({ kind: "note", step: base + 8, inst: "violin", midi: b, dur: 8, gain: 0.24 });
    return;
  }
  chord.strings.forEach((midi) => {
    hits.push({ kind: "note", step: base, inst: "violin", midi, dur: 16, gain: 0.2 });
  });
}

export function compileHits(project: Project, mode: PlayMode): Hit[] {
  const groove = grooveById(project.grooveId);
  const recipe = recipeById(project.recipeId);
  const muted = project.muted;
  const hits: Hit[] = [];
  const copy = mode === "copy";
  const origin = startStep(mode);
  const endBar = origin / STEPS_PER_BAR + totalSteps(mode) / STEPS_PER_BAR;

  for (let barIndex = origin / STEPS_PER_BAR; barIndex < endBar; barIndex += 1) {
    const chord = groove.bars[barIndex % V1_BARS];
    const v2 = isV2(barIndex) && !copy;
    const barInV2 = barIndex - V1_BARS;
    const allow = (id: ChairId) => seated(muted, id) && allows(recipe, id, barIndex, copy);

    const hitsOnly = v2 && recipe.id === "stop-then-go" && barInV2 < 2;
    const hats16 = v2 && recipe.id === "kit-open";
    const ghosts = v2 && recipe.id === "ghost-pocket";
    const crash = v2 && (recipe.id === "kit-open" || recipe.id === "stop-then-go") && barInV2 === 0;

    if (allow("drums")) {
      pushGrooveDrums(hits, groove, barIndex, { hats16, ghosts, crash, hitsOnly });
    }

    if (hitsOnly) {
      if (allow("bass")) {
        hits.push({
          kind: "note",
          step: barIndex * STEPS_PER_BAR,
          inst: "bass",
          midi: chord.bass,
          dur: 6,
          gain: 0.7,
        });
      }
      if (allow("piano")) {
        chord.piano.forEach((midi) => {
          hits.push({
            kind: "note",
            step: barIndex * STEPS_PER_BAR,
            inst: "piano",
            midi,
            dur: 6,
            gain: 0.3,
          });
        });
      }
      continue;
    }

    if (allow("bass")) {
      if (v2 && recipe.id === "bass-walk") pushBassWalk(hits, chord, barIndex);
      else pushBassRoot(hits, chord, barIndex);
    }

    if (allow("piano")) {
      const oct = v2 && recipe.id === "extra-chair" ? 12 : 0;
      pushPiano(hits, chord, barIndex, oct);
    }

    if (allow("guitar")) {
      if (v2 && recipe.id === "answer-guitar") pushGuitarAnswer(hits, chord, barIndex);
      else if (v2 && recipe.id === "new-figure") pushGuitarFigure(hits, chord, barIndex);
      else if (v2 && recipe.id === "extra-chair") pushGuitarStrum(hits, chord, barIndex);
    }

    if (allow("horn")) {
      if (v2 && recipe.id === "counter-line") {
        pushLead(hits, chord, barIndex);
        pushCounter(hits, chord, barIndex);
      } else {
        pushLead(hits, chord, barIndex);
      }
    }

    if (allow("strings")) {
      pushStrings(hits, chord, barIndex, v2 && recipe.id === "harmony-stack");
    }
  }

  return hits;
}

export function occupancy(
  project: Project,
  mode: PlayMode,
): Array<{ bar: number; label: string; chord: string; chairs: ChairId[]; kind: "v1" | "v2" }> {
  const groove = grooveById(project.grooveId);
  const recipe = recipeById(project.recipeId);
  const copy = mode === "copy";
  const rows: Array<{ bar: number; label: string; chord: string; chairs: ChairId[]; kind: "v1" | "v2" }> = [];

  for (let i = 0; i < TOTAL_BARS; i += 1) {
    const kind: "v1" | "v2" = i < V1_BARS ? "v1" : "v2";
    const chairs = CHAIRS.map((c) => c.id).filter(
      (id) => seated(project.muted, id) && allows(recipe, id, i, copy),
    );
    rows.push({
      bar: i + 1,
      label: String(i + 1),
      chord: groove.bars[i % V1_BARS].symbol,
      chairs,
      kind,
    });
  }
  return rows;
}

export function punchList(project: Project): string {
  const groove = grooveById(project.grooveId);
  const recipe = recipeById(project.recipeId);
  const muted = CHAIRS.filter((c) => project.muted[c.id]).map((c) => c.label);
  const lines = [
    `VerseTwo punch list`,
    `${groove.name} · ${groove.bpm} BPM · ${groove.keyName} · ${recipe.name}`,
    ``,
    `The problem: verse 2 is a photocopy of verse 1.`,
    `The move: ${recipe.punch}`,
    ``,
    `V1 (bars 1–8) — lean`,
    groove.bars.map((b, i) => `  ${i + 1}. ${b.symbol}`).join("\n"),
    ``,
    `V2 (bars 9–16) — developed`,
    groove.bars.map((b, i) => `  ${i + 9}. ${b.symbol} · ${recipe.name}`).join("\n"),
    ``,
    `Chairs in V2: ${recipe.chairs.map((id) => CHAIRS.find((c) => c.id === id)?.label).join(", ")}`,
    muted.length ? `Muted: ${muted.join(", ")}` : `Muted: none`,
    ``,
    `Do not raise the vocal. Do not add a second drop. Change the arrangement.`,
    `Drop the exported WAV on bars 9–16. Keep V1 as it is.`,
    ``,
    `Distinct from OpenEight (walk-in), TurnTwo (section handshake), LiftFour (pre-chorus), MuteEight (subtraction).`,
  ];
  return lines.join("\n");
}
