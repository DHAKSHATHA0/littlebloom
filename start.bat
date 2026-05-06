@echo off
title Little Bloom - System Startup

echo ==========================================
echo  Little Bloom E-commerce Platform
echo ==========================================

echo.
echo Starting Python Analytics Server...
cd analytics-server
start "Analytics Server" cmd /k "python app.py"

echo.
echo Starting Backend Server...
cd ../backend
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo Waiting for services to initialize...
timeout /t 15

echo.
echo Starting Frontend Application...
cd ../frontend
start "Frontend App" cmd /k "npm start"

echo.
echo ==========================================
echo  System Started Successfully!
echo  
echo  Analytics: http://localhost:5000
echo  Backend:   http://localhost:8080
echo  Frontend:  http://localhost:3000
echo  
echo  Login as a seller to view analytics.
echo ==========================================

pause