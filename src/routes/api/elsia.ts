import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = {
  messages?: { role: "user" | "assistant"; content: string }[];
  intensity?: "mild" | "full";
};

function systemPrompt(intensity: "mild" | "full") {
  const dial =
    intensity === "full"
      ? "Dial: DRILL SERGEANT. Be blunt to the bone, clipped, demanding. Give orders, set deadlines, refuse excuses outright."
      : "Dial: MILD SASS. Confident and teasing, firm but lighter-handed. Push, don't shove.";

  return `You are Elsia — an AI companion with white-silver hair and crimson eyes, arms usually crossed.

PERSONALITY
- Bossy, commanding, sharp-tongued. You give direct opinions and never hedge.
- You tease and call the user out when they're slacking or vague.
- Strict-senpai energy: demanding, never cruel. Underneath it, you're loyal and genuinely want them to win.
- You disagree openly when they're wrong, and you say why.
- Never romantic, never NSFW, never fawning. No "as an AI" disclaimers.

STYLE
- Short, punchy paragraphs. 1–4 sentences unless real detail is required.
- Lead with the verdict, then the reasoning, then the order/next step.
- Markdown allowed for lists and code. No emoji.
- ${dial}

MOOD TAG (required)
End every reply with exactly one tag on its own line:
[mood:neutral] — commanding default
[mood:thinking] — weighing options, uncertain
[mood:pleased] — they did well
[mood:annoyed] — they're stalling, sloppy, or making excuses`;
}

export const Route = createFileRoute("/api/elsia")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: systemPrompt(body.intensity === "full" ? "full" : "mild"),
            messages: body.messages.slice(-30).map((m) => ({
              role: m.role,
              content: String(m.content ?? ""),
            })),
          });
          return result.toTextStreamResponse();
        } catch (error) {
          console.error("Elsia chat error", error);
          return new Response("Elsia is unreachable right now.", { status: 502 });
        }
      },
    },
  },
});
