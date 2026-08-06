import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HinaState = "idle" | "listening" | "thinking" | "speaking";

const stateLabel: Record<HinaState, string> = {
  idle: "Standing by",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

export function HinaOrb({
  state = "idle",
  size = 240,
  className,
  showLabel = true,
}: {
  state?: HinaState;
  size?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const active = state !== "idle";
  const bars = Array.from({ length: 28 });

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="relative grid place-items-center"
        style={{ width: size, height: size }}
        aria-label={`HINA ${stateLabel[state]}`}
      >
        {/* outer pulse rings */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-primary/40"
            style={{
              width: size * 0.72,
              height: size * 0.72,
              animation: `hina-pulse-ring ${active ? 2.2 : 3.6}s cubic-bezier(0.3,0,0.5,1) ${i * 0.7}s infinite`,
            }}
          />
        ))}

        {/* rotating rings */}
        <span
          className="absolute rounded-full border border-dashed border-secondary/40"
          style={{
            width: size * 0.92,
            height: size * 0.92,
            animation: "hina-spin-slow 24s linear infinite",
          }}
        />
        <span
          className="absolute rounded-full border border-accent/30"
          style={{
            width: size * 0.82,
            height: size * 0.82,
            borderStyle: "dotted",
            animation: "hina-spin-slow 16s linear reverse infinite",
          }}
        />

        {/* core */}
        <motion.div
          className="relative grid place-items-center rounded-full"
          style={{
            width: size * 0.62,
            height: size * 0.62,
            background:
              "radial-gradient(circle at 35% 30%, var(--color-primary), var(--color-secondary) 55%, var(--color-accent) 110%)",
            boxShadow: "var(--shadow-glow)",
          }}
          animate={
            state === "speaking"
              ? { scale: [1, 1.06, 0.98, 1.04, 1] }
              : state === "listening"
                ? { scale: [1, 1.09, 1] }
                : state === "thinking"
                  ? { scale: [1, 1.02, 1], rotate: [0, 6, -6, 0] }
                  : { scale: [1, 1.03, 1] }
          }
          transition={{
            duration: state === "speaking" ? 0.7 : state === "listening" ? 1.2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="absolute inset-[10%] rounded-full opacity-70 mix-blend-overlay"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, var(--color-background), transparent 60%)",
              animation: "hina-spin-slow 8s linear infinite",
            }}
          />
          {/* waveform */}
          <div className="relative flex h-1/3 items-center gap-[3px]">
            {bars.slice(0, 14).map((_, i) => {
              const base = 12 + Math.sin(i) * 6;
              return (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full bg-background/80"
                  animate={{
                    height:
                      state === "speaking"
                        ? [base * 0.4, base * 1.9, base * 0.7, base * 1.5, base * 0.4]
                        : state === "listening"
                          ? [base * 0.5, base * 1.2, base * 0.5]
                          : [base * 0.5, base * 0.7, base * 0.5],
                  }}
                  transition={{
                    duration: state === "speaking" ? 0.6 : 1.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: "easeInOut",
                  }}
                  style={{ height: base }}
                />
              );
            })}
          </div>
        </motion.div>
      </div>

      {showLabel && (
        <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              state === "speaking"
                ? "bg-accent"
                : state === "listening"
                  ? "bg-success"
                  : state === "thinking"
                    ? "bg-warning"
                    : "bg-primary",
            )}
          />
          {stateLabel[state]}
        </div>
      )}
    </div>
  );
}
