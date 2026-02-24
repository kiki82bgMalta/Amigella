# AMIGELLA - KOMPLETNA IMPLEMENTACIJSKA DOKUMENTACIJA

🚀 **Full Stack Mobile Calendar Application**  
Voice input → AI Processing → Burnout Prevention → React Native Mobile

---

## 📋 STRUKTURA PROJEKTA

```
amigella/
├── backend-api.js                 # Express server (Node.js)
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies
├── schema.sql                     # PostgreSQL database schema
├── app-navigation.js              # React Native navigation setup
├── screens-jutarnji-mir.js        # Dashboard screen (morning view)
├── screens-voice-input.js         # Voice input with Gemini integration
├── screens-sentinel-shield.js     # Burnout prevention modal
├── screens/
│   ├── JutarnjiMirScreen.jsx
│   ├── VoiceInputScreen.jsx
│   ├── CalendarListScreen.jsx
│   ├── SentinelShieldScreen.jsx
│   ├── LoginScreen.jsx
│   ├── RegisterScreen.jsx
│   └── SettingsScreen.jsx
├── api/
│   ├── appointments.js
│   ├── voice.js
│   ├── sentinel.js
│   └── auth.js
└── assets/
    ├── colors.js                 # Design system
    ├── fonts/
    └── icons/
```

---

## 🛠️ SETUP INSTRUKCIJE

### 1️⃣ BACKEND SETUP (Node.js/Express)

#### A) Instaliraj dependencije

```bash
cd /workspaces/Amigella
npm install
```

**Instalacijski paketi:**
- `express` - Web framework
- `pg` - PostgreSQL driver
- `axios` - HTTP client
- `multer` - File upload handling
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing

#### B) Postavi .env fajl

```bash
cp .env.example .env
```

Izmeni `.env`:

```env
DB_USER=korisnik_na_db
DB_PASSWORD=sigurna_sifra
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amigella

PORT=3000
NODE_ENV=development

GEMINI_API_KEY=your_api_key_from_aistudio.google.com
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

#### C) Postavi PostgreSQL bazu podataka

```bash
# Konekcija na PostgreSQL
psql -U postgres -h localhost

# U psql:
CREATE DATABASE amigella;
\c amigella

# Učitaj schema
\i schema.sql
```

#### D) Pokreni backend server

```bash
# Development (sa auto-reload)
npm run dev

# ili Production
npm start
```

Trebalo bi da vidis:

```
╔════════════════════════════════════════╗
║   AMIGELLA BACKEND API                 ║
║   🚀 Server running on port 3000       ║
║   📍 http://localhost:3000            ║
╚════════════════════════════════════════╝
```

---

### 2️⃣ REACT NATIVE SETUP (Mobile App)

#### A) Instaliraj React Native CLI

```bash
# ako već nije instalirano
npm install -g react-native-cli

# ili koristi npx
npx react-native --version
```

#### B) Kreiraj React Native projekt

```bash
# Kreiraj novi RN projekt (ako nije već kreiran)
npx react-native init Amigella --template react-native-template-typescript

# ili koristi Expo (preporučeno za brži razvoj)
npx create-expo-app Amigella
cd Amigella
```

#### C) Instaliraj potrebne pakete

```bash
npm install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/native-stack \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-vector-icons \
  react-native-audio-recorder-player \
  react-native-reanimated \
  axios

# iOS specifiche zavisnosti
npm install react-native-sound

# Android specifične zavisnosti
npm install react-native-mm-record-audio
```

#### D) Kopaj screen komponente

```bash
# Kreiraj folder
mkdir -p app/screens

# Kopiraj screen fajlove u app/screens/
# Preimenuj sa .js na .jsx ili koristi .js
```

#### E) Postavi App.js (entry point)

```javascript
// App.js
import React from 'react';
import Navigation, { COLORS } from './app-navigation';

export default function App() {
  return <Navigation />;
}
```

#### F) Postavi API URL u .env ili kao constant

U svakomu screen fajlu, izmeni `API_URL`:

```javascript
// Ako je na istoj mašini (dev):
const API_URL = 'http://10.0.2.2:3000/api'; // Android emulator
// ili
const API_URL = 'http://localhost:3000/api'; // iOS simulator

// Ako je remote server:
const API_URL = 'https://api.amigella.com/api';
```

#### G) Pokreni aplikaciju

```bash
# iOS
npm run ios
# ili
react-native run-ios

# Android
npm run android
# ili
react-native run-android

# Expo Web (test u browser-u)
npx expo start --web
```

---

## 🔊 VOICE INTEGRATION (Gemini API)

### Google Gemini API Setup

1. Idi na https://aistudio.google.com
2. Kliki "Get API Key"
3. Kreiraj novi API key
4. Kopiraj u `.env`:

```env
GEMINI_API_KEY=paste_here_your_key
```

### Voice Flow (Šta se dešava)

```
📱 USER SAYS:
"Sutra u 14:00 imam sastanak sa Markom za Projekat X"
    ↓
🎙️ AUDIO IS RECORDED (React Native)
    ↓
📤 UPLOADED TO BACKEND
    ↓
🤖 GEMINI API TRANSCRIBES:
"Sutra u 14:00 imam sastanak sa Markom za Projekat X"
    ↓
🧠 GEMINI EXTRACTS DATA:
{
  "title": "Sastanak sa Markom",
  "category": "rad",
  "start_time": "2024-12-20T14:00:00",
  "duration_minutes": 60,
  "priority": "high",
  "confidence": 0.95
}
    ↓
✨ "BISERI" KEYWORDS EXTRACTED:
["Sastanak sa Markom", "#rad", "!high"]
    ↓
⚠️ CHECK FOR CONFLICTS & SUPER BISER
    ↓
📅 CREATE APPOINTMENT IN DB
    ↓
📊 LOG IN AI_ANALYTICS
    ↓
✅ SHOW CONFIRMATION IN UI
```

---

## 🛡️ SENTINEL SHIELD (Burnout Prevention)

### Kako funkcionira

1. **User dodaje 10. termin** → Sistem detektuje
2. **API endpoint `/api/sentinel/check`** vraća `isSuperBiser: true`
3. **Mobile app prikazuje Sentinel Shield modal**
4. **User ima 3 opcije:**
   - ❌ "Izvini, nije hitna" → Odbij
   - ✅ "Ovo je hitno!" → Dodaj sa warning
   - 🔄 "Pomakni na drugi dan" → Reschedule

### Database Table za praćenje

```sql
-- SUPER BISER TRACKER
CREATE TABLE super_biser_tracker (
  tracker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  track_date DATE NOT NULL,
  appointment_count INT DEFAULT 0,
  super_biser_active BOOLEAN DEFAULT false,
  ai_recommendation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, track_date)
);

-- Procedure za check
CREATE OR REPLACE FUNCTION check_super_biser(
  p_user_id UUID,
  p_date DATE
) RETURNS TABLE (
  appointment_count INT,
  super_biser_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS appointment_count,
    COUNT(*) >= 10 AS super_biser_active
  FROM appointments
  WHERE user_id = p_user_id
    AND DATE(start_time) = p_date
    AND status IN ('scheduled', 'confirmed');
END;
$$ LANGUAGE plpgsql;
```

---

## 📡 API ENDPOINTS

### Authentication

```
POST /api/auth/register
{
  "email": "korisnik@example.com",
  "full_name": "Ime Prezime",
  "timezone": "Europe/Belgrade"
}

POST /api/auth/login
{
  "email": "korisnik@example.com",
  "password": "sifra"
}

RESPONSE: { token, user }
```

### Appointments

```
GET /api/appointments/:userId
GET /api/appointments/:userId/today
GET /api/free-slots/:userId?startDate=2024-12-20&minDuration=60

POST /api/appointments
{
  "userId": "uuid",
  "categoryId": "uuid",
  "title": "Termin",
  "startTime": "2024-12-20T14:00:00",
  "endTime": "2024-12-20T15:00:00",
  "priority": "high"
}

PUT /api/appointments/:appointmentId
{ "title", "startTime", "status" }

DELETE /api/appointments/:appointmentId
```

### Voice Processing

```
POST /api/voice/transcribe (multipart/form-data)
{
  "audio": <file>,
  "userId": "uuid"
}

RESPONSE: {
  "success": true,
  "voice_log": {...},
  "appointment": {...},
  "extracted": {...},
  "transcript": "..."
}
```

### Sentinel Shield

```
POST /api/sentinel/check
{
  "userId": "uuid",
  "date": "2024-12-20"
}

RESPONSE: {
  "appointmentCount": 10,
  "isSuperBiser": true,
  "remainingSlots": 0
}

POST /api/sentinel/force-add
{
  "userId": "uuid",
  "appointmentData": {...}
}
```

---

## 🎨 DESIGN SYSTEM

### Boje

```javascript
const COLORS = {
  primary: '#81C784',      // Sage Green - mirna, produktivna
  secondary: '#FFB74D',    // Warm Orange - energična, glasna
  accent: '#FFD166',       // Gold - pozitivna, istaknutа
  danger: '#EF5350',       // Red - upozorenja
  background: '#FAFAF9',   // Off-white - lagana pozadina
  surface: '#FFFFFF',      // White - komponente
  text: '#263238',         // Dark blue-gray - tekst
  textLight: '#78909C',    // Light gray-blue - sekundarni tekst
};
```

### Animacije

```javascript
// Pulsing circle (Voice screen)
pulse: {
  from: 1,
  to: 1.3,
  duration: 2000,
  easing: 'ease-in-out',
  loop: true
}

// Shield animation (Sentinel screen)
slide-up: {
  from: { transform: 'translateY(100px)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 },
  duration: 500,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // bounce effect
}

// Float animation (Appointment cards)
float: {
  keyframes: [
    { transform: 'translateY(0px)' },
    { transform: 'translateY(-2px)' },
    { transform: 'translateY(0px)' }
  ],
  duration: 3000,
  loop: true
}
```

---

## 📱 SCREEN COMPONENTS

### 1. JutarnjiMir (Dashboard)
- Pozdrav sa trenutnim vremenom
- Super Biser status (koliko termina)
- Brze akcije (Voice, Dodaj, Postavke)
- Sve termine za dan
- Pull-to-refresh

### 2. VoiceInputScreen
- Pulsing circle animation (recording indicator)
- Start/Stop recording buttons
- Transkript prikaz
- Biseri (keywords) kao tag-ovi
- Ekstraktovani podaci (naslov, vreme, prioritet)

### 3. SentinelShieldModal
- Shield icon sa animacijom
- Appointment count prikaz
- 3 akcije: Decline / Force / Reschedule
- AI recommendation

### 4. CalendarListScreen
- Prikaz svih termina
- Filter po datumu/kategoriji
- Mogućnost editovanja
- Mogućnost brisanja

### 5. LoginScreen
- Email/Password unos
- Registracija link

### 6. RegisterScreen
- Email, Ime, Prezime, Timezone

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Production

- [ ] Backend server pokrenut i testiran
- [ ] PostgreSQL baza kreirана sa svim tablema
- [ ] Google Gemini API key konfiguriran
- [ ] Svi environment variables postavljeni
- [ ] SSL certifikati (ako je HTTPS)
- [ ] CORS konfiguracija proverena

### Mobile App

- [ ] React Native projekat kreiran
- [ ] Svi screens implementirani
- [ ] Audio recording funkcionalan
- [ ] Gemini integration testirana
- [ ] Navigation radna
- [ ] Sentinel Shield logika testirana

### Testing

- [ ] Unit tests (Jest)
- [ ] Integration tests (API)
- [ ] End-to-end tests (mobile)
- [ ] Voice processing test sa razlichitim jezicima
- [ ] Burnout modal test
- [ ] Offline mode test

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**Problem:** `Error: connect ECONNREFUSED`
- PostgreSQL nije pokrenut
- Proverite: `psql -U postgres -h localhost`

**Problem:** Gemini API returns null
- API key nije validan
- Quote limit dostignut
- Network connectivity issue

### Mobile Issues

**Problem:** Can't connect to backend
- Android emulator: koristi `10.0.2.2:3000` umesto `localhost:3000`
- iOS simulator: koristi `localhost:3000` sa real device koristi LAN IP

**Problem:** Audio recording ne radi
- Permisije: dodaj u Info.plist (iOS) / AndroidManifest.xml (Android)
- IOS: NSMicrophoneUsageDescription

**Problem:** React Navigation errors
- Verzije linkane: `@react-navigation/native@6.x`, `screens@3.x`
- Obavezno: `npm install react-native-screens react-native-safe-area-context`

---

## 📚 DODATNÉ RESURSE

- Express.js dokumentacija: https://expressjs.com
- React Native: https://reactnative.dev
- React Navigation: https://reactnavigation.org
- Google Gemini API: https://ai.google.dev
- PostgreSQL: https://www.postgresql.org/docs

---

## 🎯 SLEDEČI KORACI

1. ✅ Backend API kreirаn
2. ✅ React Native struktura kreirаna
3. ✅ Sentinel Shield komponenta kreirаna
4. ✅ Gemini integracija mapirana

### Ostatak za implementaciju:

```
- [ ] Kreiraj dodatne screens (Calendar, Settings, Login)
- [ ] Implementiraj user authentication (JWT)
- [ ] Testiranje voice processing
- [ ] Push notifications za reminder
- [ ] Offline sync sa realtime database
- [ ] Dark mode podrska
- [ ] Lokalizacija (Srpski/Engleski)
- [ ] Analytics tracking
- [ ] Performance optimization
- [ ] App store submission
```

---

**Amigella je sada spreman za mobilnu implementaciju! 🚀**
