"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export type ReachStatus = "checking" | "ok" | "error";
export type ReachMap    = Record<string, ReachStatus>;

interface ReachCtx {
  reachability: ReachMap;
  isChecking:   boolean;
  lastChecked:  Date | null;
  triggerCheck: () => void;
}

const Ctx = createContext<ReachCtx>({
  reachability: {}, isChecking: false, lastChecked: null, triggerCheck: () => {},
});

export function useReachability() { return useContext(Ctx); }

const LS_KEY        = "hp-ui-reach-v1";
const INTERVAL_MS   = 60_000; // auto-refresh every 60 seconds

function loadCache(): ReachMap {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as ReachMap;
  } catch { /* ignore */ }
  return {};
}

function saveCache(map: ReachMap) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

async function fetchUrls(): Promise<string[]> {
  try {
    const res  = await fetch("/api/config/services");
    const data = await res.json();
    const groups: unknown[] = Array.isArray(data.data) ? data.data : [];
    const urls: string[] = [];

    for (const group of groups) {
      for (const services of Object.values(group as Record<string, unknown>)) {
        if (!Array.isArray(services)) continue;
        for (const svc of services) {
          for (const svcData of Object.values(svc as Record<string, unknown>)) {
            const href = (svcData as Record<string, unknown>)?.href;
            if (typeof href === "string" && href.startsWith("http")) urls.push(href);
          }
        }
      }
    }
    return [...new Set(urls)]; // deduplicate
  } catch {
    return [];
  }
}

export default function ReachabilityProvider({ children }: { children: React.ReactNode }) {
  const [reachability, setReachability] = useState<ReachMap>(loadCache);
  const [isChecking, setIsChecking]     = useState(false);
  const [lastChecked, setLastChecked]   = useState<Date | null>(null);
  const runningRef = useRef(false);

  const check = useCallback(async () => {
    if (runningRef.current) return; // prevent concurrent runs
    runningRef.current = true;
    setIsChecking(true);

    try {
      const urls = await fetchUrls();
      if (urls.length === 0) return;

      // Mark all as "checking" (but keep old results for display)
      setReachability((prev) => {
        const next = { ...prev };
        urls.forEach((u) => { next[u] = "checking"; });
        return next;
      });

      const res  = await fetch("/api/config/check-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();

      if (data.ok) {
        const map: ReachMap = {};
        for (const r of data.results as { url: string; reachable: boolean }[]) {
          map[r.url] = r.reachable ? "ok" : "error";
        }
        setReachability(map);
        saveCache(map);
        setLastChecked(new Date());
      }
    } catch { /* network error — keep old results */ }
    finally {
      setIsChecking(false);
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, INTERVAL_MS);
    return () => clearInterval(id);
  }, [check]);

  return (
    <Ctx.Provider value={{ reachability, isChecking, lastChecked, triggerCheck: check }}>
      {children}
    </Ctx.Provider>
  );
}
