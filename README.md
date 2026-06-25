# US Grid Carbon Intensity

Real-time CO₂ intensity (lbs CO₂/MWh) per US balancing authority, computed as a weighted average of the live fuel mix using EPA eGRID 2023 emission factors. Covers all 7 primary ISOs plus 20+ smaller balancing authorities via EIA-930.

## Running locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The proxy in `.env.local` routes client requests through Next.js to avoid CORS. In production the env var is unset and the client hits the API directly.

## Stack

- Next.js 16 + React 19 + TypeScript
- shadcn/ui (Card, Table, Badge)
- ECharts via echarts-for-react
- SWR for data fetching with 60s polling
- Vitest for frontend tests
- FastAPI backend (separate repo: [kardashev-data](https://github.com/kardashev-lab/kardashev-data))

## Carbon formula

```
lbs CO₂/MWh = Σ(MW × emission_factor) / Σ(MW)
```

EPA eGRID 2023 emission factors: coal 2228, gas 899, oil 1555, nuclear/wind/solar/hydro 0, imports 767 (US national average).

## Running tests

```bash
npm test
```
