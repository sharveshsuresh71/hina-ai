import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Mic,
  Wrench,
  NotebookPen,
  Cpu,
  HardDrive,
  Wifi,
  BatteryCharging,
  Activity,
  Radio,
} from "lucide-react";
import { HinaOrb } from "@/components/hina-orb";
import { useHinaSettings } from "@/hooks/use-hina-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HINA OS — AI Command Center HUD" },
      {
        name: "description",
        content:
          "A heads-up display command center for HINA: live clock, telemetry rings, quick actions and instant access to chat, voice and smart tools.",
      },
      { property: "og:title", content: "HINA OS — AI Command Center HUD" },
      {
        property: "og:description",
        content: "A cinematic HUD AI operating system assistant: chat, voice, notes and utilities.",
      },
    ],
  }),
  component: Index,
});

function greeting(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
}

const quickActions = [
  { label: "Chat", to: "/chat", icon: MessageSquare, hint: "Ask HINA anything" },
  { label: "Voice", to: "/chat", icon: Mic, hint: "Speak and listen" },
  { label: "Tools", to: "/utilities", icon: Wrench, hint: "Built-in utilities" },
  { label: "Notes", to: "/notes", icon: NotebookPen, hint: "Capture and plan" },
] as const;

const metrics = [
  { label: "CPU", value: 38, icon: Cpu },
  { label: "Memory", value: 62, icon: HardDrive },
  { label: "Uplink", value: 91, icon: Wifi },
  { label: "Power", value: 76, icon: BatteryCharging },
] as const;

function Gauge({ label, value }: { label: string; value: number }) {
  const c = 2 * Math.PI * 34;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--muted)" strokeWidth="5" />
        <motion.circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text
          x="40"
          y="44"
          className="rotate-90 fill-foreground text-[16px] font-bold"
          textAnchor="middle"
          style={{ transformOrigin: "40px 40px" }}
        >
          {value}
        </text>
      </svg>
      <span className="hud-label">{label}</span>
    </div>
  );
}

function Index() {
  const { settings } = useHinaSettings();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now?.getHours() ?? 9;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute inset-3 hidden border border-primary/20 lg:block">
        <span className="absolute -left-px -top-px size-6 border-l-2 border-t-2 border-primary" />
        <span className="absolute -right-px -top-px size-6 border-r-2 border-t-2 border-primary" />
        <span className="absolute -bottom-px -left-px size-6 border-b-2 border-l-2 border-primary" />
        <span className="absolute -bottom-px -right-px size-6 border-b-2 border-r-2 border-primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_260px]">
        {/* left telemetry column */}
        <div className="order-2 space-y-4 lg:order-1">
          <section className="hud-panel p-4">
            <p className="hud-label">System status</p>
            <div className="mt-4 space-y-4">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <m.icon className="size-3.5 text-primary" />
                      {m.label}
                    </span>
                    <span className="font-display tabular-nums text-primary">{m.value}%</span>
                  </div>
                  <div className="mt-1.5 flex gap-[2px]">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className={`h-2 flex-1 ${i * 5 < m.value ? "bg-primary" : "bg-primary/15"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground">
              Simulated telemetry — a browser can't read real hardware sensors.
            </p>
          </section>

          <section className="hud-panel p-4">
            <p className="hud-label">Signal</p>
            <svg viewBox="0 0 200 60" className="mt-3 w-full text-secondary">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                points={Array.from({ length: 60 })
                  .map(
                    (_, i) =>
                      `${i * 3.4},${30 + Math.sin(i / 2.2) * 14 * Math.sin(i / 9) + (i % 7) - 3}`,
                  )
                  .join(" ")}
              />
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>DN 28 k</span>
              <span>UP 10 k</span>
            </div>
          </section>
        </div>

        {/* center core */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="order-1 flex flex-col items-center justify-center gap-6 py-6 lg:order-2"
        >
          <div className="text-center">
            <p className="hud-label">
              {greeting(hour)}, {settings.userName}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-[0.12em] text-glow sm:text-5xl">
              HINA
            </h1>
            <p className="mt-2 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Heuristic Interface · Online
            </p>
          </div>

          <HinaOrb size={320} showLabel={false} />

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-3xl font-bold tabular-nums text-primary text-glow">
                {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </p>
              <p className="hud-label mt-1">
                {now
                  ? now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })
                  : "standard time"}
              </p>
            </div>
          </div>

          <Link
            to="/chat"
            search={{ q: undefined }}
            className="glow border border-primary bg-primary/15 px-8 py-3 font-display text-xs uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-primary/30"
          >
            Engage HINA
          </Link>

          <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
              >
                <Link
                  to={action.to}
                  title={action.hint}
                  className="hud-panel flex flex-col items-center gap-2 p-3 transition-colors hover:border-primary"
                >
                  <action.icon className="size-4 text-primary" />
                  <span className="hud-label">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* right column */}
        <div className="order-3 space-y-4">
          <section className="hud-panel p-4">
            <p className="hud-label">Core load</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Gauge label="Neural" value={38} />
              <Gauge label="Cache" value={62} />
            </div>
          </section>

          <section className="hud-panel p-4">
            <p className="hud-label flex items-center gap-2">
              <Radio className="size-3" /> Command feed
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {[
                "Explain this React error",
                "Draft a follow-up email",
                "Summarize meeting notes",
                "Plan tonight's study session",
              ].map((s) => (
                <li key={s}>
                  <Link
                    to="/chat"
                    search={{ q: s }}
                    className="block border-l-2 border-primary/40 bg-primary/5 px-3 py-2 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="hud-panel flex items-center gap-3 p-4">
            <Activity className="size-4 text-secondary" />
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Uptime 00d 01:53
              <br />
              Status: connected
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
