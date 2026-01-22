@echo off
echo ==========================================
echo      Starting QRide System
echo ==========================================

echo [1/2] Starting Backend Server (Port 5000)...
start "QRide Backend" cmd /k "npm run server"

echo [2/2] Starting Frontend Application (Vite)...
start "QRide Frontend" cmd /k "npm run dev"

echo ==========================================
echo Servers are running in separate windows.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo ==========================================
pause
