@echo off
REM quick-start.bat - Start both frontend and backend (Windows)

title DocNova PDF Tools - Quick Start
echo.
echo ╔════════════════════════════════════════════════╗
echo ║   DocNova PDF Tools - Quick Start              ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js
    pause
    exit /b 1
)

echo ✓ Python found
echo ✓ Node.js found
echo.

REM Start backend
echo 📦 Starting Backend...
cd backend
start "Backend" cmd /k python app.py

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak

REM Check if backend is running
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is healthy at http://localhost:5000
) else (
    echo ⚠️  Backend might not be ready, but continuing...
)

echo.
echo 🎨 Starting Frontend...
cd ..
cmd /k npm run dev
