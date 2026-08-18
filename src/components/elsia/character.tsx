import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import annoyed from "@/assets/elsia-annoyed.png";
import neutral from "@/assets/elsia-neutral.png";
import pleased from "@/assets/elsia-pleased.png";
import thinking from "@/assets/elsia-thinking.png";
import type { Mood } from "@/lib/elsia";

const SPRITES: Record<Mood, string> = { neutral, thinking, pleased, annoyed };

export function ElsiaCharacter({
  mood,
  onPoke,
  compact = false,
}: {
  mood: Mood;
  onPoke?: () => void;
  compact?: boolean;
}) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const loop = () => {
      timeout = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 120);
          loop();
        },
        2600 + Math.random() * 3800,
      );
    };
    loop();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onPoke}
      aria-label="Elsia — tap for a reaction"
      whileHover={{ rotate: compact ? 0 : -0.8, scale: compact ? 1.04 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group relative block h-full w-full cursor-pointer select-none focus:outline-none"
    >
      {!compact && (
        <div
          aria-hidden
          className="absolute inset-x-6 bottom-0 top-16 rounded-full bg-primary/20 blur-[90px]"
        />
      )}
      <div
        className="relative h-full w-full"
        style={{ animation: "elsia-breathe 5.5s ease-in-out infinite" }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={mood}
            src={SPRITES[mood]}
            alt={`Elsia looking ${mood}`}
            width={832}
            height={1216}
            initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: blink ? "brightness(0.94)" : "blur(0px)",
            }}
            exit={{ opacity: 0, scale: 1.01, filter: "blur(6px)", position: "absolute" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={
              compact
                ? "h-full w-full object-cover object-top"
                : "mx-auto h-full w-full object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
            }
          />
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
