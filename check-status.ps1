# Check if servers are running
Write-Host "Checking server status..." -ForegroundColor Cyan
Write-Host ""

# Check backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 2 -UseBasicParsing
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✓ Backend is running on http://localhost:5000" -ForegroundColor Green
        $health = $backendResponse.Content | ConvertFrom-Json
        Write-Host "  Status: $($health.status)" -ForegroundColor Gray
        Write-Host "  Data loaded: $($health.data_loaded)" -ForegroundColor Gray
        Write-Host "  Model loaded: $($health.model_loaded)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Backend is NOT running" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  Start it with: cd backend; python app.py" -ForegroundColor Yellow
}

Write-Host ""

# Check frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend is running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend is NOT running" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  Start it with: cd frontend; npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "If both are running, open your browser to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White -BackgroundColor DarkBlue
