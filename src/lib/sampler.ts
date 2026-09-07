import {
  DRUM_FILES,
  MELODIC_NOTES,
  noteNameToMidi,
  notePath,
  type DrumPad,
  type MelodicInst,
} from "./samples";

type MelodicVoice = {
  notes: { midi: number; buffer: AudioBuffer }[];
};

export class LiveBank {
  private raw = new Map<string, ArrayBuffer>();
  loaded = false;
  progress = 0;
  error: string | null = null;

  private inflight: Promise<void> | null = null;

  async fetchAll(onProgress?: (p: number) => void) {
    if (this.loaded) return;
    if (this.inflight) return this.inflight;
    this.inflight = this.fetchAllInner(onProgress);
    try {
      await this.inflight;
    } finally {
      this.inflight = null;
    }
  }

  private async fetchAllInner(onProgress?: (p: number) => void) {
    const jobs: Array<{ key: string; url: string }> = [];
    (Object.keys(MELODIC_NOTES) as MelodicInst[]).forEach((inst) => {
      MELODIC_NOTES[inst].forEach((note) => {
        jobs.push({ key: `${inst}:${note}`, url: notePath(inst, note) });
      });
    });
    (Object.keys(DRUM_FILES) as DrumPad[]).forEach((pad) => {
      jobs.push({ key: `drum:${pad}`, url: DRUM_FILES[pad] });
    });

    let done = 0;
    const failed: string[] = [];
    await Promise.all(
      jobs.map(async (job) => {
        try {
          const res = await fetch(job.url);
          if (!res.ok) throw new Error(`${res.status}`);
          const buf = await res.arrayBuffer();
          if (buf.byteLength < 500) throw new Error("empty");
          this.raw.set(job.key, buf);
        } catch {
          failed.push(job.key);
        } finally {
          done += 1;
          this.progress = done / jobs.length;
          onProgress?.(this.progress);
        }
      }),
    );
    if (this.raw.size < 20) {
      this.error = `Live chairs failed to load (${failed.length} missing).`;
      this.loaded = false;
      return;
    }
    this.loaded = true;
  }

  async decode(ctx: BaseAudioContext): Promise<DecodedBank> {
    const bank = new DecodedBank();
    await Promise.all(
      [...this.raw.entries()].map(async ([key, raw]) => {
        const copy = raw.slice(0);
        const audio = await ctx.decodeAudioData(copy);
        if (key.startsWith("drum:")) {
          bank.drums.set(key.slice(5) as DrumPad, audio);
        } else {
          const [inst, note] = key.split(":") as [MelodicInst, string];
          let voice = bank.melodic.get(inst);
          if (!voice) {
            voice = { notes: [] };
            bank.melodic.set(inst, voice);
          }
          voice.notes.push({ midi: noteNameToMidi(note), buffer: audio });
        }
      }),
    );
    bank.melodic.forEach((v) => v.notes.sort((a, b) => a.midi - b.midi));
    return bank;
  }
}

export class DecodedBank {
  melodic = new Map<MelodicInst, MelodicVoice>();
  drums = new Map<DrumPad, AudioBuffer>();

  playNote(
    ctx: BaseAudioContext,
    dest: AudioNode,
    inst: MelodicInst,
    midi: number,
    time: number,
    duration: number,
    gain: number,
  ) {
    const voice = this.melodic.get(inst);
    if (!voice || voice.notes.length === 0) return;
    let best = voice.notes[0];
    let bestDist = Math.abs(best.midi - midi);
    for (const n of voice.notes) {
      const d = Math.abs(n.midi - midi);
      if (d < bestDist) {
        best = n;
        bestDist = d;
      }
    }
    const rate = Math.pow(2, (midi - best.midi) / 12);
    const src = ctx.createBufferSource();
    src.buffer = best.buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    const peak = Math.max(0.0008, gain);
    g.gain.setValueAtTime(0.0008, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.012);
    const rel = inst === "piano" || inst === "violin" ? 0.45 : inst === "guitar" ? 0.28 : 0.16;
    const stopAt = time + Math.max(0.08, duration);
    g.gain.setValueAtTime(peak, Math.max(time + 0.02, stopAt - rel));
    g.gain.exponentialRampToValueAtTime(0.0008, stopAt);
    src.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(stopAt + 0.02);
  }

  playDrum(ctx: BaseAudioContext, dest: AudioNode, pad: DrumPad, time: number, gain: number) {
    const buffer = this.drums.get(pad);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(Math.max(0.0008, gain), time);
    if (pad === "crash") {
      g.gain.exponentialRampToValueAtTime(0.0008, time + 1.6);
    }
    src.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(time + Math.min(buffer.duration, pad === "crash" ? 1.8 : 0.9));
  }
}

export const liveBank = new LiveBank();
