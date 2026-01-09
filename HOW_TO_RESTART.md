# How to Restart the Backend Server

## Step-by-Step Instructions

### Step 1: Stop the Current Server

1. **Find the terminal/command prompt** where the backend is running
   - Look for a window showing Flask output like:
     ```
     * Running on http://127.0.0.1:5000
     * Restarting with stat
     ```

2. **Click on that terminal window** to make it active

3. **Press `Ctrl + C`** to stop the server
   - You should see the server stop and return to the command prompt

### Step 2: Start the Server Again

**Option A: Using PowerShell/Terminal**
1. Make sure you're in the backend directory:
   ```powershell
   cd C:\Users\Andy_\population-dashboard\backend
   ```

2. Start the server:
   ```powershell
   python app.py
   ```

**Option B: Using the Restart Script**
1. Open PowerShell in the project folder:
   ```powershell
   cd C:\Users\Andy_\population-dashboard
   ```

2. Run the restart script:
   ```powershell
   .\restart-backend.ps1
   ```

### Step 3: Verify It's Working

1. Wait a few seconds for the server to start
2. You should see output like:
   ```
   Loaded X records from historical data
   Loaded 233 records from real 2025 data
   Starting Population Trends Dashboard API...
   API will be available at http://localhost:5000
   * Running on http://127.0.0.1:5000
   ```

3. Check the health endpoint:
   - Open browser: `http://localhost:5000/api/health`
   - Should show: `"real_data_loaded": true`

4. Test United States population:
   - Open: `http://localhost:5000/api/population/United%20States`
   - Should show: `347275807` (347 million) for 2025

## Quick Visual Guide

```
1. Find terminal with Flask running
   ↓
2. Press Ctrl+C (stop server)
   ↓
3. Type: python app.py
   ↓
4. Press Enter
   ↓
5. Server restarts with new code!
```

## Troubleshooting

**If you can't find the terminal:**
- Check all open terminal/command prompt windows
- Look for one showing Flask/Python output
- If you can't find it, just open a new terminal and start fresh

**If the server won't start:**
- Make sure you're in the `backend` folder
- Check that Python is installed: `python --version`
- Make sure all dependencies are installed: `pip install -r requirements.txt`

**If you see "port already in use":**
- Another instance might be running
- Close all Python processes and try again
- Or use: `taskkill /F /IM python.exe` (Windows)
