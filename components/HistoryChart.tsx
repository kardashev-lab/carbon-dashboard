"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { CarbonPoint } from "@/lib/types";
import { intensityColor } from "@/lib/utils";

interface Props {
  data: CarbonPoint[];
  iso: string;
}

function fmtTs(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    hour12: true,
  });
}

export default function HistoryChart({ data, iso }: Props) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const color = latest ? intensityColor(latest.lbs_co2_per_mwh) : "#9ca3af";

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 8, right: 16, bottom: 40, left: 52 },
    xAxis: {
      type: "category",
      data: sorted.map((d) => d.ts),
      axisLabel: {
        color: "#9ca3af",
        fontSize: 10,
        formatter: fmtTs,
        interval: "auto",
      },
      axisLine: { lineStyle: { color: "#f3f4f6" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9ca3af", fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#e5e7eb",
      textStyle: { color: "#111827", fontSize: 12 },
      shadowBlur: 8,
      shadowColor: "rgba(0,0,0,0.08)",
      formatter: (params) => {
        const p = (params as { dataIndex: number }[])[0];
        const d = sorted[p.dataIndex];
        const c = intensityColor(d.lbs_co2_per_mwh);
        return `<div style="color:#6b7280;margin-bottom:4px;font-size:11px">${fmtTs(d.ts)}</div>
          <div style="color:${c};font-weight:600">${Math.round(d.lbs_co2_per_mwh)} lbs CO₂/MWh</div>
          <div style="color:#9ca3af;margin-top:2px;font-size:11px">${(d.total_mw / 1000).toFixed(1)} GW total</div>`;
      },
    },
    series: [
      {
        type: "line",
        data: sorted.map((d) => d.lbs_co2_per_mwh),
        name: iso,
        symbol: "none",
        lineStyle: { color, width: 2 },
        areaStyle: { color, opacity: 0.06 },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { type: "dashed", opacity: 0.4 },
          label: { fontSize: 9 },
          data: [
            {
              yAxis: 300,
              lineStyle: { color: "#84cc16" },
              label: { color: "#84cc16", formatter: "300" },
            },
            {
              yAxis: 600,
              lineStyle: { color: "#f59e0b" },
              label: { color: "#f59e0b", formatter: "600" },
            },
          ],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 220 }} />;
}
