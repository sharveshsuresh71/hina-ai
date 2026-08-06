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
} from "lucide-react";
import { HinaOrb } from "@/components/hina-orb";
import { useHinaSettings } from "@/hooks/use-hina-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HINA OS — Your AI Command Center" },
      {
        name: "description",
        content:
          "Greet HINA, your futuristic AI assistant. Live clock, quick actions, system status and instant access to chat, voice and smart tools.",
      },
      { property: "og:title", content: "HINA OS — Your AI Command Center" },
      {
        property: "og:description",
        content: "A cinematic AI operating system assistant: chat, voice, notes and utilities.",
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
  { label: "Start a chat", to: "/chat", icon: MessageSquare, hint: "Ask HINA anything" },
  { label: "Voice mode", to: "/chat", icon: Mic, hint: "Speak and listen" },
  { label: "Smart tools", to: "/utilities", icon: Wrench, hint: "8 built-in utilities" },
  { label: "Notes & tasks", to: "/notes", icon: NotebookPen, hint: "Capture and plan" },
] as const;

const metrics = [
  { label: "Neural load", value: 38, icon: Cpu, tone: "text-primary" },
  { label: "Memory", value: 62, icon: HardDrive, tone: "text-secondary" },
  { label: "Uplink", value: 91, icon: Wifi, tone: "text-success" },
  { label: "Power", value: 76, icon: BatteryCharging, tone: "text-warning" },
] as const;

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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel grid gap-10 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-primary">
            {greeting(hour)}, {settings.userName}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
            I am <span className="text-gradient">HINA</span>.
            <br />
            How can I assist you?
          </h1>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            Your intelligent desktop companion — ask questions, explain code, draft anything, or
            just talk. Voice in, voice out.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/chat"
              className="glow rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Talk to HINA
            </Link>
            <div className="rounded-full border border-glass-border bg-glass px-5 py-3">
              <p className="font-display text-lg font-bold tabular-nums">
                {now
                  ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "--:--"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {now
                  ? now.toLocaleDateString([], {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <HinaOrb size={280} className="mx-auto" />
      </motion.section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <Link
              to={action.to}
              className="glass-panel group flex h-full flex-col gap-3 p-5 transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <action.icon className="size-5 text-primary" />
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.hint}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="glass-panel p-6">
          <h2 className="font-display text-sm uppercase tracking-[0.24em] text-muted-foreground">
            System status
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <m.icon className={`size-4 ${m.tone}`} />
                    {m.label}
                  </span>
                  <span className="tabular-nums">{m.value}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] text-muted-foreground">
            Simulated telemetry — a browser can't read real hardware sensors.
          </p>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Suggestions
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              "Explain this error I'm getting in React",
              "Draft a polite follow-up email",
              "Summarize these meeting notes",
              "Plan my study session for tonight",
            ].map((s) => (
              <li key={s}>
                <Link
                  to="/chat"
                  search={{ q: s }}
                  className="block rounded-xl border border-glass-border/60 px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
