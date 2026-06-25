import type { CarbonLatest, CarbonPoint, FuelMixPoint } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://data.kardashevlabs.org";

export async function fetchCarbonLatest(): Promise<CarbonLatest[]> {
  const res = await fetch(`${API_BASE}/carbon/latest`);
  if (!res.ok) throw new Error("Failed to fetch carbon/latest");
  return res.json();
}

export async function fetchCarbonHistory(iso: string, hours = 24): Promise<CarbonPoint[]> {
  const res = await fetch(`${API_BASE}/carbon?iso=${iso}&hours=${hours}&limit=2000`);
  if (!res.ok) throw new Error(`Failed to fetch carbon history for ${iso}`);
  return res.json();
}

export async function fetchFuelMix(iso: string): Promise<FuelMixPoint[]> {
  const res = await fetch(`${API_BASE}/fuel-mix/latest?iso=${iso}`);
  if (!res.ok) throw new Error(`Failed to fetch fuel mix for ${iso}`);
  return res.json();
}
