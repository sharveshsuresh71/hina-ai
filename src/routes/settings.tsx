import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { HinaOrb } from "@/components/hina-orb";
import { useHinaSettings } from "@/hooks/use-hina-settings";
import { useSpeech } from "@/hooks/use-speech";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HINA OS" },
      {
        name: "description",
        content:
          "Personalize HINA: your name, voice, speech rate, auto-speak replies and interface theme.",
      },
      { property: "og:title", content: "Settings — HINA OS" },
      { property: "og:description", content: "Tune HINA's voice, theme and personality." },
    ],
  }),
  component: Settings,
});

const field =
  "w-full rounded-xl border border-input bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50";

function Settings() {
  const { settings, update } = useHinaSettings();
  const speech = useSpeech({ voiceURI: settings.voiceURI, rate: settings.speechRate });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold"
      >
        <span className="text-gradient">Settings</span> & Memory
      </motion.h1>
      <p className="mt-2 text-sm text-muted-foreground">
        HINA remembers these preferences on this device.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto]">
        <section className="glass-panel space-y-6 p-6">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              What should HINA call you?
            </label>
            <input
              className={`${field} mt-2`}
              value={settings.userName}
              onChange={(e) => update({ userName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Voice
            </label>
            <select
              className={`${field} mt-2`}
              value={settings.voiceURI || "sage"}
              onChange={(e) => update({ voiceURI: e.target.value })}
            >
              {HINA_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Speech rate
              <span className="tabular-nums text-foreground">{settings.speechRate.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.1}
              value={settings.speechRate}
              onChange={(e) => update({ speechRate: Number(e.target.value) })}
              className="mt-3 w-full accent-[var(--color-primary)]"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-glass-border px-4 py-3 text-sm">
            Speak replies automatically
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => update({ autoSpeak: e.target.checked })}
              className="size-4 accent-[var(--color-primary)]"
            />
          </label>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme</p>
            <div className="mt-3 flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className={`rounded-full border px-5 py-2 text-sm capitalize ${
                    settings.theme === t
                      ? "border-primary text-primary"
                      : "border-glass-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              speech.speak(`Hello ${settings.userName}. HINA online and ready.`);
              toast.success("Testing voice");
            }}
            className="rounded-full px-6 py-2.5 text-sm font-medium text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            Test HINA's voice
          </button>
        </section>

        <div className="glass-panel grid place-items-center p-8">
          <HinaOrb size={200} state={speech.speaking ? "speaking" : "idle"} />
        </div>
      </div>
    </div>
  );
}
