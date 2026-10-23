"use client";

import { useEffect, useState } from "react";

// Floor plan with drifting sensor readings: a nod to the IoT building work.
// Values start fixed (server and client render the same) and only drift after mount.
const sensors = [
  { x: 50, y: 70, base: 21.4, spread: 0.4, fmt: (v: number) => `${v.toFixed(1)}°C` },
  { x: 280, y: 60, base: 612, spread: 25, fmt: (v: number) => `CO₂ ${Math.round(v)}` },
  { x: 425, y: 300, base: 14, spread: 3, fmt: (v: number) => `${Math.round(v)} people` },
  { x: 145, y: 310, base: 41, spread: 3, fmt: (v: number) => `RH ${Math.round(v)}%` },
];

export function FloorPlan() {
  const [values, setValues] = useState(() => sensors.map((s) => s.base));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const s = sensors[i];
          const next = v + (Math.random() - 0.5) * s.spread * 0.6;
          return Math.min(s.base + s.spread, Math.max(s.base - s.spread, next));
        }),
      );
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <svg className="plan" viewBox="0 0 560 380" role="img" aria-label="Floor plan with live building sensors">
      <g className="plan-walls">
        <rect x="10" y="10" width="540" height="360" />
        <path d="M10 160H250V10M250 160V250M250 300V370M250 230H400M400 10V120M400 170V370M400 230H550M120 160V200M120 250V370" />
        <path className="plan-door" d="M250 250a50 50 0 0 1 50 50M400 120a50 50 0 0 1 50 50" />
      </g>
      <line className="plan-scan" x1="10" y1="10" x2="10" y2="370" />
      <g className="plan-grid">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={10 + i * 45} y1="372" x2={10 + i * 45} y2="380" />
        ))}
      </g>
      {sensors.map((s, i) => (
        <g key={i} className="sensor">
          <circle className="sensor-ring" cx={s.x} cy={s.y} r="6" style={{ animationDelay: `${i * 0.9}s` }} />
          <circle className="sensor-dot" cx={s.x} cy={s.y} r="5" />
          <text x={s.x + 14} y={s.y + 4}>
            {s.fmt(values[i])}
          </text>
        </g>
      ))}
    </svg>
  );
}
