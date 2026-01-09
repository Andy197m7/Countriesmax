# Complete File Structure

## Project Root Location
```
C:\Users\Andy_\population-dashboard\
```

## 📁 Complete Directory Tree

```
population-dashboard/
│
├── 📄 README.md                    # Main project documentation
├── 📄 SETUP.md                     # Setup instructions
├── 📄 QUICK_START.md               # Quick start guide
├── 📄 PROJECT_SUMMARY.md           # Project summary
├── 📄 FILE_STRUCTURE.md            # This file
├── 📄 .gitignore                   # Git ignore rules
├── 📄 check-status.ps1             # PowerShell script to check server status
├── 📄 start-backend.ps1            # PowerShell script to start backend
│
├── 📁 backend/                     # Python Flask Backend
│   ├── 📄 app.py                   # Main Flask API server
│   ├── 📄 requirements.txt         # Python dependencies
│   │
│   ├── 📁 scripts/                 # Data & ML scripts
│   │   ├── 📄 generate_data.py     # Generates sample population data
│   │   └── 📄 train_model.py       # Trains ML prediction model
│   │
│   ├── 📁 data/                    # Generated data files (created at runtime)
│   │   └── 📄 population_data.csv  # Population dataset
│   │
│   └── 📁 models/                  # ML models (created at runtime)
│       ├── 📄 population_model.pkl # Trained ML model
│       ├── 📄 country_encoder.pkl  # Country label encoder
│       └── 📄 model_info.json      # Model metadata
│
└── 📁 frontend/                    # React Frontend
    ├── 📄 package.json             # Node.js dependencies
    ├── 📄 package-lock.json        # Locked dependency versions
    │
    ├── 📁 public/                  # Static public files
    │   └── 📄 index.html          # HTML template
    │
    └── 📁 src/                     # React source code
        ├── 📄 index.js             # React entry point
        ├── 📄 index.css            # Global styles
        ├── 📄 App.js               # Main app component with routing
        ├── 📄 App.css              # App-level styles
        │
        └── 📁 components/          # React components
            ├── 📄 Header.js        # Navigation header
            ├── 📄 Header.css       # Header styles
            │
            ├── 📄 Home.js          # Home page (main dashboard)
            ├── 📄 Home.css         # Home page styles
            │
            ├── 📄 Trends.js        # Trends analysis page
            ├── 📄 Trends.css       # Trends page styles
            │
            ├── 📄 Predictions.js   # ML predictions page
            ├── 📄 Predictions.css # Predictions page styles
            │
            ├── 📄 CountrySelector.js    # Country dropdown component
            ├── 📄 CountrySelector.css  # Country selector styles
            │
            ├── 📄 StatsCard.js     # Stat card component (legacy)
            ├── 📄 StatsCard.css    # Stat card styles (legacy)
            │
            ├── 📄 PopulationChart.js    # Population chart component (legacy)
            ├── 📄 PopulationChart.css   # Chart styles (legacy)
            │
            ├── 📄 Dashboard.js     # Old dashboard (not used anymore)
            ├── 📄 Dashboard.css    # Old dashboard styles (not used)
            │
            ├── 📄 Hotspots.js      # Old hotspots page (not used anymore)
            └── 📄 Hotspots.css     # Old hotspots styles (not used)
```

## 📝 File Descriptions

### Root Files
- **README.md** - Complete project documentation
- **SETUP.md** - Step-by-step setup instructions
- **QUICK_START.md** - Quick reference guide
- **PROJECT_SUMMARY.md** - Project overview and features
- **.gitignore** - Files to exclude from version control
- **check-status.ps1** - Script to verify servers are running
- **start-backend.ps1** - Script to automatically set up and start backend

### Backend Files (`backend/`)

#### Main Application
- **app.py** - Flask API server with all endpoints:
  - `/api/health` - Health check
  - `/api/stats` - Overall statistics
  - `/api/population` - Get population data
  - `/api/population/:country` - Country-specific data
  - `/api/predictions` - ML predictions
  - `/api/trends` - Trend analysis
  - `/api/hotspots` - Growth hotspots
  - `/api/countries` - List all countries

#### Scripts (`backend/scripts/`)
- **generate_data.py** - Creates sample data for 250+ countries over 55 years
- **train_model.py** - Trains Random Forest/Gradient Boosting models

#### Generated Files (created at runtime)
- **data/population_data.csv** - Main dataset
- **models/population_model.pkl** - Trained ML model
- **models/country_encoder.pkl** - Country encoding
- **models/model_info.json** - Model metadata

### Frontend Files (`frontend/`)

#### Configuration
- **package.json** - Node.js dependencies and scripts
- **public/index.html** - HTML template

#### Source Code (`frontend/src/`)
- **index.js** - React entry point, renders App
- **index.css** - Global styles (dark theme background)
- **App.js** - Main component with React Router setup
- **App.css** - App-level layout styles

#### Components (`frontend/src/components/`)

**Active Components (Currently Used):**
- **Header.js/css** - Navigation bar with Home/Trends/Predictions
- **Home.js/css** - Main dashboard page with stats, charts, hotspots
- **Trends.js/css** - Global trends analysis page
- **Predictions.js/css** - ML prediction page
- **CountrySelector.js/css** - Country dropdown selector

**Legacy Components (Not Used in Current Design):**
- **Dashboard.js/css** - Old dashboard (replaced by Home.js)
- **Hotspots.js/css** - Old hotspots page (now part of Home.js)
- **StatsCard.js/css** - Stat card component (replaced by inline cards)
- **PopulationChart.js/css** - Chart component (replaced by inline charts)

## 🗂️ Key Directories

### Backend
- **`backend/`** - All Python/Flask code
- **`backend/scripts/`** - Data generation and ML training
- **`backend/data/`** - Generated CSV data (created at runtime)
- **`backend/models/`** - Trained ML models (created at runtime)

### Frontend
- **`frontend/`** - All React/JavaScript code
- **`frontend/src/`** - React source code
- **`frontend/src/components/`** - All React components
- **`frontend/public/`** - Static HTML files

## 🔍 How to Find Files

### In File Explorer
Navigate to: `C:\Users\Andy_\population-dashboard\`

### In VS Code / Cursor
1. Open the folder: `C:\Users\Andy_\population-dashboard`
2. Use the file explorer sidebar
3. All files are organized in the structure above

### Quick Access
- **Backend API**: `backend/app.py`
- **Frontend Entry**: `frontend/src/index.js`
- **Home Page**: `frontend/src/components/Home.js`
- **Main Styles**: `frontend/src/index.css`
- **Data Script**: `backend/scripts/generate_data.py`
- **ML Script**: `backend/scripts/train_model.py`

## 📊 File Count Summary

- **Backend Python Files**: 3 (app.py + 2 scripts)
- **Frontend React Components**: 13 components
- **CSS Style Files**: 13 files
- **Configuration Files**: 4 (package.json, requirements.txt, .gitignore, etc.)
- **Documentation Files**: 5 markdown files
- **Scripts**: 2 PowerShell scripts

**Total Code Files**: ~40+ files

## 🚀 Quick File Access Commands

### Open in Terminal
```powershell
# Navigate to project
cd C:\Users\Andy_\population-dashboard

# Open backend
cd backend
code app.py  # or use your editor

# Open frontend
cd ..\frontend
code src\App.js  # or use your editor
```

### Find Specific Files
```powershell
# Find all Python files
Get-ChildItem -Recurse -Filter "*.py"

# Find all JavaScript files
Get-ChildItem -Recurse -Filter "*.js"

# Find all CSS files
Get-ChildItem -Recurse -Filter "*.css"
```
