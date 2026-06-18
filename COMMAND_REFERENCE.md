# 🔧 COMMAND REFERENCE - COPY & PASTE

## PRE-DEPLOYMENT SETUP

### Check Prerequisites
```bash
node --version
java -version
mvn --version
git --version
```

Expected output:
- Node: v14+ ✅
- Java: 11+ ✅
- Maven: 3.6+ ✅
- Git: 2.20+ ✅

---

## GITHUB SETUP

### 1. Initialize Git (if not done)
```bash
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Documents\little-bloom\little-bloom-app

git init
```

### 2. Configure Git
```bash
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
```

### 3. Add Remote (After creating repo on GitHub)
```bash
git remote add origin https://github.com/YOUR_USERNAME/little-bloom.git
```

Replace `YOUR_USERNAME` with your actual GitHub username!

### 4. Check Remote
```bash
git remote -v
```

Should show:
```
origin  https://github.com/YOUR_USERNAME/little-bloom.git (fetch)
origin  https://github.com/YOUR_USERNAME/little-bloom.git (push)
```

### 5. Set Main Branch
```bash
git branch -M main
```

### 6. Add All Files
```bash
git add .
```

### 7. Initial Commit
```bash
git commit -m "Initial commit: Little Bloom e-commerce platform"
```

### 8. Push to GitHub
```bash
git push -u origin main
```

---

## LOCAL BUILD TESTING

### Build Backend Locally
```bash
cd backend

# Clean and build
mvn clean package -DskipTests

# Watch for: BUILD SUCCESS
```

Expected files created:
```
backend/target/littlebloom-backend-1.0.0.jar
```

### Build Frontend Locally
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Watch for: built successfully
```

Expected folder created:
```
frontend/build/ (with index.html)
```

---

## PUSHING UPDATES TO GITHUB

### After making changes:
```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Your descriptive message"

# Push to GitHub
git push origin main
```

---

## COMMON GIT COMMANDS

### Check Git Status
```bash
git status
```

### View Recent Commits
```bash
git log --oneline
```

### View Branches
```bash
git branch -a
```

### Undo Last Commit (before push)
```bash
git reset HEAD~1
```

### Discard Local Changes
```bash
git checkout -- .
```

### Force Push (USE CAREFULLY!)
```bash
git push origin main --force
```

---

## MYSQL LOCAL TESTING (Optional)

### Start MySQL Server
```bash
# Windows
mysql -u root -p

# macOS
/usr/local/mysql/bin/mysql -u root -p
```

### Create Database
```sql
CREATE DATABASE little_bloom;
USE little_bloom;
```

### Import Schema
```bash
mysql -u root -p little_bloom < database/schema.sql
```

### Import Sample Data
```bash
mysql -u root -p little_bloom < database/sample_data.sql
```

### View Tables
```sql
SHOW TABLES;
DESCRIBE products;
```

---

## AFTER RENDER DEPLOYMENT

### Get Database Credentials
```
1. Go to: https://dashboard.render.com
2. Click: little-bloom-db
3. View: Info tab
4. Copy: Connection string, Username, Password
```

### Connect to Remote Database
```bash
mysql -h your-render-host.mysql.render.com \
      -u your_username \
      -p \
      -P 3306
```

### Import Schema to Render Database
```bash
mysql -h your-render-host.mysql.render.com \
      -u your_username \
      -p \
      little_bloom < database/schema.sql
```

### Import Sample Data
```bash
mysql -h your-render-host.mysql.render.com \
      -u your_username \
      -p \
      little_bloom < database/sample_data.sql
```

### Test Connection
```bash
mysql -h your-render-host.mysql.render.com \
      -u your_username \
      -p \
      -e "SELECT 1;"
```

---

## USEFUL COMMANDS FOR DEVELOPMENT

### Clean Build
```bash
# Backend
cd backend
mvn clean

# Frontend
cd frontend
rm -rf node_modules build
```

### Reinstall Dependencies
```bash
# Backend (re-download Maven dependencies)
cd backend
mvn dependency:resolve

# Frontend
cd frontend
npm install
```

### Run Locally (Development)

#### Frontend
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

#### Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

### Check Ports in Use
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# macOS/Linux
lsof -i :3000
lsof -i :8080
```

### Kill Process on Port
```bash
# Windows
taskkill /PID <process_id> /F

# macOS/Linux
kill -9 <process_id>
```

---

## ENVIRONMENT VARIABLES

### Frontend (.env file)
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### Backend (application.properties)
```
spring.datasource.url=jdbc:mysql://localhost:3306/little_bloom
spring.datasource.username=root
spring.datasource.password=
```

---

## TROUBLESHOOTING COMMANDS

### Check Java Installation
```bash
java -version
javac -version
```

### Check Maven Installation
```bash
mvn --version
```

### Check Node Installation
```bash
node --version
npm --version
```

### Update Node Packages
```bash
cd frontend
npm update
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Verify Git Configuration
```bash
git config --global user.name
git config --global user.email
git config --list
```

### Check Git Remote
```bash
git remote -v
git remote show origin
```

---

## FILE OPERATIONS

### Navigate to Project
```bash
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Documents\little-bloom\little-bloom-app
```

### List Files
```bash
# Windows
dir

# macOS/Linux
ls -la
```

### Create Folder
```bash
# Windows
mkdir folder_name

# macOS/Linux
mkdir -p folder_name
```

### Delete File
```bash
# Windows
del filename

# macOS/Linux
rm filename
```

### Find Files
```bash
# Windows
dir /s /b | find "filename"

# macOS/Linux
find . -name "filename"
```

---

## VIEWING LOGS

### Backend Logs (Local)
```bash
cd backend
mvn spring-boot:run 2>&1 | tee app.log
```

### Frontend Logs (Local)
```bash
cd frontend
npm start 2>&1 | tee app.log
```

### View Logs (After line number)
```bash
# Windows
type app.log | more

# macOS/Linux
tail -f app.log
```

---

## VERSION CONTROL BEST PRACTICES

### Daily Workflow
```bash
# 1. Pull latest from GitHub
git pull origin main

# 2. Make your changes
# 3. Test locally

# 4. Check status
git status

# 5. Add changes
git add .

# 6. Commit
git commit -m "Fix: Clear, concise description"

# 7. Push
git push origin main
```

### Good Commit Messages
```bash
git commit -m "Feature: Add product filter"
git commit -m "Fix: Cart total calculation"
git commit -m "Refactor: Improve API response time"
git commit -m "Docs: Update README"
git commit -m "Style: Format code"
```

---

## DEPLOYMENT COMMANDS (Render)

### First Time Deploy
```
1. Push to GitHub
2. Go to: https://render.com
3. Click: New + > Blueprint
4. Select: little-bloom repo
5. Select: main branch
6. Click: Deploy Blueprint
7. Wait: 5-10 minutes
```

### Redeploy (After code changes)
```bash
# Just push to GitHub!
git add .
git commit -m "Your message"
git push origin main

# Render auto-deploys automatically!
# Wait 2-3 minutes
```

### Manual Restart Service
```
1. Go to: https://dashboard.render.com
2. Click: Service name
3. Click: Settings
4. Click: Restart Service
5. Wait: Service restarts
```

---

## QUICK REFERENCE SHEET

| Task | Command |
|------|---------|
| Check prerequisites | `java -v`, `node -v`, `git -v` |
| Navigate project | `cd little-bloom-app` |
| Build backend | `cd backend && mvn clean package` |
| Build frontend | `cd frontend && npm run build` |
| Check git status | `git status` |
| Add files | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| View logs | `git log --oneline` |
| Connect to DB | `mysql -h host -u user -p` |
| Import schema | `mysql -u user -p db < schema.sql` |

---

## ENVIRONMENT SETUP (Windows PowerShell)

### Set Environment Variable (Temporary)
```powershell
$env:REACT_APP_API_URL="https://little-bloom-backend.onrender.com/api"
```

### Set Environment Variable (Permanent)
```powershell
[Environment]::SetEnvironmentVariable("REACT_APP_API_URL", "https://little-bloom-backend.onrender.com/api", "User")
```

### View Environment Variable
```powershell
$env:REACT_APP_API_URL
```

---

## SSH KEYS (Advanced)

### Generate SSH Key (if needed for GitHub)
```bash
ssh-keygen -t ed25519 -C "your.email@gmail.com"
```

### Copy SSH Key to Clipboard
```bash
# Windows
type %USERPROFILE%\.ssh\id_ed25519.pub | clip

# macOS/Linux
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### Add to GitHub SSH Keys
```
1. Go: GitHub > Settings > SSH Keys
2. New SSH key
3. Paste key
4. Save
```

---

## DEBUGGING

### Enable Debug Logging
```bash
# Backend
set DEBUG=littlebloom:*
npm start

# Frontend (React)
# Already shows in browser console
```

### Test API Endpoint
```bash
# Windows PowerShell
Invoke-WebRequest https://your-backend.onrender.com/api/health

# Command line
curl https://your-backend.onrender.com/api/health
```

### Monitor Process
```bash
# View process usage
# Windows
tasklist /v

# macOS/Linux
top
```

---

## BACKUP & RECOVERY

### Create Local Backup
```bash
# Copy entire project
xcopy /E /I /Y little-bloom-app little-bloom-app-backup

# Or zip
tar -czf little-bloom-backup.tar.gz little-bloom-app
```

### Restore from Backup
```bash
# Copy back
xcopy /E /I /Y little-bloom-app-backup little-bloom-app

# Or unzip
tar -xzf little-bloom-backup.tar.gz
```

---

## FINAL CHECKLIST - COMMANDS TO RUN

```bash
# 1. Navigate
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Documents\little-bloom\little-bloom-app

# 2. Check prerequisites
node --version
java -version
mvn --version

# 3. Test builds
cd backend && mvn clean package -DskipTests
cd ../frontend && npm run build

# 4. Git setup
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git remote add origin https://github.com/YOUR_USERNAME/little-bloom.git
git branch -M main

# 5. Push to GitHub
git add .
git commit -m "Initial commit"
git push -u origin main

# 6. Deploy on Render
# Go to https://render.com and click Deploy Blueprint

# 7. Test deployment
# Visit: https://little-bloom-backend.onrender.com/api/health
# Visit: https://little-bloom-frontend.onrender.com
```

---

## SUCCESS! 🎉

If all commands run without errors, you're ready for deployment!

Next step: Go to `QUICK_START_RENDER.md` for step-by-step deployment guide.
