# How to Access Your Code Files

## 📍 Project Location
All your code files are located at:
```
C:\Users\Andy_\population-dashboard
```

## 🖥️ Method 1: Using File Explorer (Easiest)

1. **Open File Explorer** (Press `Windows Key + E`)
2. **Navigate to**: `C:\Users\Andy_`
3. **Double-click** the `population-dashboard` folder
4. You'll see:
   - `backend/` folder (Python code)
   - `frontend/` folder (React code)
   - Documentation files (`.md` files)

### Quick Access:
- Copy this path: `C:\Users\Andy_\population-dashboard`
- Press `Windows Key + R`
- Paste the path and press Enter

## 💻 Method 2: Using VS Code / Cursor (Best for Editing)

### Option A: Open from File Explorer
1. Navigate to `C:\Users\Andy_\population-dashboard` in File Explorer
2. **Right-click** on the folder
3. Select **"Open with Code"** or **"Open with Cursor"**

### Option B: Open from Command Line
1. Open **PowerShell** or **Command Prompt**
2. Type:
```powershell
cd C:\Users\Andy_\population-dashboard
code .
```
Or for Cursor:
```powershell
cd C:\Users\Andy_\population-dashboard
cursor .
```

### Option C: Open from VS Code/Cursor Menu
1. Open VS Code or Cursor
2. Click **File → Open Folder**
3. Navigate to: `C:\Users\Andy_\population-dashboard`
4. Click **Select Folder**

## 📂 Method 3: Using PowerShell/Command Prompt

1. Press `Windows Key + X`
2. Select **"Windows PowerShell"** or **"Terminal"**
3. Type:
```powershell
cd C:\Users\Andy_\population-dashboard
```
4. List files:
```powershell
dir
```
5. Open specific file:
```powershell
notepad backend\app.py
```
Or use VS Code:
```powershell
code backend\app.py
```

## 🗂️ Key Files to Access

### Backend Files (Python)
- **Main API**: `C:\Users\Andy_\population-dashboard\backend\app.py`
- **Data Generator**: `C:\Users\Andy_\population-dashboard\backend\scripts\generate_data.py`
- **ML Training**: `C:\Users\Andy_\population-dashboard\backend\scripts\train_model.py`

### Frontend Files (React)
- **Main App**: `C:\Users\Andy_\population-dashboard\frontend\src\App.js`
- **Home Page**: `C:\Users\Andy_\population-dashboard\frontend\src\components\Home.js`
- **Header**: `C:\Users\Andy_\population-dashboard\frontend\src\components\Header.js`
- **Styles**: `C:\Users\Andy_\population-dashboard\frontend\src\index.css`

## 🚀 Quick Commands

### Open in VS Code/Cursor
```powershell
# Navigate to project
cd C:\Users\Andy_\population-dashboard

# Open entire project
code .
# or
cursor .

# Open specific folder
code backend
code frontend
```

### Open Specific Files
```powershell
# Backend API
code backend\app.py

# Frontend Home page
code frontend\src\components\Home.js

# Main styles
code frontend\src\index.css
```

## 📋 File Structure Quick Reference

```
C:\Users\Andy_\population-dashboard\
│
├── backend\              ← Python Flask API
│   ├── app.py           ← Main API server
│   └── scripts\         ← Data & ML scripts
│
├── frontend\            ← React Dashboard
│   └── src\
│       ├── App.js       ← Main React app
│       └── components\  ← All React components
│
└── *.md                 ← Documentation files
```

## 🎯 Recommended Workflow

1. **Open the entire project in VS Code/Cursor**:
   ```powershell
   cd C:\Users\Andy_\population-dashboard
   code .
   ```

2. **Use the sidebar** to navigate files:
   - Click folders to expand
   - Click files to open them
   - Use `Ctrl+P` to quickly search for files

3. **Edit files** directly in the editor

4. **Save changes** with `Ctrl+S`

## 💡 Tips

- **Quick File Search**: In VS Code/Cursor, press `Ctrl+P` and type filename
- **Search in Files**: Press `Ctrl+Shift+F` to search across all files
- **Open Terminal**: Press `` Ctrl+` `` (backtick) to open integrated terminal
- **Split View**: Right-click a file tab → "Split Right" to see multiple files

## 🔍 Verify Files Exist

Run this in PowerShell to see all your code files:
```powershell
cd C:\Users\Andy_\population-dashboard
Get-ChildItem -Recurse -Include *.js,*.jsx,*.py,*.css | Select-Object FullName
```
