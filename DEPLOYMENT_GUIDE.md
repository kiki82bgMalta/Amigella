# AMIGELLA - DEPLOYMENT GUIDE

Kako postaviti Amigella na produkciju (cloud server).

---

## 🌐 HOSTING OPCIJE

### Backend Server
- **Heroku** (jednostavno, plaćeno)
- **AWS EC2** (kontrola, jeftinije)
- **DigitalOcean** (jednostavno, preporučeno)
- **Render** (besplatno tier)

### Database
- **AWS RDS (PostgreSQL)**
- **Heroku PostgreSQL**
- **DigitalOcean PostgreSQL**

### Mobile App
- **Google Play Store** (Android)
- **Apple App Store** (iOS)

### File Storage (Voice Recording)
- **AWS S3**
- **DigitalOcean Spaces**
- **Cloudinary**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Backend API testiran lokalno
- [ ] PostgreSQL baza optimizovana
- [ ] Google Gemini API key validiran
- [ ] Environment variables postavljeni
- [ ] CORS konfiguracija fine-tuned
- [ ] SSL certifikati spremni
- [ ] Database backups konfigurirani
- [ ] Monitoring setup (Sentry, Datadog)
- [ ] Logging aktiviran
- [ ] React Native app builda lokalno

---

## 🚀 DEPLOYMENT NA DIGITALOCEAN

### 1. Kreiraj DigitalOcean Account

https://www.digitalocean.com

Registruj se i kreiraj App Platform project.

### 2. PostgreSQL Baza

```bash
# DigitalOcean: Kreiraj novo Database (PostgreSQL 14+)
# - CPU: Basic ($15/month)
- RAM: 1GB
- Storage: 25 GB

# Sačuvaj connection string:
postgresql://user:password@host:port/dbname
```

### 3. Node.js Backend na App Platform

**A) Kreiraj App na DigitalOcean**

```bash
doctl apps create \
  --spec app.yaml
```

**B) app.yaml konfiguracija**

```yaml
name: amigella-calendar
services:
- name: backend
  github:
    repo: your-github/amigella
    branch: main
  build_command: npm install
  run_command: npm run start
  envs:
  - key: NODE_ENV
    value: production
  - key: DB_USER
    scope: RUN_AND_BUILD_TIME
    value: ${DB.USERNAME}
  - key: DB_PASSWORD
    scope: RUN_AND_BUILD_TIME
    value: ${DB.PASSWORD}
  - key: DB_HOST
    scope: RUN_AND_BUILD_TIME
    value: ${DB.HOST}
  - key: DB_PORT
    scope: RUN_AND_BUILD_TIME
    value: "5432"
  - key: DB_NAME
    scope: RUN_AND_BUILD_TIME
    value: amigella
  - key: GEMINI_API_KEY
    scope: RUN_AND_BUILD_TIME
    value: ${GEMINI_API_KEY}
  http_port: 3000

databases:
- name: db
  engine: PG
  version: "14"
```

**C) Deploy**

```bash
# Pokreni build
npm run build

# Deploy na DigitalOcean
git push origin main

# DigitalOcean će automatski deployati
```

### 4. Production Database Setup

```bash
# Konektuj se na DigitalOcean PostgreSQL
psql -U doadmin -h db-postgresql-xxx.ondigitalocean.com -p 25060 -d defaultdb

# Učitaj schema
\i schema.sql

# Kreiraj indexe
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_voice_logs_user_id ON voice_logs(user_id);
```

---

## 📱 DEPLOY REACT NATIVE APP

### Apple App Store (iOS)

1. **Kreiraj Apple Developer Account**
   - https://developer.apple.com

2. **Kreiraj App ID**
   ```bash
   cd ios
   # Otvori Xcode
   # Sign & Capabilities → Team
   ```

3. **Build za App Store**
   ```bash
   # iOS - Kreiraj production build
   react-native build-ios --prod
   
   # ili koristi EAS (Expo)
   eas build --platform ios
   ```

4. **Upload na App Store**
   - Xcode → Product → Archive
   - Organizer → Distribute App
   - App Store Connect

### Google Play Store (Android)

1. **Kreiraj Google Play Developer Account**
   - https://play.google.com/apps/publish

2. **Kreiraj signed APK/AAB**
   ```bash
   cd android
   
   # Generiši keystore
   keytool -genkey -v -keystore amigella-key.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias amigella-key
   
   # Build production AAB
   ./gradlew bundleRelease
   ```

3. **Upload na Google Play**
   - Google Play Console → Create App
   - Upload Bundle
   - Fill in store listing

---

## 🔒 SECURITY

### Environment Variables (Production)

```bash
# Nikada commit-uj .env fajl!
echo ".env" >> .gitignore

# Koristi Secret Manager:
# AWS Secrets Manager, DigitalOcean App Spec, itd.
```

### Database Security

```sql
-- Kreiraj dedicated user (ne koristi root/postgres)
CREATE USER amigella_user WITH PASSWORD 'complex_password_here';

-- Dodelи samo potrebne permisije
GRANT CONNECT ON DATABASE amigella TO amigella_user;
GRANT USAGE ON SCHEMA public TO amigella_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO amigella_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO amigella_user;
```

### SSL/TLS

```bash
# Kreiraj SSL sertifikate (Let's Encrypt)
# DigitalOcean će automatski omogućiti HTTPS

# Proverite:
curl https://api.amigella.com/health
```

### CORS (Production)

```javascript
// backend-api.js
const corsOptions = {
  origin: [
    'https://amigella-app.com',
    'https://app.amigella.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

---

## 📊 MONITORING & LOGGING

### Sentry (Error Tracking)

```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// backend-api.js top
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Datadog (Metrics)

```bash
npm install datadog-api-client
```

### Console Logging

```javascript
// Prati voice processing
console.log(`[VOICE] User ${userId} uploaded audio`);
console.log(`[VOICE] Gemini returned: ${confidence}`);
console.log(`[SENTINEL] Super Biser detected: ${appointmentCount}`);
```

---

## 🔄 CONTINUOUS DEPLOYMENT (GitHub Actions)

### .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Deploy to DigitalOcean
        env:
          DIGITALOCEAN_TOKEN: ${{ secrets.DIGITALOCEAN_TOKEN }}
        run: |
          doctl apps update $APP_ID --spec app.yaml
```

---

## 🚨 BACKUP & DISASTER RECOVERY

### Auto Backups (PostgreSQL)

```bash
# DigitalOcean omogućava automatske backup-e
# DigitalOcean Console → Database → Backup → Enable

# Ili koristi pg_dump
pg_dump -h host -U user dbname > backup.sql

# Restore
psql -h host -U user -d dbname < backup.sql
```

### Voice Files Backup (S3)

```javascript
// Koristi AWS S3 za audio file-ove
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function uploadVoiceToS3(filePath, userId) {
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: 'amigella-voice-files',
    Key: `voices/${userId}/${Date.now()}.mp3`,
    Body: fileContent,
  };
  
  return s3.upload(params).promise();
}
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Queries

```sql
-- Obavezni INDEXES za brže query-je
CREATE INDEX idx_appointments_user_id_date 
  ON appointments(user_id, DATE(start_time));

CREATE INDEX idx_voice_logs_user_id_created 
  ON voice_logs(user_id, created_at DESC);

-- Analyze performance
EXPLAIN ANALYZE
SELECT * FROM appointments 
WHERE user_id = $1 AND DATE(start_time) = $2;
```

### Caching

```javascript
// Koristi Redis za caching free slots
const redis = require('redis');
const client = redis.createClient();

async function getFreeSlots(userId, date) {
  const cacheKey = `free_slots:${userId}:${date}`;
  
  // Proveri cache
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Nema u cache-u, query bazu
  const slots = await findFreeSlots(userId, date);
  
  // Store u cache (30 minuta)
  await client.setex(cacheKey, 1800, JSON.stringify(slots));
  
  return slots;
}
```

### CDN za Images/Static Files

```bash
# Koristi Cloudflare ili DigitalOcean CDN
# Za voice files korisiti S3 CloudFront
```

---

## ✅ POST-DEPLOYMENT

### Final Tests

```bash
# 1. Test API
curl https://api.amigella.com/api/health

# 2. Test Database Connection
curl -X POST https://api.amigella.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@amigella.com","full_name":"Test"}'

# 3. Test Voice Processing
# Upload test audio fajl

# 4. Test Sentinel
curl -X POST https://api.amigella.com/api/sentinel/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","date":"2024-12-20"}'

# 5. Monitor Logs
doctl apps logs --app $APP_ID --log-type build
doctl apps logs --app $APP_ID --log-type runtime
```

### Konfiguruj Domain

```bash
# Dodaj custom domain
# DigitalOcean Console → App → Settings → Domains

# DNS records
A record: api.amigella.com → DigitalOcean IP
CNAME: www.amigella.com → amigella-app.com
```

---

## 🎯 LAUNCH CHECKLIST

- [ ] Backend na production server ✅
- [ ] PostgreSQL baza pokrenuta ✅
- [ ] SSL/TLS konfiguriran ✅
- [ ] Google Gemini API key postavljen ✅
- [ ] Monitoring & logging aktivno ✅
- [ ] Backups konfiguriran ✅
- [ ] React Native app na App Store ✅
- [ ] React Native app na Google Play ✅
- [ ] Domain konfiguriran ✅
- [ ] Social media promocija 📢

---

**Amigella je sada live na produkciji! 🎉**
