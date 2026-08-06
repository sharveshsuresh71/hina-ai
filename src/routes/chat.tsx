import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mic, Square, Send, Copy, RefreshCw, Volume2, VolumeX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { HinaOrb, type HinaState } from "@/components/hina-orb";
import { useHinaSettings } from "@/hooks/use-hina-settings";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat with HINA — HINA OS" },
      {
        name: "description",
        content:
          "Talk to HINA by voice or text: code explanations, writing help, summaries and brainstorming with markdown and code highlighting.",
      },
      { property: "og:title", content: "Chat with HINA — HINA OS" },
      {
        property: "og:description",
        content: "Voice-enabled AI chat with markdown and code support.",
      },
    ],
  }),
  component: ChatPage,
});

const uid = () => Math.random().toString(36).slice(2);

function ChatPage() {
  const { q } = Route.useSearch();
  const { settings } = useHinaSettings();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const seeded = useRef(false);

  const speech = useSpeech({ voiceURI: settings.voiceURI, rate: settings.speechRate });

  useEffect(() => {
    if (speech.transcript) setInput(speech.transcript);
  }, [speech.transcript]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [streaming]);

  const send = useCallback(
    async (text: string, history?: Msg[]) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      speech.stopSpeaking();
      const base = history ?? messages;
      const userMsg: Msg = { id: uid(), role: "user", text: trimmed };
      const assistantId = uid();
      const next = [...base, userMsg];
      setMessages([...next, { id: assistantId, role: "assistant", text: "" }]);
      setInput("");
      speech.setTranscript("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: next.map((m) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: "text", text: m.text }],
            })),
          }),
        });

        if (response.status === 429) throw new Error("HINA is rate limited. Try again shortly.");
        if (response.status === 402)
          throw new Error("AI credits exhausted. Add credits to keep talking to HINA.");
        if (!response.ok || !response.body)
          throw new Error(await response.text().catch(() => "HINA could not respond."));

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let full = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          full += value;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: full } : m)),
          );
        }
        if (settings.autoSpeak && full) speech.speak(full);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        const message = (error as Error).message || "HINA could not respond.";
        toast.error(message);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: `⚠️ ${message}` } : m)),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, settings.autoSpeak, speech, streaming],
  );

  useEffect(() => {
    if (q && !seeded.current) {
      seeded.current = true;
      void send(q);
    }
  }, [q, send]);

  const regenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.findIndex((m) => m.id === lastUser.id);
    void send(lastUser.text, messages.slice(0, idx));
  };

  const orbState: HinaState = speech.listening
    ? "listening"
    : speech.speaking
      ? "speaking"
      : streaming
        ? "thinking"
        : "idle";

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col px-4 py-4 sm:px-8">
      <div className="flex items-center gap-4 pb-4">
        <HinaOrb size={96} state={orbState} showLabel={false} />
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold">HINA</h1>
          <p className="text-xs text-muted-foreground">
            {orbState === "idle" ? "Standing by" : `${orbState}...`}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {speech.speaking && (
            <button
              onClick={speech.stopSpeaking}
              className="rounded-full border border-glass-border bg-glass p-2 text-muted-foreground hover:text-foreground"
              aria-label="Stop speaking"
            >
              <VolumeX className="size-4" />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                speech.stopSpeaking();
              }}
              className="rounded-full border border-glass-border bg-glass p-2 text-muted-foreground hover:text-destructive"
              aria-label="Clear conversation"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-xl">Say hello to HINA</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ask a question, paste code, or press the mic and speak.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
                      : "text-foreground",
                  )}
                >
                  {m.role === "assistant" ? (
                    <>
                      <div className="prose prose-invert max-w-none text-sm prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-glass-border prose-pre:bg-muted prose-code:text-primary">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text || "…"}
                        </ReactMarkdown>
                      </div>
                      {m.text && !streaming && (
                        <div className="mt-2 flex gap-2 text-muted-foreground">
                          <button
                            onClick={() => {
                              void navigator.clipboard.writeText(m.text);
                              toast.success("Copied");
                            }}
                            className="rounded-md p-1 hover:text-primary"
                            aria-label="Copy response"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <button
                            onClick={regenerate}
                            className="rounded-md p-1 hover:text-primary"
                            aria-label="Regenerate response"
                          >
                            <RefreshCw className="size-3.5" />
                          </button>
                          <button
                            onClick={() => speech.speak(m.text)}
                            className="rounded-md p-1 hover:text-primary"
                            aria-label="Read aloud"
                          >
                            <Volume2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-glass-border p-3"
        >
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={speech.listening ? speech.stopListening : speech.startListening}
              disabled={!speech.supported.stt}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full border border-glass-border transition-colors disabled:opacity-40",
                speech.listening ? "bg-accent text-accent-foreground" : "bg-glass text-primary",
              )}
              aria-label={speech.listening ? "Stop listening" : "Start voice input"}
            >
              <Mic className="size-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder={speech.listening ? "Listening..." : "Message HINA..."}
              className="max-h-40 min-h-10 flex-1 resize-none rounded-xl border border-input bg-background/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
            {streaming ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground"
                aria-label="Stop generating"
              >
                <Square className="size-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid size-10 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-40"
                style={{ background: "var(--gradient-primary)" }}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </button>
            )}
          </div>
          {!speech.supported.stt && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Voice input needs a Chromium-based browser.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
