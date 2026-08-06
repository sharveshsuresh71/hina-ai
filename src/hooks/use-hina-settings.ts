import { useCallback, useEffect, useState } from "react";

export type HinaSettings = {
  userName: string;
  voiceURI: string;
  speechRate: number;
  autoSpeak: boolean;
  theme: "dark" | "light";
};

const KEY = "hina-os-settings";

export const defaultSettings: HinaSettings = {
  userName: "Commander",
  voiceURI: "",
  speechRate: 1,
  autoSpeak: true,
  theme: "dark",
};

export function useHinaSettings() {
  const [settings, setSettings] = useState<HinaSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<HinaSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("light", settings.theme === "light");
  }, [settings.theme, hydrated]);

  return { settings, update, hydrated };
}
