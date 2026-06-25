import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIMARY_ISOS = ["CAISO", "ERCOT", "MISO", "NYISO", "ISONE", "SPP", "PJM"] as const;

export function intensityColor(lbs: number): string {
  if (lbs < 200) return "#22c55e";
  if (lbs < 400) return "#84cc16";
  if (lbs < 600) return "#f59e0b";
  if (lbs < 800) return "#f97316";
  return "#ef4444";
}

export function intensityLabel(lbs: number): string {
  if (lbs < 200) return "Very Clean";
  if (lbs < 400) return "Clean";
  if (lbs < 600) return "Moderate";
  if (lbs < 800) return "Dirty";
  return "Very Dirty";
}

export function formatDate(ts: string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
