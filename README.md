# PopulationMax

PopulationMax is a full-stack demographic intelligence dashboard for exploring country population data, historical trends, projections, and comparative insights across 198 countries.

[Live Site](https://countriesmax.netlify.app/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)

## Features

- Multi-source demographic data indexing for broad country coverage and cross-checking.
- Forecast visualization for population trajectories through 2100.
- Longevity analysis using life expectancy and aging indicators.
- Geospatial intelligence views for demographic classification and regional interpretation.
- Comparative country tables for historical deltas, growth variance, and ranking metrics.
- Automatic intelligence tags for fast demographic categorization.
- Adaptive numeric formatting for clarity across small and large populations.
- Scannability-focused UI design for dense data exploration.
- Mobile-responsive layout for desktop and mobile access.

## Tech Stack

### Frontend
- React 18+
- Vite
- Tailwind CSS
- Recharts
- React Router
- Axios

### Backend
- Node.js
- Netlify Serverless Functions

### Data Layer
- CIA World Factbook datasets
- World Bank indicators
- United Nations population projections
- Unified aggregation and normalization pipeline

## API Endpoints

| Endpoint | Returns |
|---|---|
| `GET /api/countries` | All 198 countries, sorted A→Z |
| `GET /api/search?query=ind` | Up to 10 matches by name or code |
| `GET /api/country/IND` | Country profile plus population records |
| `GET /api/global-trends?mode=history` | World population history |
| `GET /api/global-trends?mode=projections` | World population projections |
| `GET /api/hotspots?limit=10` | Top countries by growth rate |
| `GET /api/predict/IND` | Forecast values for 2024, 2030, 2050, and 2100 |

## Project Structure

```text
populationmax-full/
├── frontend/                    ← React SPA (Vite + Tailwind + Recharts)
├── backend/                     ← Netlify Serverless Functions (Node.js)
└── netlify.toml                 ← Build config + /api/* redirects + SPA fallback
```

## Local Development

```bash
cd frontend
npm install
npm run dev
```

```bash
netlify functions:serve --port 9999 --functions-dir backend/netlify/functions
```

## Deployment

1. Push the repository to GitHub.
2. Import it into Netlify.
3. Use the included `netlify.toml` for build and function settings.
4. Deploy the site.

## License

MIT
