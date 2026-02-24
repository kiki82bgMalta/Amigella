# AMIGELLA - DATABASE ARCHITEKTURA
## Sektor 1: Kalendar — Optimizovana za Brzinu i AI

---

## 📊 Pregled Architecture-a

```
┌─────────────────┐
│     USERS       │ ← Osnovna tabela
└────────┬────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
┌───▼──────────┐  ┌──────────────┐   │
│ CATEGORIES   │  │ PREFERENCES  │   │
└──────────────┘  └──────────────┘   │
                                     │
                  ┌──────────────────▼──────────────────┐
                  │      APPOINTMENTS (Srce)           │
                  │  - Osnovna baza termina            │
                  │  - Optimizovana za pretragu        │
                  │  - AI polja za analitiku           │
                  └──┬──────────────────────┬───────────┘
                     │                      │
        ┌────────────┴─┐     ┌──────────────┴─────────────┐
        │              │     │                            │
    ┌───▼────────┐  ┌─▼──────▼─────┐  ┌─────────────────▼──┐
    │ VOICE_LOGS │  │ ALERTS       │  │ AI_ANALYTICS      │
    │            │  │              │  │                   │
    │ - Scenario1│  │ - Notifikacije
    │ - NLP      │  │ - Critical   │  │ - Predictions   │
    │            │  │              │  │ - Patterns      │
    └────────────┘  └──────────────┘  └─────────────────┘

    ├─ APPOINTMENT_CONFLICTS (Pronalaženje overlaps)
    ├─ SUPER_BISER_TRACKER (10+ obaveza)
    └─ AUDIT_LOG (Sigurnost & Compliance)
```

---

## 🔑 Ključne Tabele Detaljno

### 1️⃣ **USERS** - Osnovna tabela korisnica
```sql
Kolona                   | Tip      | Opis
─────────────────────────┼──────────┼──────────────────────
user_id                  | UUID     | Primarna ključ
email                    | VARCHAR  | Unique identifikator
timezone                 | VARCHAR  | Za logging vremena
preferred_input_method   | ENUM     | 'voice' | 'text'
ai_training_enabled      | BOOLEAN  | Za AI learning
last_active              | TIMESTAMP| Za engagement tracking
```

### 2️⃣ **APPOINTMENTS** - Srce sistema⭐
```
Optimizovana za pretragu SLOBODNOG VREMENA:

┌─────────────────────────────────────────────────┐
│ OSNOVNA POLJA                                   │
│ ├─ appointment_id (UUID)                        │
│ ├─ user_id (UUID) + INDEX za pretragu          │
│ ├─ title, description                          │
│ ├─ start_time, end_time (CRITICAL INDEXES)    │
│ └─ duration_minutes (calculated)               │
├─────────────────────────────────────────────────┤
│ STATUS & PRIORITETI                             │
│ ├─ status: 'scheduled'|'completed'|'cancelled' │
│ ├─ priority: 'low'|'medium'|'high'|'critical' │
│ └─ is_critical (za Diamond Alert - Scenario 4)│
├─────────────────────────────────────────────────┤
│ SCENARIO 1: GOVORNA UNOSA                       │
│ ├─ is_voice_input (BOOLEAN)                     │
│ ├─ voice_confidence_score (0.0-1.0)            │
│ └─ voice_log_id (FK na VOICE_LOGS)             │
├─────────────────────────────────────────────────┤
│ SCENARIO 3: PRIVATNOST U KAFIĆU                 │
│ ├─ is_private (BOOLEAN)                         │
│ └─ blur_level (0-100)                           │
├─────────────────────────────────────────────────┤
│ SCENARIO 4: HITNE OBAVEZE                       │
│ ├─ double_tap_activated                        │
│ ├─ sticky_lock (sprečava skupljanje)           │
│ ├─ super_biser_eligible (10+ obaveza)         │
│ └─ is_critical                                 │
├─────────────────────────────────────────────────┤
│ AI ANALITIKA (SCENARIO 5)                       │
│ ├─ user_completion_likely (0.0-1.0 prediction) │
│ ├─ optimal_reminder_time (AI calculated)       │
│ ├─ energy_level_required                       │
│ └─ voice_confidence_score                      │
└─────────────────────────────────────────────────┘

CRITICAL INDEXES ZA BRZU PRETRAGU:
✓ idx_user_date (user_id, start_time)
✓ idx_user_status (user_id, status)
✓ idx_date_range (start_time, end_time)
✓ idx_appointments_user_start_status
✓ idx_appointments_date_filter
```

### 3️⃣ **VOICE_LOGS** - Govorna unosa (Scenario 1)
```
Za brzu unos u hodu (≤5 sekundi):

┌─ Raw Audio ──────────────────────┐
│  └─ NLP Processing (Gemini API)   │
│     ├─ transcription_confidence   │
│     └─ extracted_title,           │
│        extracted_start_time, etc. │
│  └─ Error Handling                │
│     ├─ nlp_error_detected         │
│     └─ fallback_to_manual ✓       │
└─────────────────────────────────┘
```

### 4️⃣ **AI_ANALYTICS** - Osnova za AI Scenario 5
```
Svaka akcija korisnika je podatak za učenje:

┌────────────────────────────────────────┐
│ PREDICTION TRACKING                    │
│ ├─ completion_prediction (0.0-1.0)    │
│ ├─ scheduling_prediction              │
│ └─ prediction_accuracy (validacija)   │
├────────────────────────────────────────┤
│ BEHAVIORAL ANALYSIS                    │
│ ├─ user_action_type                   │
│ ├─ action_duration_seconds            │
│ ├─ time_slot_preference              │
│ └─ user_hesitation_detected          │
├────────────────────────────────────────┤
│ VOICE AI INSIGHTS                      │
│ ├─ voice_emotion_detected             │
│ ├─ voice_urgency_score (0.0-1.0)     │
│ └─ nlp_intent_confidence              │
├────────────────────────────────────────┤
│ PATTERN RECOGNITION                    │
│ ├─ pattern_identified                 │
│ └─ pattern_frequency                  │
└────────────────────────────────────────┘
```

### 5️⃣ **ALERTS** - Notifikacije sa Critical Support
```
┌─ REMINDER (redovni) ──────────────┐
│  └─ trigger_minutes_before        │
├─ CRITICAL ALERT (Scenario 4) ────┤
│  ├─ diamond_alert_triggered       │
│  ├─ alert_flash_count: 3x treperi │
│  └─ is_critical: TRUE             │
├─ WHISPER CONFIRMATION ────────────┤
│  └─ Za voice input - pre save-a   │
└───────────────────────────────────┘
```

---

## ⚡ Optimizacije za Brzu Pretragu SLOBODNIH TERMINA

### Problem: 
Trebam da pronađem slobodno vreme između 14:00-18:00 u dva dana

### Solution: 3-Step Process

#### **KORAK 1: Pronađi sve zakazane termine**
```sql
-- Koristi indexes:
SELECT * FROM appointments 
WHERE user_id = '...'
  AND start_time BETWEEN '2026-02-24 14:00' AND '2026-02-25 18:00'
  AND status = 'scheduled'
  -- INDEX: idx_appointments_user_start_status ✓
  -- INDEX: idx_appointments_date_filter ✓
ORDER BY start_time;
```

**Vremenska kompleksnost:** O(log n) — vrlo brzo

#### **KORAK 2: Koristi View za brz pregled**
```sql
-- FREE_SLOTS_VIEW - prekalkuliran
SELECT * FROM free_slots_view 
WHERE user_id = '...'
  AND slot_date BETWEEN '2026-02-24' AND '2026-02-25';
```

#### **KORAK 3: Koristi STORED PROCEDURE**
```sql
CALL find_free_slots(
  @user_id, 
  '2026-02-24', 
  '2026-02-25', 
  120  -- min 120 minuta
);
-- Rezultat: svi slobodni slotovi ≥120 minuta
```

---

## 🤖 AI Analitika - Scenario 5

### Šta se prati:

1. **COMPLETION PREDICTION**
   - Je li korisnica verovatno da će završiti termin?
   - Faktori: prioritet, kategorija, vreme dana, istorija

2. **OPTIMAL SCHEDULING**
   - Koje vreme dana je najbolje za koje tipove zadataka?
   - Machine learning na commitment patterns

3. **VOICE EMOTION ANALYSIS**
   - Govorna analiza: stres, uzbuđenje, mirnoća
   - Za prilagođavanje reminder-a

4. **PATTERN RECOGNITION**
   - Koje kombinacije termina često vode do otkazivanja?
   - Pro-aktivne sugestije

5. **ENERGY OPTIMIZATION**
   - Koja energija je potrebna za svaki termin?
   - Za smart scheduling

### Data Flow za AI:
```
Korisnica unosi termin 
        ↓
voice_logs + appointments ← Audio + Metadata
        ↓
ai_analytics ← Ekstraktovani podaci + kontekst
        ↓
ML Model (Gemini) ← Pattern learning
        ↓
Predictions → optimal_reminder_time, user_completion_likely
        ↓
Smart Suggestions za korisnico
```

---

## 📈 Performanse - Target Vrednosti

| Operacija | Target | Implementacija |
|-----------|--------|---|
| Pronalaženje slobodnog vremena | < 100ms | INDEX + STORED PROCEDURE |
| Provera konflikata | < 50ms | Dedicated stored procedure |
| Voice input → Save | < 5s | Async processing |
| AI recommendation | < 500ms | Pre-calculated fields |
| Alert trigger | < 200ms | Real-time observer |

---

## 🔐 Sigurnost & Privacy

- **Encryption:** Sve osjetljive kolone (blur_level, voice_logs) trebaju encryption at rest
- **HIPAA/GDPR:** audit_log prati sve izmene
- **Voice Data:** Se čuva samo sa korisnikinom dozvolom (ai_training_enabled)
- **Blur Privacy:** blur_enabled & blur_level za screening-a

---

## 📋 Migration Path

```
Phase 1: Create base tables (users, appointments, categories)
Phase 2: Add analytics tables (ai_analytics, voice_logs)
Phase 3: Add optimization tables (conflicts, super_biser_tracker)
Phase 4: Populate test data i verify indexes
Phase 5: Deploy procedures i views
```

---

## 🚀 Sledeći Koraci

1. **Izvršiti SQL schema** na vašem DB serveru
2. **Popuniti test podatke** (test_users + test_appointments)
3. **Provjeriti performance** sa N=1000 appointments
4. **Setup monitoring** za slow queries
5. **Integracija sa aplikacijom** (API layer)

---

**Kreirano:** Februar 2026
**Verzija:** 1.0
**Status:** Ready za Development Tim
