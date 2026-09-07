export type MelodicInst = "piano" | "bass" | "guitar" | "trumpet" | "violin";
export type DrumPad = "kick" | "snare" | "hat" | "tom1" | "tom2" | "tom3" | "crash";

export const MELODIC_NOTES: Record<MelodicInst, string[]> = {
  piano: [
    "C2",
    "E2",
    "G2",
    "A2",
    "Bb2",
    "C3",
    "Db3",
    "E3",
    "Gb3",
    "G3",
    "Ab3",
    "A3",
    "Bb3",
    "C4",
    "Db4",
    "E4",
    "Gb4",
    "G4",
    "A4",
    "Bb4",
    "C5",
    "E5",
    "G5",
    "C6",
  ],
  bass: ["E1", "G1", "A1", "Bb1", "C2", "E2", "G2", "A2", "Bb2", "C3", "E3", "G3", "A3"],
  guitar: ["E2", "A2", "B2", "D3", "E3", "G3", "A3", "B3", "D4", "E4", "G4", "A4", "B4", "E5"],
  trumpet: ["G3", "A3", "C4", "E4", "G4", "A4", "C5", "E5", "G5"],
  violin: ["G3", "A3", "C4", "E4", "G4", "A4", "C5", "E5", "G5"],
};

export const DRUM_FILES: Record<DrumPad, string> = {
  kick: "/samples/drums/kick.mp3",
  snare: "/samples/drums/snare.mp3",
  hat: "/samples/drums/hihat.mp3",
  tom1: "/samples/drums/tom1.mp3",
  tom2: "/samples/drums/tom2.mp3",
  tom3: "/samples/drums/tom3.mp3",
  crash: "/samples/drums/crash.mp3",
};

export function notePath(inst: MelodicInst, note: string) {
  return `/samples/${inst}/${note}.mp3`;
}

const NOTE_OFFSET: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export function noteNameToMidi(name: string): number {
  const m = name.match(/^([A-G])([b#]?)(-?\d+)$/);
  if (!m) throw new Error(`Bad note ${name}`);
  let n = NOTE_OFFSET[m[1]] ?? 0;
  if (m[2] === "b") n -= 1;
  if (m[2] === "#") n += 1;
  const oct = Number(m[3]);
  return (oct + 1) * 12 + n;
}

export function midiToNoteName(midi: number): string {
  const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const n = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${names[n]}${oct}`;
}
