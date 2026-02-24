# 🎯 AMIGELLA DATABASE - BRZI REFERENCE GUIDE
**Printaj ili bookmarkuj ovo!**

---

## 📌 TABELE NA JEDNOJ STRANICI

| Tabela | Ključna Polja | Indeks | Za Šta |
|--------|---------------|--------|--------|
| **users** | user_id, email, timezone | email | Početne info korisnica |
| **appointments** ⭐ | appt_id, user_id, start_time, end_time, status | (user_id, start_time) | SVE - Termini |
| **categories** | cat_id, user_id, name, color | user_id, name | Organizovanje termina |
| **voice_logs** | log_id, user_id, transcript, confidence | user_id, created_at | Govorna unosa |
| **alerts** | alert_id, appt_id, trigger_time, status | user_id, status | Notifikacije |
| **ai_analytics** | analytics_id, user_id, prediction_type | user_id, recorded_at | ML data |
| **super_biser_tracker** | tracker_id, user_id, date, count | user_id, super_biser_active | 10+ termina |
| **appointment_conflicts** | conflict_id, appt_id_1, appt_id_2 | user_id, resolved | Pronalaženje overlaps |
| **user_preferences** | pref_id, user_id, buffer_minutes | user_id | AI settings |
| **categories** | cat_id, name, color, emoji | user_id | Organizovanje |
| **audit_log** | log_id, user_id, action, entity | user_id, created_at | Security trail |

---

## 🚀 5 NAJČEŠĆIH UPITA

### 1. PRONAĐI SLOBODNO VREME (Scenario 1+2)
```sql
CALL find_free_slots(
  'user_uuid', 
  '2026-02-24',    -- start date
  '2026-03-02',    -- end date
  60               -- min duration minutes
);
-- Rezultat: Svi slobodni slotovi >= 60 minuta
```

### 2. PRONAĐI KONFLIKTE (Scenario 4)
```sql
CALL check_appointment_conflicts(
  'user_uuid',
  '2026-02-24 14:00:00',  -- new start
  '2026-02-24 15:30:00',  -- new end
  15                      -- buffer min
);
-- Rezultat: Svi overlaps ili previše blizu
```

### 3. SUPER BISER CHECK (Scenario 4)
```sql
CALL check_super_biser('user_uuid', '2026-02-24');
-- Rezultat: appointment_count >= 10? TRUE/FALSE
```

### 4. AI OPTIMAL REMINDER (Scenario 5)
```sql
CALL ai_optimal_reminder_time('user_uuid', 'appt_uuid');
-- Rezultat: recommended_minutes, recommended_method
```

### 5. KREIRAJ NOVI TERMIN (Scenario 1)
```sql
INSERT INTO appointments (
  user_id, category_id, title, start_time, end_time, 
  priority, is_voice_input, voice_confidence_score, status
) VALUES (
  'user_uuid', 'cat_uuid', 'Meeting', 
  '2026-02-24 14:00:00', '2026-02-24 15:00:00',
  'high', TRUE, 0.95, 'scheduled'
);
-- Rezultat: Novi appointment sa auto-generated ID
```

---

## 🔥 INDEXI ZA MEMORY

```sql
-- OBAVEZNO KREIRAJ:

-- #1 Za pronalaženje slobodnog vremena
CREATE INDEX idx_appointments_user_date_status 
ON appointments(user_id, start_time DESC, status);

-- #2 Za conflict detection
CREATE INDEX idx_appointments_time_range 
ON appointments(start_time, end_time, status);

-- #3 Za voice logs
CREATE INDEX idx_voice_logs_user 
ON voice_logs(user_id, created_at DESC);

-- #4 Za alerts
CREATE INDEX idx_alerts_user_status 
ON alerts(user_id, status, trigger_time);

-- #5 Za AI analytics
CREATE INDEX idx_ai_analytics_user_type 
ON ai_analytics(user_id, prediction_type, recorded_at DESC);
```

**Bez njih - sve je SPORA! 🐌**

---

## 📝 INERTNI PODACI

```sql
-- Test Korisnica
INSERT INTO users (email, full_name, timezone) 
VALUES ('test@amigella.com', 'Test Nina', 'Europe/Sarajevo');
-- Kopiraj: <generated_user_id>

-- Test Kategorije (4 default)
INSERT INTO categories (user_id, name, color, emoji, is_default, priority) VALUES
  ('<user_id>', 'Rad', '#3B82F6', '💼', TRUE, 9),
  ('<user_id>', 'Slobodno vreme', '#10B981', '🎯', TRUE, 7),
  ('<user_id>', 'Zdravlje', '#F59E0B', '💪', TRUE, 10),
  ('<user_id>', 'Lično', '#8B5CF6', '🌙', TRUE, 6);

-- Test Termin
INSERT INTO appointments (user_id, category_id, title, start_time, end_time, status, priority) 
VALUES ('<user_id>', '<cat_id>', 'Meeting', 
  '2026-02-24 14:00:00', '2026-02-24 15:00:00', 'scheduled', 'high');
```

---

## ⚡ PERFORMANCE TARGETS

| Operacija | Target | Tehnika |
|-----------|--------|---------|
| find_free_slots() | < 100ms | INDEX + PROCEDURE |
| check_conflicts() | < 50ms | Window functions |
| create_appointment() | < 5s | Async voice processing |
| voice_to_appointment | < 5s | Async (Gemini API) |
| ai_prediction() | < 500ms | Pre-calculated fields |
| blur_apply() | < 150ms | Direct update |

---

## 🎯 SCENARIO QUICK LINKS

| Scenario | Šta Treba | Query |
|----------|-----------|-------|
| **1: Brz unos** | voice_logs, appointments | SQL_EXAMPLES.sql line 8 |
| **2: Mesečni plan** | free_slots_view, grouping | SQL_EXAMPLES.sql line 32 |
| **3: Privatnost** | is_private, blur_level | SQL_EXAMPLES.sql line 60 |
| **4: Hitne** | is_critical, super_biser | SQL_EXAMPLES.sql line 88 |
| **5: AI** | ai_analytics, predictions | SQL_EXAMPLES.sql line 140 |

---

## 🔐 SECURITY CHECKLIST

- [ ] Encrypt voice logs at rest
- [ ] Hash user passwords (if auth needed)
- [ ] Audit log svih CREATE/UPDATE/DELETE
- [ ] Blur masking za private appts
- [ ] Rate limiting na API endpoints
- [ ] SQL injection prevention (use prepared statements)
- [ ] GDPR: Data export na zahtev
- [ ] GDPR: Right to be forgotten (cascade delete)

---

## 🛠️ COMMON TASKS

### Update Termin
```sql
UPDATE appointments 
SET title = 'New Title', end_time = '2026-02-24 16:00:00'
WHERE appointment_id = 'appt_uuid' AND user_id = 'user_uuid';
```

### Otkaži Termin
```sql
UPDATE appointments 
SET status = 'cancelled'
WHERE appointment_id = 'appt_uuid';

-- Alert notifikacija
UPDATE alerts SET status = 'dismissed'
WHERE appointment_id = 'appt_uuid';
```

### Dodaj Blur
```sql
UPDATE appointments 
SET is_private = TRUE, blur_level = 90
WHERE appointment_id = 'appt_uuid';
```

### Log Voice Input (za AI)
```sql
INSERT INTO voice_logs (user_id, raw_text, transcription_confidence) 
VALUES ('user_uuid', 'Generated by Gemini API', 0.95);
```

### Pronađi Super Biser Dan
```sql
SELECT DATE(start_time), COUNT(*) as num
FROM appointments
WHERE user_id = 'user_uuid' AND status = 'scheduled'
GROUP BY DATE(start_time)
HAVING COUNT(*) >= 10;
```

---

## 🐛 DEBUGGING

### Query je spora?
```sql
EXPLAIN SELECT ... 
-- Trebalo bi da pokaže: type: range (koristim index)
-- Ako je type: ALL → DODAJ INDEX!
```

### Index nije korišten?
```sql
SELECT * FROM appointments 
USE INDEX (idx_your_index_name)
WHERE ...;
```

### Koliki su tabele?
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'amigella';
```

---

## 📊 DATA TYPES REFERENCE

```
UUID             - User/Appointment ID (unique)
VARCHAR(255)     - Title, Name
TEXT             - Description, Raw transcript
INT              - Duration, Count
FLOAT            - Confidence (0.0-1.0), Score
BOOLEAN          - Flags (is_private, is_critical)
TIMESTAMP        - Vremenske vrednosti
DATE             - Samo datum
ENUM             - Status ('scheduled', 'completed')
JSON             - Fleksibilni objekti
LONGBLOB         - Audio files
```

---

## 🚀 DEPLOYMENT CHECKLIST

```
PRE-DEPLOYMENT:
- [ ] Backup existing production DB
- [ ] Test na staging identična production

DEPLOYMENT:
- [ ] Execute amigella_database_schema.sql
- [ ] Verify svi indexi su kreirani
- [ ] Verify svih procedures kompajlira
- [ ] Load test: 100 concurrent users
- [ ] Verify performance benchmarks

POST-DEPLOYMENT:
- [ ] Monitor slow queries
- [ ] Test disaster recovery
- [ ] Verify backups rade
- [ ] Update documentation
```

---

## 💬 SQL SNIPPETS

### Pronađi Najčešće Kategorije
```sql
SELECT category_id, COUNT(*) FROM appointments GROUP BY category_id ORDER BY COUNT(*) DESC;
```

### Pronađi Otkazane Termine
```sql
SELECT * FROM appointments WHERE status = 'cancelled' ORDER BY created_at DESC;
```

### Pronađi Kritične Termine
```sql
SELECT * FROM appointments WHERE is_critical = TRUE ORDER BY start_time;
```

### Pronađi Voice Unose sa Greškama
```sql
SELECT * FROM voice_logs WHERE nlp_error_detected = TRUE;
```

### Pronađi Pending Alerts
```sql
SELECT * FROM alerts WHERE status = 'pending' ORDER BY trigger_time;
```

### Pronađi Stress Voice Inputs
```sql
SELECT * FROM ai_analytics WHERE voice_emotion_detected = 'stressed' 
ORDER BY voice_urgency_score DESC;
```

---

## 🎓 GLOSSARY

| Termin | Objašnjenje |
|--------|-----------|
| **Appointment** | Termin u kalendaru |
| **Free Slot** | Slobodno vreme između termina |
| **Conflict** | Dva termina se preklapaju |
| **Super Biser** | 10+ termina u jedan dan |
| **Blur** | Masking private informacije |
| **Voice Confidence** | 0.0-1.0 kako je AI siguran u unos |
| **AI Analytics** | Podaci o user akcijama za ML |
| **Whisper Confirmation** | Brza potvrda pre nego što se sačuva |
| **Diamond Alert** | 3x treperi kritični alarm |
| **Sticky Lock** | Sprečava skupljanje (double tap) |

---

## 🔗 RELATED FILES

```
amigella_database_schema.sql    ← MAIN: Kompletan SQL
DATABASE_ARCHITECTURE.md        ← Detaljni opis
SQL_EXAMPLES.sql               ← 40+ praktični primeri
README_DATABASE.md             ← Implementacija
OPTIMIZATION_GUIDE.md          ← Performanse
DATABASE_SUMMARY.md            ← Kompletna dokumentacija
QUICK_REFERENCE.md             ← Ovaj fajl (printaj!)
```

---

## 📞 KADA NE ZNAŠ...

**Slobodno vreme pronalazi spora?** → OPTIMIZATION_GUIDE.md  
**Kako da koristim procedure?** → SQL_EXAMPLES.sql  
**Šta se nalazi gde?** → DATABASE_ARCHITECTURE.md  
**Kako da startam?** → README_DATABASE.md  
**Koja je ova kolona za?** → DATABASE_SUMMARY.md  
**Koja je SQL komanda?** → Ovaj fajl + Google  

---

## 🎯 PROIZVODNOST TIPS

1. **Koristi procedures** umesto multi-query iz aplikacije
2. **Selektuj samo potrebne kolone** (ne SELECT *)
3. **Batch inserts** za performance
4. **ANALYZE TABLE** posle bulk operations
5. **Monitor slow_query_log** u production
6. **Cache results** u Redis (za read-heavy queries)
7. **Archive stare podatke** (appointments starije od 1 godine)
8. **Test sa production-like data** (ne samo 10 redaka!)

---

## 💡 AMIGELLA FILOSOFIJA

```
Ne "upravlja" satima... 
      ↓
Živi u potpunom miru sa njima
      ↓
Digitalni hram vremena
      ↓
Pearl + Sentinel = Savršseni odbor
```

Baza podataka je **temelj** te vizije! ⭐

---

**Verzija:** 1.0  
**Last Updated:** Februar 2026  
**Status:** Ready za Production  

**Print this guide & keep it handy! 📖**
