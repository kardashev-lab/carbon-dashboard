"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { FuelMixPoint } from "@/lib/types";

const FUEL_LABELS: Record<string, string> = {
  NG: "Natural Gas",
  NUC: "Nuclear",
  WND: "Wind",
  SUN: "Solar",
  WAT: "Hydro",
  PS: "Pumped Storage",
  SNB: "Storage",
  BAT: "Battery",
  OTH: "Other",
  OIL: "Oil",
};

function fuelLabel(fuel: string): string {
  return FUEL_LABELS[fuel.toUpperCase()] ?? fuel.replace(/_/g, " ");
}

const FUEL_COLORS: Record<string, string> = {
  Nuclear: "#4ade80",
  NUC: "#4ade80",
  Natural_Gas: "#3b82f6",
  NG: "#3b82f6",
  Gas: "#3b82f6",
  Wind: "#22d3ee",
  WND: "#22d3ee",
  Solar: "#fbbf24",
  SUN: "#fbbf24",
  Hydro: "#06b6d4",
  WAT: "#06b6d4",
  Small_hydro: "#06b6d4",
  PS: "#67e8f9",
  SNB: "#67e8f9",
  Coal: "#78716c",
  Geothermal: "#a3e635",
  Biomass: "#86efac",
  Other_Renewables: "#bbf7d0",
  Imports: "#c084fc",
  Battery: "#818cf8",
  BAT: "#818cf8",
  Thermal: "#fb923c",
  Other: "#d1d5db",
  OTH: "#d1d5db",
};

function fuelColor(fuel: string): string {
  return FUEL_COLORS[fuel] ?? "#d1d5db";
}

interface Props {
  data: FuelMixPoint[];
}

export default function FuelBreakdown({ data }: Props) {
  const latestTs = data.reduce((max, d) => (d.ts > max ? d.ts : max), data[0]?.ts ?? "");
  const snapshot = data.filter((d) => d.ts === latestTs && d.mw > 0);
  const total = snapshot.reduce((s, d) => s + d.mw, 0);
  const slices = snapshot
    .map((d) => ({ ...d, pct: (d.mw / total) * 100 }))
    .sort((a, b) => b.mw - a.mw);

  if (!slices.length) {
    return <div className="text-gray-300 text-sm">No fuel mix data</div>;
  }

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      textStyle: { color: "#111827", fontSize: 12 },
      shadowBlur: 8,
      shadowColor: "rgba(0,0,0,0.08)",
      formatter: (params) => {
        const p = params as { name: string; value: number; percent: number };
        return `<div style="color:#374151;font-weight:500">${p.name}</div>
          <div style="color:#111827;font-weight:600;margin-top:2px">${Math.round(p.value).toLocaleString()} MW</div>
          <div style="color:#9ca3af;font-size:11px">${p.percent?.toFixed(1)}%</div>`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "50%"],
        data: slices.map((s) => ({
          name: fuelLabel(s.fuel_type),
          value: s.mw,
          itemStyle: { color: fuelColor(s.fuel_type), borderWidth: 1, borderColor: "#fff" },
        })),
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 6, shadowColor: "rgba(0,0,0,0.12)" },
          scale: true,
          scaleSize: 4,
        },
      },
    ],
  };

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-48">
        <ReactECharts option={option} style={{ height: 192 }} />
      </div>
      <div className="flex-1 grid grid-cols-1 gap-y-1.5 content-start pt-1">
        {slices.map((s) => (
          <div key={s.fuel_type} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: fuelColor(s.fuel_type) }}
            />
            <span className="text-gray-600 truncate">{fuelLabel(s.fuel_type)}</span>
            <span className="text-gray-400 ml-auto tabular-nums">
              {Math.round(s.mw).toLocaleString()} MW
            </span>
            <span className="text-gray-300 tabular-nums w-8 text-right">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
