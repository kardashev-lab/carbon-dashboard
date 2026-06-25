"use client";

import { useState } from "react";
import useSWR from "swr";
import HistoryChart from "./HistoryChart";
import FuelBreakdown from "./FuelBreakdown";
import { fetchCarbonLatest, fetchCarbonHistory, fetchFuelMix } from "@/lib/api";
import type { CarbonLatest, CarbonPoint, FuelMixPoint } from "@/lib/types";
import { PRIMARY_ISOS, intensityColor, intensityLabel, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const POLL_INTERVAL = 60_000;

export default function Dashboard() {
  const [selectedIso, setSelectedIso] = useState<string>("CAISO");

  const { data: latest, isLoading } = useSWR<CarbonLatest[]>(
    "carbon/latest",
    fetchCarbonLatest,
    { refreshInterval: POLL_INTERVAL }
  );

  const { data: history, isLoading: historyLoading } = useSWR<CarbonPoint[]>(
    ["carbon/history", selectedIso],
    () => fetchCarbonHistory(selectedIso, 24),
    { refreshInterval: POLL_INTERVAL }
  );

  const { data: fuelMix, isLoading: fuelLoading } = useSWR<FuelMixPoint[]>(
    ["fuel-mix", selectedIso],
    () => fetchFuelMix(selectedIso),
    { refreshInterval: POLL_INTERVAL }
  );

  const primaryData = latest?.filter((d) =>
    (PRIMARY_ISOS as readonly string[]).includes(d.iso)
  ) ?? [];

  const otherData = latest?.filter(
    (d) => !(PRIMARY_ISOS as readonly string[]).includes(d.iso)
  ) ?? [];

  const selected = latest?.find((d) => d.iso === selectedIso);
  const selectedAgeH = selected
    ? (Date.now() - new Date(selected.ts).getTime()) / 3_600_000
    : 0;
  const selectedStale = selectedAgeH > 2;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">US Grid Carbon Intensity</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time CO₂ intensity by balancing authority · EPA eGRID 2023
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {selected ? `Updated ${formatDate(selected.ts)}` : "Refreshes every 60s"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide">ISO</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">lbs CO₂/MWh</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">Clean</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">GW</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        </TableCell>
                      </TableRow>
                    ))
                  : [...primaryData, ...otherData].map((d) => {
                      const color = intensityColor(d.lbs_co2_per_mwh);
                      const isSelected = d.iso === selectedIso;
                      const ageH = (Date.now() - new Date(d.ts).getTime()) / 3_600_000;
                      const isStale = ageH > 2;
                      return (
                        <TableRow
                          key={d.iso}
                          onClick={() => setSelectedIso(d.iso)}
                          className={cn(
                            "cursor-pointer",
                            isSelected && "bg-blue-50 hover:bg-blue-50",
                            isStale && "opacity-50"
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: color }}
                              />
                              <span className={cn("font-medium", isSelected && "text-blue-700")}>
                                {d.iso}
                              </span>
                              {isStale && (
                                <span className="text-[10px] text-muted-foreground/60 font-normal">
                                  {Math.round(ageH)}h ago
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold" style={{ color }}>
                            {Math.round(d.lbs_co2_per_mwh)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {d.pct_clean}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {(d.total_mw / 1000).toFixed(1)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {selected && (
            <Card className={cn(selectedStale && "border-amber-200")}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-muted-foreground font-mono">{selected.iso}</span>
                      {selectedStale && (
                        <span className="text-[10px] text-amber-500 font-medium">
                          data {Math.round(selectedAgeH)}h old
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl font-bold tabular-nums"
                        style={{ color: intensityColor(selected.lbs_co2_per_mwh) }}
                      >
                        {Math.round(selected.lbs_co2_per_mwh)}
                      </span>
                      <span className="text-sm text-muted-foreground">lbs CO₂/MWh</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant="secondary"
                      style={{
                        background: intensityColor(selected.lbs_co2_per_mwh) + "18",
                        color: intensityColor(selected.lbs_co2_per_mwh),
                        border: "none",
                      }}
                    >
                      {intensityLabel(selected.lbs_co2_per_mwh)}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{selected.pct_clean}% clean</div>
                    <div className="text-xs text-muted-foreground">{(selected.total_mw / 1000).toFixed(1)} GW</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                24-Hour Carbon Intensity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Loading…
                </div>
              ) : history?.length ? (
                <HistoryChart data={history} iso={selectedIso} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No history data for {selectedIso}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current Fuel Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fuelLoading ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Loading…
                </div>
              ) : fuelMix?.length ? (
                <FuelBreakdown data={fuelMix} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No fuel mix data for {selectedIso}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground leading-relaxed px-1 space-y-3">
            <p>
              <span className="font-medium text-foreground/70">How it works:</span>{" "}
              Carbon intensity is a weighted average across all fuel sources:{" "}
              <span className="font-mono">Σ(MW × factor) / Σ(MW)</span>. Each fuel type is
              multiplied by its emission factor, summed, then divided by total generation.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 pr-4 font-medium text-foreground/60">Fuel</th>
                  <th className="text-right py-1 pr-4 font-medium text-foreground/60">lbs CO₂/MWh</th>
                  <th className="text-left py-1 font-medium text-foreground/60">Source</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Coal",             "2,228", "EPA eGRID 2023 (USCCO2RT)"],
                  ["Natural Gas",      "899",   "EPA eGRID 2023 (USGCO2RT)"],
                  ["Oil / Petroleum",  "1,555", "EPA eGRID 2023 (USOCO2RT)"],
                  ["Nuclear",          "0",     "Zero combustion emissions"],
                  ["Wind",             "0",     "Zero combustion emissions"],
                  ["Solar",            "0",     "Zero combustion emissions"],
                  ["Hydro",            "0",     "Zero combustion emissions"],
                  ["Geothermal",       "38",    "NREL lifecycle assessment"],
                  ["Biomass",          "1,500", "NREL lifecycle assessment"],
                  ["Imports / Other",  "767",   "EPA eGRID 2023 US avg (USCO2RTA)"],
                ].map(([fuel, factor, source]) => (
                  <tr key={fuel} className="border-b border-border/40">
                    <td className="py-1 pr-4">{fuel}</td>
                    <td className="py-1 pr-4 text-right tabular-nums">{factor}</td>
                    <td className="py-1 text-muted-foreground/60">{source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Factors are averages, not marginal. Imports and unrecognized fuel types use the US
              national average.{" "}
              <a
                href="https://www.epa.gov/egrid/detailed-data"
                className="underline hover:text-foreground/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                EPA eGRID 2023
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
