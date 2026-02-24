# AMIGELLA API - KOMPLETNA REFERENCA

Sve API rute sa primjerima zahtjeva i odgovora.

---

## 📡 BASE URL

```
Development: http://localhost:3000/api
Production: https://api.amigella.com/api
```

---

## 🔐 AUTHENTICATION

### POST /auth/register
Kreiraj novi korisnički račun.

**Request:**
```json
{
  "email": "korisnik@example.com",
  "full_name": "Ime Prezime",
  "timezone": "Europe/Belgrade"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "mock-jwt-token-12345",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "korisnik@example.com",
    "full_name": "Ime Prezime"
  }
}
```

---

### POST /auth/login
Prijavi se na postojeći račun.

**Request:**
```json
{
  "email": "korisnik@example.com",
  "password": "sigurna_sifra"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "mock-jwt-token-12345",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "korisnik@example.com",
    "full_name": "Ime Prezime"
  }
}
```

**Error Response (401):**
```json
{
  "error": "User not found"
}
```

---

## 📅 APPOINTMENTS (Termini)

### GET /appointments/:userId
Uzmi sve termine za korisnika sa opcionalnim filterima.

**Request:**
```
GET /appointments/550e8400-e29b-41d4-a716-446655440000?startDate=2024-12-20&endDate=2024-12-31
```

**Query Parameters:**
- `startDate` (optional): ISO 8601 format (2024-12-20)
- `endDate` (optional): ISO 8601 format (2024-12-31)

**Response (200):**
```json
{
  "success": true,
  "appointments": [
    {
      "appointment_id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid",
      "category_name": "Rad",
      "emoji": "💼",
      "title": "Sastanak sa timom",
      "description": "Planiranje novog projekta",
      "start_time": "2024-12-20T14:00:00Z",
      "end_time": "2024-12-20T15:00:00Z",
      "duration_minutes": 60,
      "priority": "high",
      "status": "scheduled",
      "is_voice_input": true,
      "voice_confidence_score": 0.95,
      "is_private": false,
      "blur_level": 0,
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2024-12-15T10:00:00Z"
    }
  ]
}
```

---

### GET /appointments/:userId/today
Uzmi sve termine za DANAŠNJI dan.

**Request:**
```
GET /appointments/550e8400-e29b-41d4-a716-446655440000/today
```

**Response (200):**
```json
{
  "success": true,
  "appointments": [
    {
      "appointment_id": "uuid",
      "title": "Jutarnja sastanak",
      "start_time": "2024-12-20T08:00:00Z",
      "duration_minutes": 30,
      ...
    }
  ]
}
```

---

### POST /appointments
Kreiraj novi termin.

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Lekarski pregled",
  "description": "Godišnji pregled",
  "startTime": "2024-12-21T15:00:00Z",
  "endTime": "2024-12-21T16:00:00Z",
  "priority": "high",
  "isPrivate": false,
  "blurLevel": 0
}
```

**Response (200) - SUCCESS:**
```json
{
  "success": true,
  "appointment": {
    "appointment_id": "new-uuid",
    "title": "Lekarski pregled",
    "start_time": "2024-12-21T15:00:00Z",
    "status": "scheduled"
  }
}
```

**Response (200) - SUPER BISER WARNING:**
```json
{
  "warning": "super_biser",
  "appointmentCount": 10,
  "message": "Već imate 10 termina ovog dana."
}
```

**Response (400) - CONFLICT:**
```json
{
  "error": "Appointment conflicts detected",
  "conflicts": [
    {
      "conflicting_appointment_id": "uuid",
      "conflicting_title": "Drugi termin",
      "overlap_duration_minutes": 30
    }
  ]
}
```

---

### PUT /appointments/:appointmentId
Ažuriraj postojeći termin.

**Request:**
```json
{
  "title": "Nova naziv",
  "startTime": "2024-12-21T16:00:00Z",
  "endTime": "2024-12-21T17:00:00Z",
  "priority": "medium",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "appointment": {
    "appointment_id": "uuid",
    "title": "Nova naziv",
    "start_time": "2024-12-21T16:00:00Z",
    "updated_at": "2024-12-20T10:30:00Z"
  }
}
```

---

### DELETE /appointments/:appointmentId
Obriši termin.

**Request:**
```
DELETE /appointments/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment deleted"
}
```

---

## 🗓️ FREE SLOTS (Slobodno vrijeme)

### GET /free-slots/:userId
Pronađi slobodno vrijeme za korisnika.

**Request:**
```
GET /free-slots/550e8400-e29b-41d4-a716-446655440000?startDate=2024-12-20&endDate=2024-12-31&minDuration=120
```

**Query Parameters:**
- `startDate`: ISO format
- `endDate`: ISO format
- `minDuration` (optional): Minimalna dužina u minutama (default: 60)

**Response (200):**
```json
{
  "success": true,
  "freeSlots": [
    {
      "start_time": "2024-12-20T09:00:00Z",
      "end_time": "2024-12-20T11:00:00Z",
      "duration_minutes": 120
    },
    {
      "start_time": "2024-12-20T14:00:00Z",
      "end_time": "2024-12-20T16:00:00Z",
      "duration_minutes": 120
    }
  ]
}
```

---

## 🎙️ VOICE PROCESSING (Govorna unosa)

### POST /voice/transcribe
Pretvori audio u termin pomocи Google Gemini API.

**Request (multipart/form-data):**
```
POST /voice/transcribe

Form Data:
- audio: <audio_file> (mp3, wav, ogg)
- userId: "550e8400-e29b-41d4-a716-446655440000"
```

**Response (200) - SUCCESS:**
```json
{
  "success": true,
  "voice_log": {
    "voice_log_id": "uuid",
    "user_id": "uuid",
    "audio_file_url": "/uploads/uuid.mp3",
    "audio_duration_seconds": 12,
    "transcribed_text": "Sutra u 14:00 imam sastanak sa Markom za projekat",
    "extracted_title": "Sastanak sa Markom",
    "extracted_start_time": "2024-12-21T14:00:00",
    "extracted_duration_minutes": 60,
    "extracted_category": "rad",
    "extracted_priority": "high",
    "voice_emotion_detected": "calm",
    "voice_confidence": 0.95,
    "created_at": "2024-12-20T10:00:00Z"
  },
  "appointment": {
    "appointment_id": "new-uuid",
    "title": "Sastanak sa Markom",
    "start_time": "2024-12-21T14:00:00Z",
    "status": "scheduled"
  },
  "extracted": {
    "title": "Sastanak sa Markom",
    "category": "rad",
    "priority": "high",
    "duration_minutes": 60,
    "confidence": 0.95
  },
  "transcript": "Sutra u 14:00 imam sastanak sa Markom za projekat"
}
```

**Response (200) - SUPER BISER WARNING:**
```json
{
  "warning": "super_biser",
  "voice_log": { ... },
  "appointmentCount": 10,
  "extractedData": { ... },
  "transcript": "..."
}
```

**Response (400) - NO FILE:**
```json
{
  "error": "No audio file provided"
}
```

---

### GET /voice-logs/:userId
Uzmi sve govorne unose (voice logs) za korisnika.

**Request:**
```
GET /voice-logs/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "success": true,
  "voiceLogs": [
    {
      "voice_log_id": "uuid",
      "transcribed_text": "Sutra u 14:00...",
      "voice_confidence": 0.95,
      "voice_emotion_detected": "calm",
      "created_at": "2024-12-20T10:00:00Z"
    }
  ]
}
```

---

## 🛡️ SENTINEL SHIELD (Zaštita od iscrpljenja)

### POST /sentinel/check
Proverite da li je dan Super Biser (10+ termina).

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-12-20"
}
```

**Response (200) - NORMAL:**
```json
{
  "success": true,
  "appointmentCount": 5,
  "isSuperBiser": false,
  "remainingSlots": 5
}
```

**Response (200) - SUPER BISER:**
```json
{
  "success": true,
  "appointmentCount": 10,
  "isSuperBiser": true,
  "remainingSlots": 0
}
```

---

### POST /sentinel/force-add
Dodaj 11+ termin sa warning logom.

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "appointmentData": {
    "categoryId": "uuid",
    "title": "Hitni termin",
    "description": "Mora se uraditi",
    "startTime": "2024-12-20T18:00:00Z",
    "endTime": "2024-12-20T19:00:00Z",
    "durationMinutes": 60,
    "priority": "critical"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "appointment": {
    "appointment_id": "new-uuid",
    "title": "Hitni termin",
    "status": "scheduled",
    "super_biser_eligible": true
  },
  "warning": "Appointment created with burnout warning"
}
```

---

## 📂 CATEGORIES (Kategorije)

### GET /categories/:userId
Uzmi sve kategorije za korisnika.

**Request:**
```
GET /categories/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "success": true,
  "categories": [
    {
      "category_id": "uuid",
      "user_id": "uuid",
      "name": "Rad",
      "emoji": "💼",
      "color": "#3B82F6",
      "is_default": true,
      "priority": 5
    },
    {
      "category_id": "uuid",
      "name": "Zdravlje",
      "emoji": "💪",
      "color": "#F59E0B",
      "is_default": true,
      "priority": 5
    }
  ]
}
```

---

## ✅ HEALTH CHECK

### GET /health
Proverite da je server pokrenut.

**Request:**
```
GET /health
```

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

---

## 🐛 ERROR HANDLING

### Standard Error Response

```json
{
  "error": "Opis greške",
  "message": "Detalina poruka (samo u development)"
}
```

### HTTP Status Codes

| Status | Opis |
|--------|------|
| 200 | ✅ OK - Zahtev uspešan |
| 201 | ✅ Created - Resurs kreiran |
| 400 | ❌ Bad Request - Nevaljani podaci |
| 401 | ❌ Unauthorized - Nema autentifikacije |
| 404 | ❌ Not Found - Resurs nije pronađen |
| 500 | ❌ Internal Server Error - Greška servera |

---

## 📝 ПРИМprimi ZAHTEVA (cURL)

### Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "full_name": "Novo Korisnik",
    "timezone": "UTC"
  }'
```

### Create Appointment

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Test termin",
    "startTime": "2024-12-21T14:00:00Z",
    "endTime": "2024-12-21T15:00:00Z",
    "priority": "medium"
  }'
```

### Upload Voice Recording

```bash
curl -X POST http://localhost:3000/api/voice/transcribe \
  -F "audio=@recording.mp3" \
  -F "userId=550e8400-e29b-41d4-a716-446655440000"
```

### Check Sentinel Shield

```bash
curl -X POST http://localhost:3000/api/sentinel/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-12-20"
  }'
```

---

## 🔌 HEADERS

Obavezni headeri za sve zahteve:

```
Content-Type: application/json
```

Za autentifikaciju (u budućnosti):

```
Authorization: Bearer <JWT_TOKEN>
```

---

## ⏱️ TIMEOUT & LIMITS

- **Request timeout**: 30 sekundi
- **Body limit**: 50MB
- **File upload limit**: 25MB
- **Rate limit**: TBD (u produkciji)

---

**Ova dokumentacija je kompletan API reference za Amigella backend.**
