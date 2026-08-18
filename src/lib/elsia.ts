export type Mood = "neutral" | "thinking" | "pleased" | "annoyed";

export type ElsiaMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mood: Mood;
  created_at: string;
};

export type Intensity = "mild" | "full";
export type AccentKey = "crimson" | "violet" | "blue";

export const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: "crimson", label: "Crimson", swatch: "oklch(0.58 0.222 20)" },
  { key: "violet", label: "Violet", swatch: "oklch(0.6 0.23 300)" },
  { key: "blue", label: "Electric Blue", swatch: "oklch(0.66 0.19 245)" },
];

const MOODS: Mood[] = ["neutral", "thinking", "pleased", "annoyed"];

/** Strips a trailing [mood:x] tag from streamed text and returns the pair. */
export function parseMood(raw: string): { text: string; mood: Mood } {
  const match = raw.match(/\[mood:\s*(neutral|thinking|pleased|annoyed)\s*\]/i);
  const mood = (match?.[1]?.toLowerCase() as Mood | undefined) ?? "neutral";
  const text = raw.replace(/\[mood:[^\]]*\]?/gi, "").trimEnd();
  return { text, mood: MOODS.includes(mood) ? mood : "neutral" };
}

export const GREETINGS = [
  "Eyes up. I don't repeat myself.",
  "Took you long enough. Sit. Talk.",
  "Good. You showed up. That's step one.",
  "Don't just stare — you have work to do.",
  "I'm listening. Make it worth my time.",
];

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
