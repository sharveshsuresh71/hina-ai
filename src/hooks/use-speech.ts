import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
};

export function useSpeech({
  voiceURI,
  rate = 1,
}: {
  voiceURI?: string;
  rate?: number;
} = {}) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState({ stt: false, tts: false });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setSupported({ stt: Boolean(SR), tts: "speechSynthesis" in window });
    if (!SR) return;
    const rec: SpeechRecognitionLike = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => rec.stop();
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    setTranscript("");
    try {
      rec.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (ctxRef.current) {
      void ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speakFallback = useCallback(
    (clean: string) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = rate * 0.95;
      utterance.pitch = 0.85;
      const mature =
        voices.find((v) => /samantha|victoria|karen|serena|zira|female/i.test(v.name)) ??
        voices.find((v) => v.lang.startsWith("en"));
      if (mature) utterance.voice = mature;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [rate, voices],
  );

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      stopSpeaking();
      const clean = text
        .replace(/```[\s\S]*?```/g, " code block ")
        .replace(/[*_#>`]/g, "")
        .slice(0, 2400);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ text: clean, voice: voiceURI || "sage", speed: rate }),
        });
        if (!res.ok || !res.body) throw new Error("tts failed");

        const ctx = new AudioContext({ sampleRate: 24000 });
        ctxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume().catch(() => {});
        setSpeaking(true);

        let playhead = 0;
        let pending = new Uint8Array(0);
        let lastEnd = 0;

        const playChunk = (incoming: Uint8Array) => {
          const merged = new Uint8Array(pending.length + incoming.length);
          merged.set(pending);
          merged.set(incoming, pending.length);
          const usable = merged.length - (merged.length % 2);
          pending = merged.slice(usable);
          if (usable === 0) return;
          const samples = new Int16Array(merged.buffer, 0, usable / 2);
          const floats = Float32Array.from(samples, (s) => s / 32768);
          const buffer = ctx.createBuffer(1, floats.length, 24000);
          buffer.copyToChannel(floats, 0);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          playhead = playhead === 0 ? ctx.currentTime + 0.08 : Math.max(playhead, ctx.currentTime);
          source.start(playhead);
          playhead += buffer.duration;
          lastEnd = playhead;
        };

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += value;
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const payload = JSON.parse(data) as { type?: string; audio?: string };
                if (payload.type !== "speech.audio.delta" || !payload.audio) continue;
                const binary = atob(payload.audio);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                playChunk(bytes);
              } catch {
                /* ignore malformed event */
              }
            }
          }
        }

        const remaining = Math.max(0, (lastEnd - ctx.currentTime) * 1000);
        window.setTimeout(() => {
          if (ctxRef.current === ctx) {
            setSpeaking(false);
            void ctx.close().catch(() => {});
            ctxRef.current = null;
          }
        }, remaining + 250);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setSpeaking(false);
        speakFallback(clean);
      }
    },
    [rate, speakFallback, stopSpeaking, voiceURI],
  );

  return {
    listening,
    speaking,
    transcript,
    setTranscript,
    voices,
    supported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
