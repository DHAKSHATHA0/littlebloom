# 🚀 COMPLETE DEPLOYMENT GUIDE: LITTLE BLOOM ON RENDER

## PHASE 1: PREPARE YOUR PROJECT (LOCAL)

### Step 1.1: Install Required Tools
- ✅ Node.js (v14+) - Already have for frontend
- ✅ Java JDK 11+ - For backend compilation
- ✅ Maven - For Java build (should be with backend)
- ✅ Git - For version control

**Check if you have them:**
```bash
node --version
java -version
mvn --version
git --version
```

---

### Step 1.2: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `little-bloom` (or any name)
3. **Description:** Little Bloom - Premium Baby E-Commerce Platform
4. **Make it PUBLIC** (required for Render free tier)
5. Click "Create repository"

**Local Setup:**
```bash
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Documents\little-bloom\little-bloom-app

# Initialize git
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/little-bloom.git

# Create main branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit: Little Bloom e-commerce platform"

# Push to GitHub
git push -u origin main
```

---

### Step 1.3: Organize Project Structure

Your project should look like:
```
little-bloom-app/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── .env
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── target/
├── database/
│   ├── schema.sql
│   └── sample_data.sql
├── .gitignore
└── render.yaml
```

---

### Step 1.4: Update `.gitignore`

Create/Update `.gitignore` in root folder:
```
# Node
frontend/node_modules/
frontend/build/
frontend/.env.local
frontend/.env

# Java
backend/target/
backend/.classpath
backend/.project
backend/.settings/
*.class

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## PHASE 2: CONFIGURE BACKEND (JAVA/SPRING BOOT)

### Step 2.1: Update Backend `pom.xml`

Go to `backend/pom.xml` and ensure you have:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.littlebloom</groupId>
    <artifactId>littlebloom-backend</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Little Bloom Backend</name>
    <description>Premium Baby E-Commerce Platform</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
        <relativePath/>
    </parent>

    <java.version>11</java.version>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
            <version>0.11.5</version>
        </dependency>

        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

### Step 2.2: Update Backend `application.properties`

**File:** `backend/src/main/resources/application.properties`

```properties
# Server Configuration
server.port=${PORT:8080}
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Application Properties
app.jwt.secret=${JWT_SECRET:littlebloomsecretkey123456789}
app.jwt.expiration=86400000

# Logging
logging.level.root=INFO
logging.level.com.littlebloom=DEBUG
```

---

### Step 2.3: Create Production Profile

**File:** `backend/src/main/resources/application-prod.properties`

```properties
server.port=${PORT:8080}
server.servlet.context-path=/api

# Production Database
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.hikari.maximum-pool-size=5

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=86400000

logging.level.root=WARN
logging.level.com.littlebloom=INFO
```

---

### Step 2.4: Build Backend Locally

```bash
cd backend

# Clean and build
mvn clean package -DskipTests

# Check if build was successful
# You should see: littlebloom-backend-1.0.0.jar in target/ folder
```

---

## PHASE 3: CONFIGURE FRONTEND (REACT)

### Step 3.1: Create Frontend `.env.production`

**File:** `frontend/.env.production`

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_ENV=production
```

---

### Step 3.2: Update API Service

**File:** `frontend/src/services/api.js`

Make sure it has:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Don't hardcode URLs, use environment variable
```

---

### Step 3.3: Build Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Check if build succeeds
# You should see a "build/" folder created
```

---

## PHASE 4: CREATE RENDER CONFIGURATION

### Step 4.1: Create `render.yaml` in ROOT

**File:** `/little-bloom-app/render.yaml`

```yaml
services:
  - type: web
    name: little-bloom-backend
    env: java
    region: oregon
    plan: free
    buildCommand: cd backend && mvn clean package -DskipTests
    startCommand: java -jar backend/target/littlebloom-backend-1.0.0.jar
    healthCheckPath: /api/health
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: mysql-db
          property: connectionString
      - key: DB_USERNAME
        fromDatabase:
          name: mysql-db
          property: username
      - key: DB_PASSWORD
        fromDatabase:
          name: mysql-db
          property: password
      - key: JWT_SECRET
        value: littlebloom-secret-key-change-in-production
    
  - type: web
    name: little-bloom-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/build
    routes:
      - type: http
        path: /
    envVars:
      - key: REACT_APP_API_URL
        value: https://your-backend-name.onrender.com/api
        
  - type: mysql
    name: mysql-db
    region: oregon
    plan: free
    initialDatabase: little_bloom
```

**⚠️ IMPORTANT:** Replace `your-backend-name` with your actual backend service name after creating it!

---

### Step 4.2: Create Health Check Endpoint (Optional but recommended)

**File:** `backend/src/main/java/com/littlebloom/controller/HealthController.java`

```java
package com.littlebloom.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {
    
    @GetMapping
    public ResponseEntity<?> health() {
        return ResponseEntity.ok("✅ Server is running!");
    }
}
```

---

## PHASE 5: PUSH TO GITHUB

### Step 5.1: Commit All Changes

```bash
cd c:\Users\DHAKSHATHA SELVARAJ\OneDrive\Documents\little-bloom\little-bloom-app

# Check git status
git status

# Add all files
git add .

# Commit with message
git commit -m "Add render.yaml and production configurations"

# Push to GitHub
git push origin main
```

---

## PHASE 6: DEPLOY ON RENDER

### Step 6.1: Go to Render Dashboard

1. Open https://render.com
2. Sign up with GitHub (recommended)
   - Click "Sign up with GitHub"
   - Authorize Render
   - Connect your GitHub account
3. Click "Create +" button

---

### Step 6.2: Deploy from Blueprint

1. Click "Create +" → "Blueprint"
2. Select your GitHub repository `little-bloom`
3. Choose `main` branch
4. Render will auto-detect `render.yaml`
5. Review the services:
   - ✅ Backend (Java)
   - ✅ Frontend (React)
   - ✅ MySQL Database

---

### Step 6.3: Configure Services

**For Backend:**
- Name: `little-bloom-backend`
- Region: Oregon (fastest)
- Plan: Free
- Environment: Auto-detected as Java

**For Frontend:**
- Name: `little-bloom-frontend`
- Region: Oregon
- Plan: Free
- Environment: Static site

**For Database:**
- Name: `mysql-db`
- Plan: Free

---

### Step 6.4: Deploy!

1. Click "Deploy Blueprint"
2. Wait for all services to build (5-10 minutes)
3. Watch the logs
4. When all show ✅, your site is LIVE!

---

## PHASE 7: AFTER DEPLOYMENT

### Step 7.1: Get Your URLs

After deployment, you'll get:
- **Frontend URL:** `https://little-bloom-frontend.onrender.com`
- **Backend URL:** `https://little-bloom-backend.onrender.com/api`
- **Database:** Internal connection only

---

### Step 7.2: Update Frontend with Backend URL

1. Go to Render Dashboard
2. Click on `little-bloom-frontend`
3. Go to "Environment"
4. Update `REACT_APP_API_URL` to your actual backend URL
5. Click "Save Changes" (will auto-redeploy)

---

### Step 7.3: Initialize Database

1. Get MySQL credentials from Render dashboard
2. Connect with MySQL client:
   ```bash
   mysql -h your-host.render.com -u root -p -P 3306
   ```
3. Import schema:
   ```bash
   mysql -h your-host.render.com -u root -p < database/schema.sql
   ```
4. Import sample data:
   ```bash
   mysql -h your-host.render.com -u root -p < database/sample_data.sql
   ```

---

### Step 7.4: Test Your Deployment

1. **Frontend:** Open `https://little-bloom-frontend.onrender.com`
2. **Backend API:** Visit `https://little-bloom-backend.onrender.com/api/health`
3. **Should see:** ✅ Server is running!

---

## PHASE 8: TROUBLESHOOTING

### Issue: Backend won't start

**Check logs:**
1. Render Dashboard → Backend service → Logs tab
2. Look for errors
3. Common issues:
   - Database not initialized
   - Wrong environment variables
   - Missing dependencies in pom.xml

**Fix:**
```bash
# Rebuild locally
cd backend
mvn clean package -DskipTests

# If build fails, fix errors locally first
```

---

### Issue: Frontend shows blank page

**Check:**
1. Browser console (F12 → Console tab)
2. Network tab for API errors
3. Update `.env` file with correct backend URL

**Fix:**
```bash
cd frontend
npm install
npm run build
```

---

### Issue: Database connection error

**Check:**
1. Render Dashboard → Database → Info tab
2. Copy correct connection string
3. Update environment variables in backend service
4. Restart backend service

---

### Issue: React API calls failing

**Check:**
1. CORS settings in backend (add if needed)
2. Backend URL in frontend `.env`
3. API endpoints match

**Add CORS to Backend:**

**File:** `backend/src/main/java/com/littlebloom/config/CorsConfig.java`

```java
package com.littlebloom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## PHASE 9: CONTINUOUS DEPLOYMENT

### Auto-Deploy on GitHub Push

Render automatically deploys whenever you push to GitHub:

```bash
# Make changes locally
# Commit and push
git add .
git commit -m "Fix: Update product card styling"
git push origin main

# Render will auto-deploy in 2-3 minutes!
```

---

## PHASE 10: MONITORING & MAINTENANCE

### View Logs
1. Render Dashboard → Service → Logs tab
2. Real-time log streaming

### Monitor Performance
1. Render Dashboard → Service → Metrics tab
2. CPU, Memory, Network usage

### Restart Service
1. Render Dashboard → Service
2. Click "Restart Service"

### Update Environment Variables
1. Render Dashboard → Service → Environment
2. Edit variables
3. Changes auto-deploy

---

## ✅ FINAL CHECKLIST

- [ ] GitHub account created
- [ ] Repository pushed to GitHub (public)
- [ ] Backend builds locally without errors
- [ ] Frontend builds locally without errors
- [ ] `render.yaml` file created in root
- [ ] Environment variables configured
- [ ] `pom.xml` has correct JAR name
- [ ] `.gitignore` configured
- [ ] Logged into Render with GitHub
- [ ] Blueprint deployed successfully
- [ ] All 3 services show ✅ (Backend, Frontend, Database)
- [ ] Database initialized with schema
- [ ] Frontend URL accessible
- [ ] Backend health check working
- [ ] Frontend can call backend API
- [ ] Sample data loaded to database

---

## 🎉 YOU'RE LIVE!

Your Little Bloom e-commerce platform is now deployed on Render!

**Your URLs:**
- 🌐 Frontend: `https://little-bloom-frontend.onrender.com`
- 🔧 Backend: `https://little-bloom-backend.onrender.com/api`
- 📊 Admin: Monitor at https://dashboard.render.com

---

## 📞 SUPPORT RESOURCES

- Render Docs: https://render.com/docs
- Java/Spring Boot: https://spring.io/guides
- React Build: https://create-react-app.dev/deployment/

---

## 🚀 NEXT STEPS

1. Test your live website
2. Add your product images
3. Customize email notifications
4. Set up backup strategy
5. Monitor performance
6. Plan scaling strategy

Good luck! 🎉
