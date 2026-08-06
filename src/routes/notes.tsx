import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes & Tasks — HINA OS" },
      {
        name: "description",
        content: "Capture quick notes and track your to-do list inside the HINA OS command center.",
      },
      { property: "og:title", content: "Notes & Tasks — HINA OS" },
      { property: "og:description", content: "Quick notes and tasks, saved in your browser." },
    ],
  }),
  component: Notes,
});

type Task = { id: string; text: string; done: boolean };
type Note = { id: string; text: string; at: number };

const uid = () => Math.random().toString(36).slice(2);

function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(items));
  }, [items, key, hydrated]);

  return [items, setItems] as const;
}

function Notes() {
  const [tasks, setTasks] = useLocalList<Task>("hina-tasks");
  const [notes, setNotes] = useLocalList<Note>("hina-notes");
  const [taskInput, setTaskInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold"
      >
        Notes & <span className="text-gradient">Tasks</span>
      </motion.h1>
      <p className="mt-2 text-sm text-muted-foreground">Saved locally in this browser.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="glass-panel p-6">
          <h2 className="font-display text-sm uppercase tracking-[0.2em]">To-do</h2>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!taskInput.trim()) return;
              setTasks((t) => [{ id: uid(), text: taskInput.trim(), done: false }, ...t]);
              setTaskInput("");
            }}
          >
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 rounded-xl border border-input bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
            />
            <button
              className="grid size-10 place-items-center rounded-full text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
              aria-label="Add task"
            >
              <Plus className="size-4" />
            </button>
          </form>

          <ul className="mt-5 space-y-2">
            <AnimatePresence initial={false}>
              {tasks.map((t) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-3 rounded-xl border border-glass-border px-4 py-3"
                >
                  <button
                    onClick={() =>
                      setTasks((list) =>
                        list.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                      )
                    }
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border border-primary/50",
                      t.done && "bg-primary text-primary-foreground",
                    )}
                    aria-label="Toggle task"
                  >
                    {t.done && <Check className="size-3" />}
                  </button>
                  <span className={cn("flex-1 text-sm", t.done && "text-muted-foreground line-through")}>
                    {t.text}
                  </span>
                  <button
                    onClick={() => setTasks((list) => list.filter((x) => x.id !== t.id))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete task"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
            {tasks.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing queued.</p>
            )}
          </ul>
        </section>

        <section className="glass-panel p-6">
          <h2 className="font-display text-sm uppercase tracking-[0.2em]">Notes</h2>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!noteInput.trim()) return;
              setNotes((n) => [{ id: uid(), text: noteInput.trim(), at: Date.now() }, ...n]);
              setNoteInput("");
            }}
          >
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Write a note..."
              className="min-h-24 w-full rounded-xl border border-input bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
            />
            <button
              className="rounded-full px-5 py-2 text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Save note
            </button>
          </form>

          <ul className="mt-5 space-y-3">
            <AnimatePresence initial={false}>
              {notes.map((n) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-glass-border p-4"
                >
                  <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{new Date(n.at).toLocaleString()}</span>
                    <button
                      onClick={() => setNotes((list) => list.filter((x) => x.id !== n.id))}
                      className="hover:text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {notes.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No notes yet.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
