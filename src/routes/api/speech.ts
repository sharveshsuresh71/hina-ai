import { createFileRoute } from "@tanstack/react-router";

type Body = { text?: unknown; voice?: unknown; speed?: unknown };

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voice, speed } = (await request.json()) as Body;
        if (typeof text !== "string" || !text.trim()) {
          return new Response("Text is required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text.slice(0, 3000),
            voice: typeof voice === "string" && voice ? voice : "sage",
            speed: typeof speed === "number" ? Math.min(1.6, Math.max(0.6, speed)) : 1,
            instructions:
              "Speak as a calm, mature woman in her forties: warm, composed, confident and slightly lower in pitch. Measured pacing, clear diction, subtle futuristic AI-assistant poise. Never girlish or high-pitched.",
            stream_format: "sse",
            response_format: "pcm",
          }),
        });

        if (!response.ok || !response.body) {
          const detail = await response.text().catch(() => "");
          console.error("HINA speech error", response.status, detail);
          return new Response(detail || "Speech failed", { status: response.status });
        }

        return new Response(response.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});
