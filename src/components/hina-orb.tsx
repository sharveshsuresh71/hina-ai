import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HinaState = "idle" | "listening" | "thinking" | "speaking";

const stateLabel: Record<HinaState, string> = {
  idle: "Standing by",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

/**
 * Arc-reactor style HUD core inspired by heads-up display interfaces:
 * segmented rings, tick marks and a glowing center.
 */
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
  const ticks = Array.from({ length: 60 });
  const segments = Array.from({ length: 12 });

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="relative grid place-items-center"
        style={{ width: size, height: size }}
        aria-label={`HINA ${stateLabel[state]}`}
      >
        {/* pulse rings */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-primary/50"
            style={{
              width: size * 0.66,
              height: size * 0.66,
              animation: `hina-pulse-ring ${active ? 2.2 : 3.6}s cubic-bezier(0.3,0,0.5,1) ${i * 0.7}s infinite`,
            }}
          />
        ))}

        {/* tick ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 size-full"
          style={{ animation: "hina-spin-slow 40s linear infinite" }}
        >
          {ticks.map((_, i) => {
            const long = i % 5 === 0;
            const a = (i / ticks.length) * Math.PI * 2;
            const r1 = long ? 84 : 89;
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * r1}
                y1={100 + Math.sin(a) * r1}
                x2={100 + Math.cos(a) * 95}
                y2={100 + Math.sin(a) * 95}
                stroke="currentColor"
                className={long ? "text-primary" : "text-primary/40"}
                strokeWidth={long ? 2 : 1}
              />
            );
          })}
        </svg>

        {/* segmented arcs */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 size-full text-primary"
          style={{ animation: "hina-spin-slow 18s linear reverse infinite" }}
        >
          {segments.map((_, i) => {
            const a0 = (i / segments.length) * Math.PI * 2;
            const a1 = a0 + 0.34;
            const r = 76;
            return (
              <path
                key={i}
                d={`M ${100 + Math.cos(a0) * r} ${100 + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${100 + Math.cos(a1) * r} ${100 + Math.sin(a1) * r}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={i % 3 === 0 ? 5 : 2}
                opacity={i % 3 === 0 ? 0.9 : 0.45}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <span
          className="absolute rounded-full border border-dashed border-secondary/40"
          style={{
            width: size * 0.58,
            height: size * 0.58,
            animation: "hina-spin-slow 26s linear infinite",
          }}
        />

        {/* core */}
        <motion.div
          className="relative grid place-items-center rounded-full"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            background:
              "radial-gradient(circle at 50% 50%, var(--color-foreground) 0%, var(--color-primary) 38%, oklch(0.3 0.14 25) 78%)",
            boxShadow: "var(--shadow-glow)",
          }}
          animate={
            state === "speaking"
              ? { scale: [1, 1.07, 0.98, 1.05, 1] }
              : state === "listening"
                ? { scale: [1, 1.09, 1] }
                : state === "thinking"
                  ? { scale: [1, 1.03, 1], rotate: [0, 6, -6, 0] }
                  : { scale: [1, 1.03, 1] }
          }
          transition={{
            duration: state === "speaking" ? 0.7 : state === "listening" ? 1.2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="absolute inset-[8%] rounded-full opacity-60 mix-blend-overlay"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, var(--color-background), transparent 55%)",
              animation: "hina-spin-slow 6s linear infinite",
            }}
          />
          {/* waveform */}
          <div className="relative flex h-1/3 items-center gap-[3px]">
            {Array.from({ length: 11 }).map((_, i) => {
              const base = 9 + Math.sin(i) * 5;
              return (
                <motion.span
                  key={i}
                  className="w-[2px] rounded-full bg-background/85"
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
        <div className="flex items-center gap-2 border border-glass-border bg-glass px-4 py-1.5 hud-label">
          <span
            className={cn(
              "size-1.5 rounded-full",
              state === "speaking"
                ? "bg-accent"
                : state === "listening"
                  ? "bg-secondary"
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
