import { DecodedBank, liveBank } from "./sampler";
import {
  STEPS_PER_BAR,
  compileHits,
  grooveById,
  startStep,
  totalSteps,
  type PlayMode,
  type Project,
} from "./verse-two";

type Listener = (state: { playing: boolean; bar: number; step: number; mode: PlayMode | null }) => void;

function wireMaster(ctx: BaseAudioContext) {
  const bus = ctx.createGain();
  bus.gain.value = 1;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 38;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 2.8;
  comp.attack.value = 0.008;
  comp.release.value = 0.18;
  const master = ctx.createGain();
  master.gain.value = 0.28;
  bus.connect(filter);
  filter.connect(comp);
  comp.connect(master);
  master.connect(ctx.destination);
  return { bus, master };
}

export class VerseTwoEngine {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private decoded: DecodedBank | null = null;
  private timer: number | null = null;
  private playing = false;
  private nextTime = 0;
  private step = 0;
  private mode: PlayMode | null = null;
  private project: Project | null = null;
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => {
      this.listeners.delete(fn);
    };
  }

  snapshot() {
    return {
      playing: this.playing,
      bar: Math.floor(this.step / STEPS_PER_BAR),
      step: this.step,
      mode: this.mode,
    };
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  setProject(project: Project) {
    this.project = project;
  }

  async ensure() {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const { bus } = wireMaster(ctx);
      this.ctx = ctx;
      this.bus = bus;
      if (!liveBank.loaded) await liveBank.fetchAll();
      this.decoded = await liveBank.decode(ctx);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    return this.ctx;
  }

  async toggle(mode: PlayMode) {
    if (this.playing && this.mode === mode) {
      this.stop();
      return;
    }
    await this.start(mode);
  }

  async start(mode: PlayMode) {
    if (!this.project) return;
    await this.ensure();
    if (!this.ctx || !this.decoded) return;
    this.mode = mode;
    this.playing = true;
    this.step = startStep(mode);
    this.nextTime = this.ctx.currentTime + 0.06;
    this.tick();
    this.emit();
  }

  stop() {
    this.playing = false;
    this.mode = null;
    if (this.timer != null) window.clearTimeout(this.timer);
    this.timer = null;
    this.emit();
  }

  private tick = () => {
    if (!this.playing || !this.ctx || !this.project || !this.mode || !this.decoded || !this.bus) return;
    const groove = grooveById(this.project.grooveId);
    const secondsPerStep = 60 / groove.bpm / 4;
    const hits = compileHits(this.project, this.mode);
    const origin = startStep(this.mode);
    const end = origin + totalSteps(this.mode);
    const horizon = this.ctx.currentTime + 0.14;
    while (this.nextTime < horizon) {
      const sixteenth = this.step % STEPS_PER_BAR;
      const swing = groove.swing > 0 && sixteenth % 2 === 1 ? secondsPerStep * groove.swing : 0;
      this.schedule(hits, this.step, this.nextTime + swing);
      this.nextTime += secondsPerStep;
      this.step += 1;
      if (this.step >= end) {
        if (this.mode === "copy") {
          this.step = origin;
        } else {
          this.stop();
          return;
        }
      }
    }
    this.emit();
    this.timer = window.setTimeout(this.tick, 25);
  };

  private schedule(hits: ReturnType<typeof compileHits>, step: number, time: number) {
    if (!this.ctx || !this.decoded || !this.bus || !this.project) return;
    const groove = grooveById(this.project.grooveId);
    const secondsPerStep = 60 / groove.bpm / 4;
    for (const hit of hits) {
      if (hit.step !== step) continue;
      if (hit.kind === "drum") {
        this.decoded.playDrum(this.ctx, this.bus, hit.pad, time, hit.gain);
      } else {
        this.decoded.playNote(
          this.ctx,
          this.bus,
          hit.inst,
          hit.midi,
          time,
          hit.dur * secondsPerStep,
          hit.gain,
        );
      }
    }
  }

  async exportVerseWav(): Promise<Blob> {
    if (!this.project) throw new Error("No project");
    if (!liveBank.loaded) await liveBank.fetchAll();
    const sampleRate = 44100;
    const groove = grooveById(this.project.grooveId);
    const secondsPerStep = 60 / groove.bpm / 4;
    const mode: PlayMode = "verse";
    const steps = totalSteps(mode);
    const duration = steps * secondsPerStep + 1.6;
    const offline = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);
    const { bus } = wireMaster(offline);
    const decoded = await liveBank.decode(offline);
    const hits = compileHits(this.project, mode);
    const origin = startStep(mode);
    for (const hit of hits) {
      const rel = hit.step - origin;
      if (rel < 0) continue;
      const sixteenth = hit.step % STEPS_PER_BAR;
      const swing = groove.swing > 0 && sixteenth % 2 === 1 ? secondsPerStep * groove.swing : 0;
      const time = 0.05 + rel * secondsPerStep + swing;
      if (hit.kind === "drum") decoded.playDrum(offline, bus, hit.pad, time, hit.gain);
      else decoded.playNote(offline, bus, hit.inst, hit.midi, time, hit.dur * secondsPerStep, hit.gain);
    }
    const rendered = await offline.startRendering();
    return audioBufferToWav(rendered);
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = len * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  const channels = Array.from({ length: numCh }, (_, i) => buffer.getChannelData(i));
  let offset = 44;
  for (let i = 0; i < len; i += 1) {
    for (let c = 0; c < numCh; c += 1) {
      const s = Math.max(-1, Math.min(1, channels[c][i] ?? 0));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

export const engine = new VerseTwoEngine();
