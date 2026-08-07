import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/utilities")({
  head: () => ({
    meta: [
      { title: "Smart Utilities — HINA OS" },
      {
        name: "description",
        content:
          "Built-in HINA tools: calculator, unit converter, password generator, word counter, JSON formatter and color picker.",
      },
      { property: "og:title", content: "Smart Utilities — HINA OS" },
      {
        property: "og:description",
        content: "A toolbox of fast, offline-friendly utilities inside HINA OS.",
      },
    ],
  }),
  component: Utilities,
});

const panel = "glass-panel space-y-4 p-6";
const field =
  "w-full rounded-xl border border-input bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50";

function Calculator() {
  const [expr, setExpr] = useState("");
  const result = useMemo(() => {
    if (!expr.trim()) return "";
    if (!/^[0-9+\-*/().%\s]+$/.test(expr)) return "Only numbers and + - * / ( ) %";
    try {
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict";return (${expr})`)();
      return Number.isFinite(value) ? String(value) : "—";
    } catch {
      return "—";
    }
  }, [expr]);

  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">Calculator</h3>
      <input
        className={field}
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder="12 * (4 + 3)"
      />
      <p className="font-display text-2xl text-gradient">{result || "0"}</p>
    </div>
  );
}

const units: Record<string, Record<string, number>> = {
  Length: { Meters: 1, Kilometers: 1000, Miles: 1609.34, Feet: 0.3048, Inches: 0.0254 },
  Weight: { Grams: 1, Kilograms: 1000, Pounds: 453.592, Ounces: 28.3495 },
  Data: { Bytes: 1, KB: 1024, MB: 1048576, GB: 1073741824 },
};

function Converter() {
  const [category, setCategory] = useState("Length");
  const keys = Object.keys(units[category]!);
  const [from, setFrom] = useState(keys[0]!);
  const [to, setTo] = useState(keys[1]!);
  const [value, setValue] = useState("1");

  const out = useMemo(() => {
    const table = units[category]!;
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    const base = n * (table[from] ?? 1);
    return (base / (table[to] ?? 1)).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [category, from, to, value]);

  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">Unit converter</h3>
      <select
        className={field}
        value={category}
        onChange={(e) => {
          const next = e.target.value;
          setCategory(next);
          const k = Object.keys(units[next]!);
          setFrom(k[0]!);
          setTo(k[1]!);
        }}
      >
        {Object.keys(units).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input className={field} value={value} onChange={(e) => setValue(e.target.value)} />
        <select className={field} value={from} onChange={(e) => setFrom(e.target.value)}>
          {Object.keys(units[category]!).map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <select className={field} value={to} onChange={(e) => setTo(e.target.value)}>
        {Object.keys(units[category]!).map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>
      <p className="font-display text-2xl text-gradient">
        {out} <span className="text-sm text-muted-foreground">{to}</span>
      </p>
    </div>
  );
}

function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [symbols, setSymbols] = useState(true);
  const [pw, setPw] = useState("");

  const generate = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" +
      (symbols ? "!@#$%^&*()-_=+[]{}" : "");
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    setPw(Array.from(bytes, (b) => chars[b % chars.length]).join(""));
  };

  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">Password generator</h3>
      <label className="flex items-center justify-between text-sm text-muted-foreground">
        Length: {length}
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="ml-4 flex-1 accent-[var(--color-primary)]"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={symbols}
          onChange={(e) => setSymbols(e.target.checked)}
          className="accent-[var(--color-primary)]"
        />
        Include symbols
      </label>
      <button
        onClick={generate}
        className="rounded-full px-5 py-2 text-sm font-medium text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        Generate
      </button>
      {pw && (
        <button
          onClick={() => {
            void navigator.clipboard.writeText(pw);
            toast.success("Password copied");
          }}
          className="block w-full break-all rounded-xl border border-glass-border bg-background/40 p-3 text-left font-mono text-xs"
        >
          {pw}
        </button>
      )}
    </div>
  );
}

function WordCounter() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">Word counter</h3>
      <textarea
        className={`${field} min-h-32`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text..."
      />
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Words", words],
          ["Characters", text.length],
          ["Lines", text ? text.split("\n").length : 0],
        ].map(([label, v]) => (
          <div key={label as string} className="rounded-xl border border-glass-border p-3">
            <p className="font-display text-xl text-gradient">{v as number}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {label as string}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonFormatter() {
  const [raw, setRaw] = useState("");
  const [out, setOut] = useState("");
  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">JSON formatter</h3>
      <textarea
        className={`${field} min-h-28 font-mono text-xs`}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder='{"hina":"os"}'
      />
      <button
        onClick={() => {
          try {
            setOut(JSON.stringify(JSON.parse(raw), null, 2));
          } catch (e) {
            setOut(`Invalid JSON: ${(e as Error).message}`);
          }
        }}
        className="rounded-full px-5 py-2 text-sm font-medium text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        Format
      </button>
      {out && (
        <pre className="max-h-56 overflow-auto rounded-xl border border-glass-border bg-background/40 p-3 font-mono text-xs">
          {out}
        </pre>
      )}
    </div>
  );
}

function ColorPicker() {
  const [color, setColor] = useState("#FFFFFF");
  const rgb = (() => {
    const n = parseInt(color.slice(1), 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  })();
  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">Color picker</h3>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-24 w-full cursor-pointer rounded-xl border border-glass-border bg-transparent"
      />
      <div className="flex gap-3 text-sm">
        <code className="rounded-lg border border-glass-border px-3 py-1.5">{color}</code>
        <code className="rounded-lg border border-glass-border px-3 py-1.5">{rgb}</code>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className={panel}>
      <h3 className="font-display text-sm uppercase tracking-[0.2em]">Stopwatch</h3>
      <p className="font-display text-4xl tabular-nums text-gradient">
        {mm}:{ss}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(!running)}
          className="rounded-full px-5 py-2 text-sm font-medium text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
          className="rounded-full border border-glass-border px-5 py-2 text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}


function Utilities() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold"
      >
        Smart <span className="text-gradient">Utilities</span>
      </motion.h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fast tools that run entirely in your browser.
      </p>

      <Tabs defaultValue="everyday" className="mt-8">
        <TabsList className="bg-glass">
          <TabsTrigger value="everyday">Everyday</TabsTrigger>
          <TabsTrigger value="dev">Developer</TabsTrigger>
        </TabsList>
        <TabsContent value="everyday" className="mt-6 grid gap-5 lg:grid-cols-2">
          <Calculator />
          <Converter />
          <PasswordGenerator />
          <Stopwatch />
        </TabsContent>
        <TabsContent value="dev" className="mt-6 grid gap-5 lg:grid-cols-2">
          <JsonFormatter />
          <WordCounter />
          <ColorPicker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
