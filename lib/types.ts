export interface CarbonLatest {
  iso: string;
  ts: string;
  lbs_co2_per_mwh: number;
  total_mw: number;
  pct_clean: number;
}

export interface CarbonPoint {
  ts: string;
  iso: string;
  lbs_co2_per_mwh: number;
  total_mw: number;
}

export interface FuelMixPoint {
  ts: string;
  iso: string;
  fuel_type: string;
  mw: number;
}
