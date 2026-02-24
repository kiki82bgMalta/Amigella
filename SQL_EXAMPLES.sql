-- =====================================================
-- AMIGELLA - PRAKTIČNI SQL PRIMERI
-- Sektor 1: Kalendar - Query Examples
-- =====================================================

-- =====================================================
-- SCENARIO 1: BRZA PRETRAGA SLOBODNOG VREMENA
-- =====================================================

-- Primer 1A: Pronađi sve slobodno vreme u narednih 7 dana
-- Korisna za: Schnelle Planning
CALL find_free_slots(
    'user_uuid_here',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    60  -- Minimum 60 minuta
);

-- Primer 1B: Pronađi slobodno vreme samo tokom radnog vremena (9-17h)
SELECT 
    DATE(free_slots.free_start) AS dan,
    TIME(free_slots.free_start) AS slobodno_od,
    TIME(free_slots.free_end) AS slobodno_do,
    (EXTRACT(EPOCH FROM (free_slots.free_end - free_slots.free_start)) / 60) AS minuta
FROM free_slots_view 
WHERE user_id = 'user_uuid_here'
    AND HOUR(free_slots.free_start) >= 9
    AND HOUR(free_slots.free_start) < 17
ORDER BY free_slots.free_start;

-- Primer 1C: Find next available slot >= 2 hours
SELECT 
    MIN(free_slots_view.earliest_available) AS prvi_dostupan_slot
FROM free_slots_view 
WHERE user_id = 'user_uuid_here'
    AND (EXTRACT(EPOCH FROM (latest_available - earliest_available)) / 3600) >= 2;

-- =====================================================
-- SCENARIO 2: MESEČNO PLANIRANJE ODMORA
-- =====================================================

-- Pronađi dane sa malo termina (idealno za odmor/slobodno vreme)
SELECT 
    DATE(start_time) AS dan,
    COUNT(*) AS broj_termina,
    SUM(duration_minutes) / 60.0 AS sati_zakazani,
    CASE 
        WHEN COUNT(*) <= 2 THEN 'Slobodan dan - idealno za odmor'
        WHEN COUNT(*) <= 5 THEN 'Umeren dan'
        WHEN COUNT(*) >= 10 THEN '⚠️ SUPER BISER - kritično'
        ELSE 'Obavezan dan'
    END AS dnevni_status
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND DATE(start_time) BETWEEN '2026-02-01' AND '2026-02-28'
    AND status = 'scheduled'
GROUP BY DATE(start_time)
ORDER BY dan;

-- Pronađi sledeći dostupan vikend (sa manje od 3 termina)
SELECT 
    DATE(start_time) AS vikend_dan,
    COUNT(*) AS broj_termina,
    DAYNAME(start_time) AS dan_nedelje
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND DAYOFWEEK(start_time) IN (1, 7)  -- Nedelja(1), Subota(7)
    AND start_time > NOW()
    AND status = 'scheduled'
GROUP BY DATE(start_time)
HAVING COUNT(*) < 3
LIMIT 1;

-- =====================================================
-- SCENARIO 3: PRIVATNOST U KAFIĆU - BLUR CHECK
-- =====================================================

-- Pronađi sve "privatne" termine koji trebaju blur
SELECT 
    appointment_id,
    title,
    start_time,
    blur_level,
    CASE 
        WHEN blur_level >= 80 THEN '🔒 Maksimalna privatnost'
        WHEN blur_level >= 50 THEN '🔐 Srednja privatnost'
        ELSE '👁️ Minimalna privatnost'
    END AS privacnost_nivo
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND is_private = TRUE
    AND start_time > NOW()
ORDER BY blur_level DESC;

-- Pronađi termine koji nedostaju blur (sigurnosni alarm)
SELECT 
    appointment_id,
    title,
    start_time,
    category_id
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND is_private = TRUE
    AND blur_level = 0
    AND start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR);
-- ^^ REZULTAT: Potrebno je primeniti blur pre nego što krene termin!

-- Update blur na svim privatnim terminima
UPDATE appointments
SET blur_level = 90
WHERE user_id = 'user_uuid_here'
    AND is_private = TRUE
    AND start_time > NOW();

-- =====================================================
-- SCENARIO 4: HITNE OBAVEZE - CRITICAL ALERTS
-- =====================================================

-- Pronađi sve "kritične" termine koji trebaju Diamond Alert
SELECT 
    a.appointment_id,
    a.title,
    a.start_time,
    a.priority,
    CASE 
        WHEN COUNT(a.appointment_id) >= 10 THEN '💎 SUPER BISER - Diamond Alert!'
        WHEN a.is_critical THEN '⚠️ KRITIČNO'
        ELSE '📌 Normalno'
    END AS alert_type,
    al.diamond_alert_triggered
FROM appointments a
LEFT JOIN alerts al ON a.appointment_id = al.appointment_id
WHERE a.user_id = 'user_uuid_here'
    AND (a.is_critical = TRUE OR a.priority = 'critical')
    AND a.start_time > NOW()
GROUP BY a.appointment_id
ORDER BY a.start_time;

-- Aktiviraj Super Biser ako ima 10+ termina u dan
INSERT INTO super_biser_tracker (user_id, date_count, appointment_count, super_biser_active)
SELECT 
    'user_uuid_here' AS user_id,
    DATE(start_time) AS date_count,
    COUNT(*) AS appointment_count,
    IF(COUNT(*) >= 10, TRUE, FALSE) AS super_biser_active
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND DATE(start_time) = CURDATE()
    AND status = 'scheduled'
GROUP BY DATE(start_time)
HAVING COUNT(*) >= 10
ON DUPLICATE KEY UPDATE 
    appointment_count = VALUES(appointment_count),
    super_biser_active = VALUES(super_biser_active),
    updated_at = CURRENT_TIMESTAMP;

-- Pronađi sve konflikte u terminima (overlaps)
CALL check_appointment_conflicts(
    'user_uuid_here',
    '2026-02-24 14:00:00',
    '2026-02-24 15:30:00',
    15  -- 15-minute buffer required
);

-- =====================================================
-- SCENARIO 5: AI ANALITIKA - MACHINE LEARNING DATA
-- =====================================================

-- Pronađi termine sa najvećom completion likely (AI prediction)
SELECT 
    appointment_id,
    title,
    user_completion_likely,
    energy_level_required,
    optimal_reminder_time,
    CASE 
        WHEN user_completion_likely > 0.9 THEN '🎯 Sigurno će biti završeno'
        WHEN user_completion_likely > 0.7 THEN '✓ Verovatno će biti završeno'
        WHEN user_completion_likely > 0.4 THEN '⚠️ Može biti otkazano'
        ELSE '❌ Mala verovatnoća'
    END AS ai_prediciton
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND start_time > NOW()
    AND start_time < DATE_ADD(NOW(), INTERVAL 30 DAY)
ORDER BY user_completion_likely DESC;

-- Analiza voice unosa - AI confidence
SELECT 
    v.voice_log_id,
    v.created_at,
    v.transcription_confidence,
    v.extracted_title,
    v.nlp_error_detected,
    v.fallback_to_manual,
    CASE 
        WHEN v.transcription_confidence > 0.95 THEN '✓ Prefektan unos'
        WHEN v.transcription_confidence > 0.8 THEN 'O.K unos'
        WHEN v.nlp_error_detected THEN '⚠️ Greška - fallback na ručni unos'
        ELSE 'Manuelni unos'
    END AS unos_kvalitet
FROM voice_logs v
WHERE v.user_id = 'user_uuid_here'
    AND v.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY v.created_at DESC;

-- Pronađi svim voice unosa sa greškama (za AI training)
SELECT 
    voice_log_id,
    raw_text,
    processed_text,
    error_message,
    user_confirmed
FROM voice_logs
WHERE user_id = 'user_uuid_here'
    AND nlp_error_detected = TRUE
    AND user_confirmed = FALSE
ORDER BY created_at DESC;

-- AI sa pattern recognition - šta često vodi do otkazivanja?
SELECT 
    pattern_identified,
    COUNT(*) AS frequency,
    AVG(prediction_accuracy) AS prosecna_tacnost,
    CASE 
        WHEN COUNT(*) > 5 THEN '🔴 JASAN PATTERN - izbegavati!'
        WHEN COUNT(*) > 2 THEN '🟡 Mogući pattern'
        ELSE 'Slučajnost'
    END AS significance
FROM ai_analytics
WHERE user_id = 'user_uuid_here'
    AND prediction_type = 'completion'
    AND recorded_at > DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY pattern_identified
ORDER BY frequency DESC;

-- Time-of-day analysis - Kada je korisnica najproduktivnija?
SELECT 
    CASE 
        WHEN HOUR(a.start_time) BETWEEN 6 AND 11 THEN '🌅 Jutro'
        WHEN HOUR(a.start_time) BETWEEN 12 AND 16 THEN '☀️ Posle podne'
        WHEN HOUR(a.start_time) BETWEEN 17 AND 21 THEN '🌆 Veče'
        ELSE '🌙 Noć'
    END AS vreme_dana,
    COUNT(a.appointment_id) AS broj_termina,
    SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS završeni,
    ROUND(100.0 * SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) / COUNT(a.appointment_id), 1) AS procent_zavrsenih,
    AVG(CAST(aa.user_completion_likely AS FLOAT)) AS prosecna_ai_predikcija
FROM appointments a
LEFT JOIN ai_analytics aa ON a.appointment_id = aa.appointment_id
WHERE a.user_id = 'user_uuid_here'
    AND a.created_at > DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY vreme_dana
ORDER BY broj_termina DESC;

-- Energy optimization - Koja energija je potrebna?
SELECT 
    energy_level_required,
    COUNT(*) AS broj_termina,
    AVG(user_completion_likely) AS prosecna_completion_rate,
    AVG(CAST(SUBSTRING_INDEX(category_id, ',', 1) AS CHAR)) AS tip_aktivnosti
FROM appointments
WHERE user_id = 'user_uuid_here'
    AND energy_level_required IS NOT NULL
    AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY energy_level_required
ORDER BY COUNT(*) DESC;

-- =====================================================
-- VOICE EMOTION ANALYSIS (Scenario 5 + Scenario 1)
-- =====================================================

-- Pronađi termine gde je korisnica izrazila stres (voice emotion)
SELECT 
    a.appointment_id,
    a.title,
    a.start_time,
    aa.voice_emotion_detected,
    aa.voice_urgency_score,
    CASE 
        WHEN aa.voice_urgency_score > 0.8 THEN '🔴 HITNA - Trebate prioritet'
        WHEN aa.voice_urgency_score > 0.5 THEN '🟡 VAŽNA'
        ELSE '🟢 Normalna'
    END AS hitnost
FROM appointments a
JOIN ai_analytics aa ON a.appointment_id = aa.appointment_id
WHERE a.user_id = 'user_uuid_here'
    AND aa.voice_emotion_detected IN ('stressed', 'excited', 'anxious')
    AND aa.recorded_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY aa.voice_urgency_score DESC;

-- =====================================================
-- NOTIFICATION & REMINDER OPTIMIZATION
-- =====================================================

-- Pronađi alarm koji su korisnica "snoozed" (jer nisu bili dovoljno raraj)
SELECT 
    al.alert_id,
    a.title,
    a.start_time,
    al.snooze_duration_minutes,
    al.interaction_type,
    ROUND(100.0 * COUNT(*) / 
        (SELECT COUNT(*) FROM alerts 
         WHERE user_id = 'user_uuid_here' AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)), 1) AS procenat_snoozanih
FROM alerts al
JOIN appointments a ON al.appointment_id = a.appointment_id
WHERE al.user_id = 'user_uuid_here'
    AND al.interaction_type = 'snoozed'
    AND al.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY a.appointment_id
ORDER BY COUNT(*) DESC;

-- AI optimal reminder time
CALL ai_optimal_reminder_time(
    'user_uuid_here',
    'appointment_uuid_here'
);

-- =====================================================
-- COMPLIANCE & AUDIT
-- =====================================================

-- Pronađi sve izmene koje je korisnica napravila na terminima (audit trail)
SELECT 
    log_id,
    action,
    entity_type,
    created_at,
    old_values,
    new_values
FROM audit_log
WHERE user_id = 'user_uuid_here'
    AND action IN ('create', 'update', 'delete')
    AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC;

-- Pronađi sve fuziju sa privacy data
SELECT 
    entity_id,
    action,
    created_at
FROM audit_log
WHERE user_id = 'user_uuid_here'
    AND entity_type = 'appointment'
    AND (old_values LIKE '%blur%' OR new_values LIKE '%blur%')
ORDER BY created_at DESC;

-- =====================================================
-- PERFORMANCE MONITORING
-- =====================================================

-- Pronađi SPORE query-je (appointments sa najveće kompleksnostima)
SELECT 
    a.appointment_id,
    a.title,
    (SELECT COUNT(*) FROM alerts WHERE appointment_id = a.appointment_id) AS broj_alerta,
    (SELECT COUNT(*) FROM ai_analytics WHERE appointment_id = a.appointment_id) AS broj_ai_analiza,
    (SELECT COUNT(*) FROM appointment_conflicts 
     WHERE appointment_id_1 = a.appointment_id OR appointment_id_2 = a.appointment_id) AS broj_konflikata
FROM appointments a
WHERE a.user_id = 'user_uuid_here'
    AND a.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY (broj_alerta + broj_ai_analiza + broj_konflikata) DESC
LIMIT 10;

-- =====================================================
-- DATA EXPORT ZA AI TRAINING
-- =====================================================

-- Izvezi sve termine za AI model training (sa allen kontekstom)
SELECT 
    a.appointment_id,
    a.user_id,
    a.title,
    a.start_time,
    a.duration_minutes,
    a.priority,
    a.status,
    a.user_completion_likely,
    a.energy_level_required,
    aa.voice_emotion_detected,
    aa.voice_urgency_score,
    aa.pattern_identified,
    al.alert_type,
    al.interaction_type,
    u.cancellation_rate,
    CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END AS was_completed
FROM appointments a
LEFT JOIN ai_analytics aa ON a.appointment_id = aa.appointment_id
LEFT JOIN alerts al ON a.appointment_id = al.appointment_id
LEFT JOIN user_preferences u ON a.user_id = u.user_id
WHERE a.user_id = 'user_uuid_here'
    AND a.created_at > DATE_SUB(NOW(), INTERVAL 180 DAY)
ORDER BY a.start_time DESC;

-- =====================================================
-- END OF PRACTICAL EXAMPLES
-- =====================================================
