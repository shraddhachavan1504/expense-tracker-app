"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { summarizeExpenses } from "@/lib/expenses/summarize";
import { mockExpenses } from "@/app/expenses/mock-data";

const SpendingBarsCanvas = dynamic(
  () => import("@/components/spending/spending-bars-scene"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b6b6b",
          fontSize: "0.875rem",
        }}
      >
        Loading visualization…
      </div>
    ),
  }
);

const COBALT = "#1E3AF2";
const YELLOW = "#FFD400";

// Plain HTML/CSS bars — used when the user has reduced-motion enabled.
// Same data, same color logic as the 3D version, just no WebGL and no
// growth animation, since that's exactly what reduced-motion asks for.
function StaticBarsFallback({
  data,
}: {
  data: { category: string; total: number; count: number }[];
}) {
  const maxTotal = Math.max(...data.map((d) => d.total), 0);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        gap: "1.5rem",
        padding: "0 1rem",
      }}
    >
      {data.map((d) => {
        const heightPct = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
        const isHighest = d.total === maxTotal;
        return (
          <div
            key={d.category}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <span style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              {`₹${d.total.toLocaleString("en-IN")}`}
            </span>
            <div
              style={{
                width: "100%",
                maxWidth: "48px",
                height: `${heightPct}%`,
                background: isHighest ? YELLOW : COBALT,
              }}
            />
            <span style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>
              {d.category}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function SpendingBars3DSection() {
  const summary = summarizeExpenses(mockExpenses);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // Tri-state so we don't flash the 3D version for a split second before
  // this check runs — null means "still checking," so we render nothing
  // until we know which version to show.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    null as boolean | null
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);

    // Also react live if the user changes this OS setting while the
    // page is open, rather than only checking once on mount.
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // No point observing scroll position if we're going to show the
    // static fallback anyway — it has no reveal animation to trigger.
    if (prefersReducedMotion !== false) return;

    const node = wrapperRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div ref={wrapperRef} style={{ height: "420px", width: "100%" }}>
      {prefersReducedMotion === null ? null : prefersReducedMotion ? (
        <StaticBarsFallback data={summary.byCategory} />
      ) : (
        <SpendingBarsCanvas data={summary.byCategory} revealed={revealed} />
      )}
    </div>
  );
}