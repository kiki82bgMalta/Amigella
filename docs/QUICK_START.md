# ⚡ AMIGELLA - QUICK START (5 minuta)

Sve što trebas da pokrenеš kompletan sistem za 5 minuta.

---

## 🔴 KORAK 1: PostgreSQL Baza (2 min)

```bash
# Ako PostgreSQL nije instaliran, instaliraj
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql
# Windows: https://www.postgresql.org/download/windows/

# Pokreni PostgreSQL
psql -U postgres -h localhost

# U psql prompt:
CREATE DATABASE amigella;
\c amigella

# Učitaj schema
\i /path/to/schema.sql

# Exit (\q)
```

---

## 🟡 KORAK 2: Backend Server (2 min)

```bash
cd /workspaces/Amigella

# Instaliraj dependencije (samo prvi put)
npm install

# Kreiraj .env fajl
cat > .env << EOF
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amigella
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_key_here
EOF

# Pokreni server
npm run dev
```

**Trebalo bi da vidis:**
```
✨ AMIGELLA BACKEND API
🚀 Server running on port 3000
📍 http://localhost:3000
```

---

## 🟢 KORAK 3: React Native App (1 min Setup)

```bash
# U NOVOM TERMINAL-U

# Kreiraj RN projekt (ili koristi postojeći)
npx react-native init AmigenellaApp

cd AmigenellaApp

# Instaliraj zavisnosti
npm install @react-navigation/native \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-vector-icons \
  react-native-audio-recorder-player \
  axios

# Kopiraj screen fajlove
mkdir -p app/screens
cp /workspaces/Amigella/screens-*.js app/screens/

# Kreiraj App.js
cat > App.js << 'EOF'
import React from 'react';
import Navigation from './app-navigation';

export default function App() {
  return <Navigation />;
}
EOF

# Pokreni aplikaciju
npm run ios
# ili
npm run android
```

---

## 🛠️ TESTIRANJE

### Test 1: API Health Check

```bash
curl http://localhost:3000/api/health
# Response: { "status": "OK" }
```

### Test 2: Kreiraj korisnika

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "timezone": "UTC"
  }'
```

### Test 3: Uzmi termine

```bash
curl http://localhost:3000/api/appointments/user-123
```

---

## 🔊 VOICE SETUP (Google Gemini)

1. Idi na: https://aistudio.google.com
2. Kliki "Get API Key"
3. Kopiraj i stavi u `.env`:

```env
GEMINI_API_KEY=paste_your_key_here
```

---

## 📱 MOBILE APP STRUKTURA (Kopiraj sve)

```javascript
// app-navigation.js → COPY AS IS
// screens-jutarnji-mir.js → app/screens/JutarnjiMirScreen.jsx
// screens-voice-input.js → app/screens/VoiceInputScreen.jsx
// screens-sentinel-shield.js → app/screens/SentinelShieldScreen.jsx
```

---

## 🎯 KORISTI APLIKACIJU

1. **Otvori mobilnu aplikaciju**
2. **Login (mock account):**
   - Email: test@example.com
   - Password: bilo šta

3. **Vidiš "Jutarnji Mir" (Dashboard)** ✅

4. **Klikni "Mikrofon" (Voice)**
   - Počni snimanje
   - Govori: "Sutra u 14:00 imam sastanak"
   - Zaustavi snimanje
   - Klikni "Obradi pomoću AI-ja"
   - ✅ Gemini obradi → creiraj termin

5. **Ako ima 10+ termina** 
   - Vidjiš Sentinel Shield modal 🛡️
   - 3 opcije: Decline / Force / Reschedule

6. **Nazad na Jutarnji Mir**
   - Vidiš nove termine

---

## 🚨 AKO NEŠTO NE RADI

### Backend se ne pokreće
```bash
# Provera porte
lsof -i :3000

# Provera baze
psql -U postgres -h localhost -c "\l"

# Provera .env
cat .env
```

### Mobile se ne konektuje
```javascript
// Izmeni u svakom screen fajlu:
// Android emulator:
const API_URL = 'http://10.0.2.2:3000/api';

// iOS simulator:
const API_URL = 'http://localhost:3000/api';

// Test:
fetch('http://10.0.2.2:3000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d))
  .catch(e => console.log('❌ Error:', e));
```

### Voice ne radi
```javascript
// Provera permisija u app/screens/VoiceInputScreen.jsx
// iOS: dodaj u Info.plist
<key>NSMicrophoneUsageDescription</key>
<string>Trebam mikrofon za snimanje termina</string>

// Android: dodaj u AndroidManifest.xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## 📊 ŠEMA BAZE

```
users                      (korisnici)
├── appointments           (termini - GLAVNA TABELA)
├── voice_logs            (snimljene govorne unose)
├── categories            (rad/zdravlje/lično)
├── alerts                (notifikacije)
├── ai_analytics          (ML data)
├── super_biser_tracker   (10+ termina alarm)
└── audit_log             (security trail)
```

---

## 🎨 BOJE (SVE SCREEN-OVIMA 🎨)

```javascript
const COLORS = {
  primary: '#81C784',      // 🟢 Sage Green
  secondary: '#FFB74D',    // 🟠 Orange
  accent: '#FFD166',       // 🟡 Gold
  danger: '#EF5350',       // 🔴 Red
};
```

---

## 📁 FAJLOVI KOJE TREBAS

```
/workspaces/Amigella/
├── backend-api.js              ✅ Backend
├── .env                        ✅ Config
├── schema.sql                  ✅ Database
├── package.json                ✅ Dependencies
└── IMPLEMENTATION_GUIDE.md     ✅ Full guide

React Native Project/
├── App.js                      ✅ Entry point
├── app-navigation.js           ✅ Navigation
└── app/screens/
    ├── JutarnjiMirScreen.jsx
    ├── VoiceInputScreen.jsx
    ├── SentinelShieldScreen.jsx
    └── ...
```

---

## ✅ CHECKLIST (Finish)

- [ ] PostgreSQL pokrenuta
- [ ] Backend server radi (port 3000)
- [ ] React Native app kreirana
- [ ] API health check ✅
- [ ] Gemini API key postavljen
- [ ] Voice recording test ✅
- [ ] Sentinel Shield testiran
- [ ] Termin kreiran iz glasa ✅

---

**Gotovo! Amigella je sada na telefonu! 🚀📱**

Za više detalja, čitaj: `IMPLEMENTATION_GUIDE.md`
