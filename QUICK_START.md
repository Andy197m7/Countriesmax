# Quick Start Guide

## ✅ Current Status

**Both servers are running!**

- **Backend API**: http://localhost:5000
- **Frontend Dashboard**: http://localhost:3000

## 🌐 Open in Browser

Simply open your web browser and go to:

```
http://localhost:3000
```

The dashboard should load automatically!

## 📊 What You'll See

1. **Dashboard** - Overview with statistics and country analysis
2. **Trends** - Global population trends and comparisons
3. **Predictions** - ML-powered population forecasts
4. **Hotspots** - Growth hotspot identification

## 🔧 If Browser Doesn't Open Automatically

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Type in the address bar: `http://localhost:3000`
3. Press Enter

## 🛑 To Stop Servers

Press `Ctrl+C` in the terminal windows where the servers are running.

## ✅ Verify Everything Works

Run the status check:
```powershell
.\check-status.ps1
```

## 🐛 Troubleshooting

### If you see "Connection Refused" or "Cannot Connect":

1. **Check Backend**: Make sure you see "Running on http://127.0.0.1:5000" in the backend terminal
2. **Check Frontend**: Make sure you see "webpack compiled" in the frontend terminal
3. **Wait a moment**: React apps can take 10-30 seconds to fully start

### If the page loads but shows errors:

1. Check the browser console (F12) for error messages
2. Make sure the backend is running on port 5000
3. Check that both servers are in the correct directories

## 📝 Server Logs

- **Backend logs**: Show API requests and responses
- **Frontend logs**: Show compilation status and warnings (warnings are normal)

## 🎉 You're All Set!

The dashboard is ready to use. Explore the different pages to see:
- Population data for 250 countries
- 55 years of historical data (1970-2024)
- ML predictions for future growth
- Interactive charts and visualizations
