# PopulationMax

A global demographic intelligence platform for analyzing population shifts, forecasting trends, and supporting policy and research decisions.

**Live Demo:** [https://3000-i4r7fx8elnvdlhyjedpzu.app.cto.new/](https://3000-i4r7fx8elnvdlhyjedpzu.app.cto.new/)

## Features

- **Multi-Source Indexing**: Synchronizes demographic data from CIA World Factbook, World Bank, and United Nations datasets for cross-validation and higher reliability
- **Neural Forecast Visualization**: Displays population trajectories from 2026 through 2100 with AI-based modeling for growth peaks and decline phases
- **Longevity Index**: Combines life expectancy metrics with centenarian distribution to measure aging stability across countries
- **Geospatial Intelligence Map**: Interactive world map with demographic classifications such as hyper-growth regions, aging societies, and migration-dependent economies
- **Comparative Demographic Tables**: Side-by-side analysis of countries with historical deltas, growth variance, and median age rankings
- **Intelligence Tags System**: Automatic classification of countries into Hyper Growth, Terminal Transition, and Migration Hub categories for fast strategic interpretation
- **Adaptive Scaling Interface**: Dynamic unit formatting across millions and billions for clarity across small and large populations
- **Scannability Design System**: Hierarchical visual structure for fast interpretation of dense demographic datasets
- **Mobile-Ready Architecture**: Responsive design for real-time demographic exploration across devices

## Tech Stack

### Frontend
- React 18+
- Recharts for data visualization
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling

### Backend
- Python Flask or FastAPI
- Pandas and NumPy for data processing
- Scikit-learn for predictive modeling
- SQLite for local storage

### Data Layer
- CIA World Factbook datasets
- World Bank indicators
- United Nations population projections
- Unified aggregation and normalization pipeline

## Project Structure

```bash
populationmax/
├── frontend/          # React application interface
├── backend/           # API and data processing layer
├── data/              # Raw and processed demographic datasets
├── models/            # Forecasting and ML models
├── pipelines/         # Data ingestion and transformation workflows
└── docs/              # Documentation and research notes
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the API server:
```bash
python app.py
```

The API runs at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install packages:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application runs at `http://localhost:3000`

## API Endpoints

- `GET /api/population` - Returns global and country population datasets
- `GET /api/country` - Returns detailed demographic profile for a selected country
- `GET /api/predictions` - Returns neural forecast outputs through 2100
- `GET /api/trends` - Returns global and regional growth patterns
- `GET /api/tags` - Returns intelligence classification labels
- `GET /api/map` - Returns geospatial demographic layers

## AWS Deployment

The application is designed for AWS deployment:
- **S3**: Stores dataset files and versioning
- **AWS Glue**: Processes ETL pipelines for normalization
- **SageMaker**: Trains and serves forecasting models
- **Lambda**: Runs serverless API functions
- **CloudFront**: Delivers frontend assets with low latency

## License

MIT
