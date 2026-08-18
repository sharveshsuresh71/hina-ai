import { useMemo } from "react";

/** Ambient drifting embers in the app accent color. */
export function Embers({ count = 26 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 14 + Math.random() * 22,
        delay: Math.random() * -30,
        opacity: 0.15 + Math.random() * 0.4,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-[-10vh] rounded-full bg-primary"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            opacity: e.opacity,
            filter: "blur(0.5px)",
            boxShadow: "0 0 8px currentColor",
            animation: `elsia-ember ${e.duration}s linear ${e.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
