import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Pause, Play, Square } from "lucide-react";
import { engine } from "@/lib/audio-engine";
import { liveBank } from "@/lib/sampler";
import {
  CHAIRS,
  DEFAULT_MUTED,
  DEFAULT_PROJECT,
  GROOVES,
  RECIPES,
  STORAGE_KEY,
  occupancy,
  punchList,
  type ChairId,
  type GrooveId,
  type PlayMode,
  type Project,
  type RecipeId,
} from "@/lib/verse-two";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function loadProject(): Project {
  try {
    if (typeof window === "undefined") return DEFAULT_PROJECT;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as Project;
    if (!parsed.grooveId || !parsed.recipeId) throw new Error("bad");
    return {
      grooveId: parsed.grooveId,
      recipeId: parsed.recipeId,
      muted: { ...DEFAULT_MUTED, ...parsed.muted },
    };
  } catch {
    return { ...DEFAULT_PROJECT, muted: { ...DEFAULT_MUTED } };
  }
}

export function Desk() {
  const [project, setProject] = useState<Project>(DEFAULT_PROJECT);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<PlayMode | null>(null);
  const [bar, setBar] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const groove = GROOVES.find((g) => g.id === project.grooveId) ?? GROOVES[0];
  const recipe = RECIPES.find((r) => r.id === project.recipeId) ?? RECIPES[0];
  const punch = useMemo(() => punchList(project), [project]);
  const chart = useMemo(
    () => occupancy(project, mode === "copy" ? "copy" : "develop"),
    [project, mode],
  );

  useEffect(() => {
    setProject(loadProject());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    engine.setProject(project);
  }, [project, hydrated]);

  useEffect(() => {
    let gone = false;
    liveBank
      .fetchAll((p) => {
        if (!gone) setLoadPct(p);
      })
      .then(() => {
        if (gone) return;
        setReady(liveBank.loaded);
        setLoadError(liveBank.error);
      });
    return () => {
      gone = true;
    };
  }, []);

  useEffect(() => {
    return engine.subscribe((s) => {
      setPlaying(s.playing);
      setMode(s.mode);
      setBar(s.bar);
    });
  }, []);

  async function play(next: PlayMode) {
    if (!ready) return;
    engine.setProject(project);
    await engine.toggle(next);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        void play("develop");
      }
      if (e.key === "a" || e.key === "A") void play("copy");
      if (e.key === "v" || e.key === "V") void play("verse");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function patch(partial: Partial<Project>) {
    setProject((p) => ({ ...p, ...partial }));
  }

  function toggleChair(id: ChairId) {
    setProject((p) => ({ ...p, muted: { ...p.muted, [id]: !p.muted[id] } }));
  }

  async function copyPunch() {
    await navigator.clipboard.writeText(punch);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadPunch() {
    const blob = new Blob([punch], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `versetwo-${groove.id}-${recipe.id}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadWav() {
    if (!ready) return;
    setExporting(true);
    try {
      engine.setProject(project);
      const blob = await engine.exportVerseWav();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `versetwo-${groove.id}-${recipe.id}.wav`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">
              WorkinWithAI · live chairs
            </p>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">VerseTwo</h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              Second-verse development desk. Generators photocopy verse 1. Session players write a
              development: answer guitar, bass walk, kit open, held pad. Hear A copy versus B
              develop, then bounce bars 9–16.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{groove.bpm} BPM</Badge>
            <Badge variant="outline">{groove.keyName}</Badge>
            <Badge>{ready ? "Chairs seated" : `Loading ${Math.round(loadPct * 100)}%`}</Badge>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-danger">
            {loadError}
          </p>
        ) : null}

        <section className="grid gap-3">
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">Groove</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {GROOVES.map((g) => {
              const on = project.grooveId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => patch({ grooveId: g.id as GrooveId })}
                  className={cn(
                    "min-h-11 rounded-lg border px-3 py-3 text-left transition-opacity duration-150",
                    on ? "border-accent bg-raised" : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <div className="font-medium">{g.name}</div>
                  <div className="mt-1 text-xs leading-snug text-muted">{g.blurb}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3">
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">Development</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            {RECIPES.map((r) => {
              const on = project.recipeId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => patch({ recipeId: r.id as RecipeId })}
                  className={cn(
                    "min-h-11 rounded-lg border px-3 py-3 text-left transition-opacity duration-150",
                    on ? "border-accent bg-raised" : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="mt-1 text-xs leading-snug text-muted">{r.blurb}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">
              Chart · V1 is 1–8 · V2 is 9–16
            </p>
            <p className="font-mono text-xs text-muted tabular-nums">
              {`Bar ${Math.min(16, Math.max(1, bar + 1))}`}
              {playing && mode === "copy" ? " · photocopy" : null}
              {playing && mode === "develop" ? " · develop" : null}
              {playing && mode === "verse" ? " · V2 only" : null}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {chart.map((cell) => {
              const active = playing && bar + 1 === cell.bar;
              return (
                <div
                  key={`${cell.kind}-${cell.bar}`}
                  className={cn(
                    "relative rounded-md border px-2 py-3",
                    cell.kind === "v2" ? "border-v2/70 bg-raised" : "border-border bg-bg",
                    active ? "ring-1 ring-accent" : null,
                  )}
                >
                  <div className="font-mono text-xs tracking-widest text-subtle uppercase">
                    {cell.label}
                    {cell.kind === "v2" ? " · v2" : " · v1"}
                  </div>
                  <div className="mt-1 font-display text-lg leading-none">{cell.chord}</div>
                  <div className="mt-2 flex flex-wrap gap-0.5">
                    {cell.chairs.length === 0 ? (
                      <span className="text-xs text-subtle">air</span>
                    ) : (
                      cell.chairs.map((id) => (
                        <span key={id} className={cn("font-mono text-xs", cell.kind === "v2" ? "text-v2" : "text-muted")}>
                          {CHAIRS.find((c) => c.id === id)?.short}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            Copy plays verse 1 twice. Develop keeps V1 lean and writes the recipe into bars 9–16.
            Do not raise the vocal.
          </p>
        </section>

        <section className="grid gap-3">
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">Chairs</p>
          <div className="flex flex-wrap gap-2">
            {CHAIRS.map((c) => {
              const muted = project.muted[c.id];
              const featured = recipe.chairs.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChair(c.id)}
                  className={cn(
                    "h-11 rounded-full border px-4 text-sm",
                    muted
                      ? "border-border text-subtle line-through"
                      : featured
                        ? "border-accent bg-raised text-fg"
                        : "border-border-strong text-fg",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-5">
          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl">Punch list</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => void copyPunch()}>
                  <Copy className="size-3.5" />
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadPunch}>
                  <Download className="size-3.5" />
                  Text
                </Button>
              </div>
            </div>
            <Separator className="mb-3" />
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
              {punch}
            </pre>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5 lg:col-span-2">
            <h2 className="font-display text-xl">How to hear it</h2>
            <Separator className="my-3" />
            <ol className="space-y-3 text-sm leading-relaxed text-muted">
              <li>
                <span className="text-fg">A · Copy.</span> Sixteen bars. Verse 1 twice. This is the
                generator default. It loops so you can hate it properly.
              </li>
              <li>
                <span className="text-fg">B · Develop.</span> Eight lean, eight developed. Playback
                stops. The second verse earns its chair.
              </li>
              <li>
                <span className="text-fg">V · Verse only.</span> Bars 9–16, for the export WAV you
                drop on the second verse.
              </li>
            </ol>
            <p className="mt-4 text-xs text-subtle">
              Space plays B. Distinct from OpenEight (walk-in), TurnTwo (handshake), LiftFour
              (pre-chorus), MuteEight (subtraction), and FormCut (middles).
            </p>
          </section>
        </div>

        <footer className="flex flex-col gap-1 pb-2 text-xs text-subtle">
          <p>One-time $29 lifetime. Not a subscription. Sell on Lemon Squeezy, mirror on Gumroad.</p>
          <p>Live FluidR3 chairs + acoustic kit. Audio never leaves the tab.</p>
        </footer>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 px-3 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <Button
            variant={mode === "copy" && playing ? "default" : "outline"}
            onClick={() => void play("copy")}
            disabled={!ready}
          >
            {mode === "copy" && playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            A Copy
          </Button>
          <Button
            variant={mode === "develop" && playing ? "default" : "outline"}
            onClick={() => void play("develop")}
            disabled={!ready}
          >
            {mode === "develop" && playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            B Develop
          </Button>
          <Button
            variant={mode === "verse" && playing ? "default" : "outline"}
            onClick={() => void play("verse")}
            disabled={!ready}
          >
            {mode === "verse" && playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            V2
          </Button>
          <Button variant="ghost" onClick={() => engine.stop()} disabled={!playing}>
            <Square className="size-4" />
            Stop
          </Button>
          <div className="flex-1" />
          <Button onClick={() => void downloadWav()} disabled={!ready || exporting}>
            <Download className="size-4" />
            {exporting ? "Bouncing…" : "WAV"}
          </Button>
        </div>
      </div>
    </main>
  );
}
