# Quick start script for backend (Windows PowerShell)
Write-Host "Starting Population Dashboard Backend..." -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "backend\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r backend\requirements.txt

# Check if data exists
if (-not (Test-Path "backend\data\population_data.csv")) {
    Write-Host "Generating sample data..." -ForegroundColor Yellow
    python backend\scripts\generate_data.py
}

# Check if model exists
if (-not (Test-Path "backend\models\population_model.pkl")) {
    Write-Host "Training ML model..." -ForegroundColor Yellow
    python backend\scripts\train_model.py
}

# Start server
Write-Host "Starting Flask server..." -ForegroundColor Green
Write-Host "API will be available at http://localhost:5000" -ForegroundColor Cyan
cd backend
python app.py
