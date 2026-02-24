-- ====================================================================
-- AMIGELLA - SEKTOR 1: KALENDAR
-- Production Database Schema v1.0
-- ====================================================================
-- Optimizovana baza sa AI analitikom
-- Sva vremenska polja su TIMESTAMP sa timezone support
-- ====================================================================

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. USERS - Bazne informacije korisnica
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Preferences
    preferred_input_method VARCHAR(20) DEFAULT 'voice',
    language VARCHAR(10) DEFAULT 'sr',
    theme_preference VARCHAR(20) DEFAULT 'light',
    
    -- Privacy & AI
    blur_enabled BOOLEAN DEFAULT TRUE,
    blur_sensitivity INT DEFAULT 70,
    ai_training_enabled BOOLEAN DEFAULT TRUE,
    ai_model_version VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ====================================================================
-- 2. CATEGORIES - Kategorije termina
-- ====================================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    icon VARCHAR(50),
    emoji VARCHAR(10),
    
    is_default BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

-- ====================================================================
-- 3. APPOINTMENTS - GLAVNA TABELA
-- ====================================================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID,
    
    -- Osnovne informacije
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Vreme
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Voice Input (Scenario 1)
    is_voice_input BOOLEAN DEFAULT FALSE,
    voice_confidence_score FLOAT,
    voice_log_id UUID,
    
    -- Privacy (Scenario 3)
    is_private BOOLEAN DEFAULT FALSE,
    blur_level INT DEFAULT 0,
    
    -- Critical Events (Scenario 4)
    is_critical BOOLEAN DEFAULT FALSE,
    double_tap_activated BOOLEAN DEFAULT FALSE,
    sticky_lock BOOLEAN DEFAULT FALSE,
    super_biser_eligible BOOLEAN DEFAULT FALSE,
    
    -- Recurring
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    recurrence_end_date DATE,
    
    -- AI Analytics (Scenario 5)
    user_completion_likely FLOAT,
    optimal_reminder_time TIMESTAMP,
    energy_level_required VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- CRITICAL INDEXES za brzinu
CREATE INDEX idx_appointments_user_date ON appointments(user_id, start_time DESC);
CREATE INDEX idx_appointments_user_status ON appointments(user_id, status);
CREATE INDEX idx_appointments_date_range ON appointments(start_time, end_time);
CREATE INDEX idx_appointments_priority ON appointments(priority);

-- ====================================================================
-- 4. VOICE_LOGS - KLJUČNA TABELA ZA SCENARIO 1
-- ====================================================================
-- OVO JE SRCE AMIGELLE: Govorna unosa sa transkriptom i audio putanjom
-- ====================================================================
CREATE TABLE IF NOT EXISTS voice_logs (
    voice_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- AUDIO FAJL (putanja do audio na storage-u)
    audio_file_url VARCHAR(500) NOT NULL,
    audio_file_size_bytes BIGINT,
    audio_duration_seconds INT,
    audio_format VARCHAR(20) DEFAULT 'mp3',
    
    -- TRANSKRIPT (očistani tekst iz govora)
    transcribed_text TEXT NOT NULL,
    raw_text TEXT,
    
    -- NLP PROCESSING
    transcription_confidence FLOAT,
    nlp_intent_confidence FLOAT,
    
    -- EXTRAHOVANI PODACI (iz govora u strukturu)
    extracted_title VARCHAR(255),
    extracted_start_time TIMESTAMP,
    extracted_end_time TIMESTAMP,
    extracted_duration_minutes INT,
    extracted_category VARCHAR(100),
    extracted_priority VARCHAR(20),
    extracted_urgency_score FLOAT,
    
    -- GREŠKE I FALLBACKS
    nlp_error_detected BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    fallback_to_manual BOOLEAN DEFAULT FALSE,
    
    -- AI LEARNING
    ai_correction_applied BOOLEAN DEFAULT FALSE,
    user_confirmed BOOLEAN DEFAULT FALSE,
    user_edit_made BOOLEAN DEFAULT FALSE,
    
    -- EMOTION & ANALYSIS (Scenario 5)
    voice_emotion_detected VARCHAR(50),
    voice_stress_level FLOAT,
    voice_confidence FLOAT,
    
    -- TIMESTAMPS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_voice_logs_user_id ON voice_logs(user_id, created_at DESC);
CREATE INDEX idx_voice_logs_processed ON voice_logs(created_at DESC);
CREATE INDEX idx_voice_logs_confidence ON voice_logs(transcription_confidence DESC);

-- ====================================================================
-- 5. ALERTS - Notifikacije i reminderi
-- ====================================================================
CREATE TABLE IF NOT EXISTS alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Tip alarma
    alert_type VARCHAR(50) DEFAULT 'reminder',
    alert_trigger_minutes INT DEFAULT 15,
    
    -- Critical alerts (Diamond Alert - Scenario 4)
    is_critical BOOLEAN DEFAULT FALSE,
    diamond_alert_triggered BOOLEAN DEFAULT FALSE,
    alert_flash_count INT DEFAULT 3,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    trigger_time TIMESTAMP,
    sent_time TIMESTAMP,
    dismissed_at TIMESTAMP,
    
    -- User interaction
    interaction_type VARCHAR(50),
    snooze_duration_minutes INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_alerts_user_pending ON alerts(user_id, status);
CREATE INDEX idx_alerts_trigger_time ON alerts(trigger_time);

-- ====================================================================
-- 6. AI_ANALYTICS - Svi podaci za machine learning (Scenario 5)
-- ====================================================================
CREATE TABLE IF NOT EXISTS ai_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    appointment_id UUID,
    
    -- Prediction data
    prediction_type VARCHAR(50),
    prediction_model_version VARCHAR(20),
    predicted_value FLOAT,
    actual_value FLOAT,
    prediction_accuracy FLOAT,
    
    -- Behavioral analysis
    user_action_type VARCHAR(100),
    action_duration_seconds INT,
    user_hesitation_detected BOOLEAN,
    
    -- Time & Energy
    time_slot_preference VARCHAR(20),
    energy_level_at_action VARCHAR(20),
    context_weather VARCHAR(50),
    context_location VARCHAR(100),
    
    -- Voice AI insights
    voice_emotion_detected VARCHAR(50),
    voice_urgency_score FLOAT,
    nlp_intent_confidence FLOAT,
    
    -- Patterns
    pattern_identified VARCHAR(100),
    pattern_frequency INT,
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_analytics_user ON ai_analytics(user_id, prediction_type);
CREATE INDEX idx_ai_analytics_recorded ON ai_analytics(recorded_at DESC);

-- ====================================================================
-- 7. USER_PREFERENCES - AI personalizacija
-- ====================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
    -- Time management
    preferred_day_start_hour INT DEFAULT 8,
    preferred_day_end_hour INT DEFAULT 22,
    focus_block_duration_minutes INT DEFAULT 120,
    buffer_between_appointments_minutes INT DEFAULT 15,
    
    -- Behavioral patterns
    peak_productivity_hours VARCHAR(100),
    avg_appointments_per_day INT,
    cancellation_rate FLOAT DEFAULT 0.0,
    
    -- AI features
    enable_smart_scheduling BOOLEAN DEFAULT TRUE,
    enable_conflict_prevention BOOLEAN DEFAULT TRUE,
    enable_energy_optimization BOOLEAN DEFAULT TRUE,
    
    -- Notifications
    default_reminder_minutes INT DEFAULT 15,
    prefer_push_notifications BOOLEAN DEFAULT TRUE,
    prefer_email_notifications BOOLEAN DEFAULT FALSE,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ====================================================================
-- 8. APPOINTMENT_CONFLICTS - Pronalaženje konflikata
-- ====================================================================
CREATE TABLE IF NOT EXISTS appointment_conflicts (
    conflict_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    appointment_id_1 UUID NOT NULL,
    appointment_id_2 UUID NOT NULL,
    
    conflict_type VARCHAR(50) DEFAULT 'overlap',
    severity VARCHAR(50) DEFAULT 'medium',
    
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolution_method VARCHAR(100),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id_1) REFERENCES appointments(appointment_id),
    FOREIGN KEY (appointment_id_2) REFERENCES appointments(appointment_id)
);

CREATE INDEX idx_conflicts_user ON appointment_conflicts(user_id, resolved);

-- ====================================================================
-- 9. SUPER_BISER_TRACKER - 10+ obaveze alarm (Scenario 4)
-- ====================================================================
CREATE TABLE IF NOT EXISTS super_biser_tracker (
    tracker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    date_count DATE NOT NULL,
    appointment_count INT DEFAULT 0,
    super_biser_active BOOLEAN DEFAULT FALSE,
    
    alert_sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, date_count)
);

CREATE INDEX idx_super_biser_active ON super_biser_tracker(super_biser_active);

-- ====================================================================
-- 10. AUDIT_LOG - Sigurnost & compliance
-- ====================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    
    old_values JSON,
    new_values JSON,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at DESC);

-- ====================================================================
-- 11. FREE_SLOTS_VIEW - Pre-calculated za brzu pretragu
-- ====================================================================
CREATE OR REPLACE VIEW free_slots_view AS
SELECT 
    user_id,
    DATE(start_time) AS slot_date,
    MIN(start_time) AS earliest_available,
    MAX(end_time) AS latest_available,
    COUNT(*) AS appointments_count
FROM appointments
WHERE status = 'scheduled' AND start_time > CURRENT_TIMESTAMP
GROUP BY user_id, DATE(start_time)
ORDER BY slot_date ASC;

-- ====================================================================
-- STORED PROCEDURES
-- ====================================================================

-- PROCEDURE 1: Pronađi slobodno vreme
CREATE OR REPLACE FUNCTION find_free_slots(
    p_user_id UUID,
    p_date_start DATE,
    p_date_end DATE,
    p_min_duration_minutes INT DEFAULT 60
)
RETURNS TABLE (
    free_start TIMESTAMP,
    free_end TIMESTAMP,
    duration_minutes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LAG(a.end_time) OVER (ORDER BY a.start_time) AS free_start,
        a.start_time AS free_end,
        EXTRACT(EPOCH FROM (a.start_time - LAG(a.end_time) OVER (ORDER BY a.start_time))) / 60 AS duration_minutes
    FROM appointments a
    WHERE a.user_id = p_user_id 
        AND DATE(a.start_time) BETWEEN p_date_start AND p_date_end
        AND a.status = 'scheduled'
    HAVING LAG(a.end_time) OVER (ORDER BY a.start_time) IS NOT NULL
        AND EXTRACT(EPOCH FROM (a.start_time - LAG(a.end_time) OVER (ORDER BY a.start_time))) / 60 >= p_min_duration_minutes
    ORDER BY a.start_time;
END;
$$ LANGUAGE plpgsql;

-- PROCEDURE 2: Pronađi konflikte
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
    p_user_id UUID,
    p_start_time TIMESTAMP,
    p_end_time TIMESTAMP,
    p_buffer_minutes INT DEFAULT 15
)
RETURNS TABLE (
    appointment_id UUID,
    title VARCHAR,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    conflict_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.appointment_id,
        a.title,
        a.start_time,
        a.end_time,
        CASE 
            WHEN (p_start_time < a.end_time AND p_end_time > a.start_time) THEN 'overlap'
            WHEN (EXTRACT(EPOCH FROM (a.start_time - p_end_time)) / 60 < p_buffer_minutes 
                  AND EXTRACT(EPOCH FROM (a.start_time - p_end_time)) / 60 >= 0) THEN 'insufficient_buffer'
            ELSE 'back_to_back'
        END AS conflict_type
    FROM appointments a
    WHERE a.user_id = p_user_id
        AND a.status = 'scheduled'
        AND (
            (p_start_time < a.end_time AND p_end_time > a.start_time) OR
            (EXTRACT(EPOCH FROM (a.start_time - p_end_time)) / 60 < p_buffer_minutes 
             AND EXTRACT(EPOCH FROM (a.start_time - p_end_time)) / 60 >= 0)
        )
    ORDER BY a.start_time;
END;
$$ LANGUAGE plpgsql;

-- PROCEDURE 3: Pronađi Super Biser dan
CREATE OR REPLACE FUNCTION check_super_biser(
    p_user_id UUID,
    p_date DATE
)
RETURNS TABLE (
    appointment_count BIGINT,
    super_biser_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT AS appointment_count,
        CASE WHEN COUNT(*) >= 10 THEN TRUE ELSE FALSE END AS super_biser_active
    FROM appointments
    WHERE user_id = p_user_id
        AND DATE(start_time) = p_date
        AND status = 'scheduled';
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- SEED DATA - Test kategorije
-- ====================================================================
-- Prazno - dodaj test podatke ručno ili preko aplikacije

-- ====================================================================
-- END OF SCHEMA
-- ====================================================================
-- 
-- Za korišćenje sa MySQL, zameni:
-- UUID sa CHAR(36) ili third-party UUID extension
-- gen_random_uuid() sa UUID()
-- EXTRACT(EPOCH FROM ...) sa UNIX_TIMESTAMP()
-- 
-- Za korišćenje sa SQLite, zameni:
-- UUID sa TEXT
-- Procedures i Functions sa Triggers ili aplikacijskom logikom
--
-- ====================================================================
