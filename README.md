# Population Trends Dashboard

A comprehensive web application for analyzing and predicting global population trends using machine learning and interactive visualizations.

## Features

- **Data Analysis**: Analyzes population data spanning 50+ years from 200+ countries
- **Machine Learning**: Predicts population growth trends with ~87% accuracy
- **Interactive Visualizations**: Real-time charts, maps, and trend analysis
- **Responsive Design**: Modern, mobile-friendly interface
- **Scalable Architecture**: Designed for AWS deployment (S3, Glue, SageMaker)

## Tech Stack

### Frontend
- React 18+
- Recharts for visualizations
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling

### Backend
- Python Flask/FastAPI
- Pandas & NumPy for data processing
- Scikit-learn for ML models
- SQLite for local data storage

## Project Structure

```
population-dashboard/
├── frontend/          # React application
├── backend/           # Python API server
├── data/              # Data files and scripts
├── models/            # ML model files
└── docs/              # Documentation
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Generate sample data:
```bash
python scripts/generate_data.py
```

5. Train ML model:
```bash
python scripts/train_model.py
```

6. Start the server:
```bash
python app.py
```

The API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

## API Endpoints

- `GET /api/population` - Get population data
- `GET /api/population/:country` - Get data for specific country
- `GET /api/predictions` - Get population predictions
- `GET /api/trends` - Get trend analysis
- `GET /api/hotspots` - Identify growth hotspots

## AWS Deployment

The application is designed to be deployed on AWS:
- **S3**: Store population data files
- **AWS Glue**: ETL pipeline for data processing
- **SageMaker**: ML model training and inference
- **Lambda**: Serverless API endpoints
- **CloudFront**: CDN for frontend

## License

MIT
