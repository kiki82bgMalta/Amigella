-- =====================================================
-- AMIGELLA - SEKTOR 1: KALENDAR
-- Optimizovana Baza Podataka sa AI Analitikom
-- =====================================================
-- Verzija: 1.0
-- Datum: Februar 2026
-- =====================================================

-- =====================================================
-- 1. USERS TABLE - Osnovna tabela korisnica
-- =====================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Preferences za AI
    preferred_input_method VARCHAR(20) DEFAULT 'voice', -- 'voice', 'text'
    language VARCHAR(10) DEFAULT 'sr',
    theme_preference VARCHAR(20) DEFAULT 'light', -- 'light', 'dark'
    
    -- Privacy settings
    blur_enabled BOOLEAN DEFAULT TRUE,
    blur_sensitivity INT DEFAULT 70, -- 0-100
    
    -- AI Learning
    ai_model_version VARCHAR(20),
    ai_training_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 2. CATEGORIES TABLE - Kategorije /oznake za termine
-- =====================================================
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    color HEX VARCHAR(7) DEFAULT '#6366F1', -- Indigo
    icon VARCHAR(50),
    emoji VARCHAR(10),
    
    is_default BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 5, -- 1-10, za AI rangiranje
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 3. APPOINTMENTS TABLE - Glavni termini
-- =====================================================
CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Vremenske vrednosti
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INT, -- Calculated field za AI
    
    -- Status & Priority
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    
    -- Voice Input Metadata (Scenario 1)
    is_voice_input BOOLEAN DEFAULT FALSE,
    voice_confidence_score FLOAT, -- 0.0-1.0 za NLP
    voice_log_id UUID,
    
    -- Privacy (Scenario 3)
    is_private BOOLEAN DEFAULT FALSE,
    blur_level INT DEFAULT 0, -- 0-100
    
    -- Critical Event Handling (Scenario 4)
    is_critical BOOLEAN DEFAULT FALSE,
    double_tap_activated BOOLEAN DEFAULT FALSE,
    sticky_lock BOOLEAN DEFAULT FALSE,
    super_biser_eligible BOOLEAN DEFAULT FALSE, -- 10+ obaveza
    
    -- Recurring Appointments
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'yearly'
    recurrence_end_date DATE,
    
    -- AI Analytics Fields
    user_completion_likely FLOAT, -- 0.0-1.0 prediction
    optimal_reminder_time TIMESTAMP,
    energy_level_required VARCHAR(20), -- 'low', 'medium', 'high'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    
    -- CRITICAL INDEXES za brzu pretragu slobodnih termina
    INDEX idx_user_date (user_id, start_time),
    INDEX idx_user_status (user_id, status),
    INDEX idx_date_range (start_time, end_time),
    INDEX idx_priority (priority),
    INDEX idx_category (category_id)
);

-- =====================================================
-- 4. VOICE_LOGS TABLE - Govorna unosa za Scenario 1
-- =====================================================
CREATE TABLE voice_logs (
    voice_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    audio_duration_seconds INT,
    audio_file_url VARCHAR(500),
    
    -- NLP Processing
    raw_text TEXT,
    processed_text TEXT,
    transcription_confidence FLOAT, -- 0.0-1.0
    
    -- Extraction Results
    extracted_title VARCHAR(255),
    extracted_start_time TIMESTAMP,
    extracted_duration_minutes INT,
    extracted_category VARCHAR(100),
    
    -- Error Handling
    nlp_error_detected BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    fallback_to_manual BOOLEAN DEFAULT FALSE,
    
    -- AI Learning
    ai_correction_applied BOOLEAN DEFAULT FALSE,
    user_confirmed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 5. ALERTS TABLE - Notifikacije i reminderi
-- =====================================================
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    alert_type ENUM('reminder', 'critical', 'warning', 'confirmation', 'diamond') DEFAULT 'reminder',
    alert_trigger_minutes INT DEFAULT 15, -- Minuta pre termina
    
    -- Critical Alert (Scenario 4)
    is_critical BOOLEAN DEFAULT FALSE,
    diamond_alert_triggered BOOLEAN DEFAULT FALSE,
    alert_flash_count INT DEFAULT 3, -- Diamond Alert treperenje 3x
    
    -- Status
    status ENUM('pending', 'sent', 'dismissed', 'snoozed') DEFAULT 'pending',
    trigger_time TIMESTAMP,
    sent_time TIMESTAMP,
    dismissed_at TIMESTAMP,
    
    -- User Interaction (za AI)
    interaction_type VARCHAR(50), -- 'accepted', 'snoozed', 'dismissed'
    snooze_duration_minutes INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    INDEX idx_user_pending (user_id, status),
    INDEX idx_trigger_time (trigger_time)
);

-- =====================================================
-- 6. FREE_SLOTS VIEW - Optimizovana pretraga slobodnog vremena
-- =====================================================
CREATE VIEW free_slots_view AS
SELECT 
    user_id,
    DATE(start_time) AS slot_date,
    MIN(start_time) AS earliest_available,
    MAX(end_time) AS latest_available,
    COUNT(*) AS appointments_count
FROM appointments
WHERE status = 'scheduled' AND start_time > NOW()
GROUP BY user_id, DATE(start_time)
ORDER BY slot_date ASC;

-- =====================================================
-- 7. APPOINTMENT_CONFLICTS TABLE - Pronalaženje konflikata
-- =====================================================
CREATE TABLE appointment_conflicts (
    conflict_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    appointment_id_1 UUID NOT NULL,
    appointment_id_2 UUID NOT NULL,
    
    conflict_type ENUM('overlap', 'back_to_back', 'insufficient_buffer') DEFAULT 'overlap',
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolution_method VARCHAR(100),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id_1) REFERENCES appointments(appointment_id),
    FOREIGN KEY (appointment_id_2) REFERENCES appointments(appointment_id),
    
    INDEX idx_user_unresolved (user_id, resolved)
);

-- =====================================================
-- 8. USER_PREFERENCES TABLE - Za AI personalizaciju
-- =====================================================
CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
    -- Time Management AI
    preferred_day_start_hour INT DEFAULT 8,
    preferred_day_end_hour INT DEFAULT 22,
    focus_block_duration_minutes INT DEFAULT 120,
    buffer_between_appointments_minutes INT DEFAULT 15,
    
    -- Behavioral Patterns
    peak_productivity_hours VARCHAR(100), -- '09:00-12:00,14:00-17:00'
    avg_appointments_per_day INT,
    cancellation_rate FLOAT DEFAULT 0.0, -- 0.0-1.0
    
    -- AI Features
    enable_smart_scheduling BOOLEAN DEFAULT TRUE,
    enable_conflict_prevention BOOLEAN DEFAULT TRUE,
    enable_energy_optimization BOOLEAN DEFAULT TRUE,
    
    -- Reminders
    default_reminder_minutes INT DEFAULT 15,
    prefer_push_notifications BOOLEAN DEFAULT TRUE,
    prefer_email_notifications BOOLEAN DEFAULT FALSE,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 9. AI_ANALYTICS TABLE - Sve za AI analitiku (Scenario 5)
-- =====================================================
CREATE TABLE ai_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    appointment_id UUID,
    
    -- Prediction Data
    prediction_type VARCHAR(50), -- 'completion', 'scheduling', 'category'
    prediction_model_version VARCHAR(20),
    predicted_value FLOAT,
    actual_value FLOAT,
    prediction_accuracy FLOAT, -- 0.0-1.0
    
    -- Behavioral Analysis
    user_action_type VARCHAR(100), -- 'created', 'edited', 'completed', 'cancelled'
    action_duration_seconds INT,
    user_hesitation_detected BOOLEAN DEFAULT FALSE,
    
    -- Time Series Data
    time_slot_preference VARCHAR(20), -- 'morning', 'afternoon', 'evening'
    energy_level_at_action VARCHAR(20), -- 'high', 'medium', 'low'
    context_weather VARCHAR(50),
    context_location VARCHAR(100),
    
    -- Voice AI Insights
    voice_emotion_detected VARCHAR(50), -- 'calm', 'stressed', 'excited'
    voice_urgency_score FLOAT, -- 0.0-1.0
    nlp_intent_confidence FLOAT,
    
    -- Pattern Recognition
    pattern_identified VARCHAR(100),
    pattern_frequency INT,
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    
    INDEX idx_user_action (user_id, user_action_type),
    INDEX idx_prediction_type (prediction_type),
    INDEX idx_recorded_at (recorded_at)
);

-- =====================================================
-- 10. AUDIT_LOG TABLE - Sigurnost i compliance
-- =====================================================
CREATE TABLE audit_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    
    action VARCHAR(100),
    entity_type VARCHAR(50), -- 'appointment', 'user', 'preference'
    entity_id UUID,
    
    old_values JSON,
    new_values JSON,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 11. SUPER_BISER_TRACKER TABLE - Scenario 4: 10+ obaveza
-- =====================================================
CREATE TABLE super_biser_tracker (
    tracker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    date_count DATE NOT NULL,
    appointment_count INT DEFAULT 0,
    super_biser_active BOOLEAN DEFAULT FALSE,
    
    alert_sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date_count),
    INDEX idx_super_biser (super_biser_active)
);

-- =====================================================
-- INDEXI ZA BRZU PRETRAGU SLOBODNIH TERMINA
-- =====================================================

-- Критични indeksi za pronalaženje slobodnog vremena
CREATE INDEX idx_appointments_user_start_status 
ON appointments(user_id, start_time DESC, status);

CREATE INDEX idx_appointments_user_end_status 
ON appointments(user_id, end_time ASC, status);

CREATE INDEX idx_appointments_date_filter 
ON appointments(DATE(start_time), user_id, status);

-- Za brzu proveru konflikata
CREATE INDEX idx_appointments_time_overlap 
ON appointments(start_time, end_time);

-- =====================================================
-- STORED PROCEDURES - Za brzu pretragu slobodnih termina
-- =====================================================

DELIMITER $$

-- Pronalaženje slobodnog vremena za korisnika u datumskom opsegu
CREATE PROCEDURE find_free_slots(
    IN p_user_id UUID,
    IN p_date_start DATE,
    IN p_date_end DATE,
    IN p_min_duration_minutes INT DEFAULT 60
)
BEGIN
    SELECT 
        p_date_start + INTERVAL (HOUR(free_start) * 60 + MINUTE(free_start)) MINUTE AS free_start,
        p_date_start + INTERVAL (HOUR(free_end) * 60 + MINUTE(free_end)) MINUTE AS free_end,
        (EXTRACT(EPOCH FROM (free_end - free_start)) / 60) AS duration_minutes
    FROM (
        SELECT 
            LAG(end_time) OVER (ORDER BY start_time) AS free_start,
            start_time AS free_end
        FROM appointments
        WHERE user_id = p_user_id 
            AND DATE(start_time) BETWEEN p_date_start AND p_date_end
            AND status = 'scheduled'
    ) AS gaps
    WHERE free_start IS NOT NULL 
        AND (EXTRACT(EPOCH FROM (free_end - free_start)) / 60) >= p_min_duration_minutes
    ORDER BY free_start;
END$$

-- Provera konflikata sa postojećim terminima
CREATE PROCEDURE check_appointment_conflicts(
    IN p_user_id UUID,
    IN p_start_time TIMESTAMP,
    IN p_end_time TIMESTAMP,
    IN p_buffer_minutes INT DEFAULT 15
)
BEGIN
    SELECT 
        appointment_id,
        title,
        start_time,
        end_time,
        CASE 
            WHEN (p_start_time < end_time AND p_end_time > start_time) THEN 'overlap'
            WHEN (DATE(start_time) = DATE(p_start_time) AND 
                  EXTRACT(EPOCH FROM (start_time - p_end_time)) / 60 < p_buffer_minutes) THEN 'insufficient_buffer'
            ELSE 'back_to_back'
        END AS conflict_type
    FROM appointments
    WHERE user_id = p_user_id
        AND status = 'scheduled'
        AND (
            (p_start_time < end_time AND p_end_time > start_time) OR
            (EXTRACT(EPOCH FROM (start_time - p_end_time)) / 60 < p_buffer_minutes AND
             EXTRACT(EPOCH FROM (start_time - p_end_time)) / 60 >= 0)
        )
    ORDER BY start_time;
END$$

-- Pronalaženje Super Biser događaja (10+ termina u dan)
CREATE PROCEDURE check_super_biser(
    IN p_user_id UUID,
    IN p_date DATE
)
BEGIN
    SELECT 
        COUNT(*) AS appointment_count,
        CASE WHEN COUNT(*) >= 10 THEN TRUE ELSE FALSE END AS super_biser_active
    FROM appointments
    WHERE user_id = p_user_id
        AND DATE(start_time) = p_date
        AND status = 'scheduled';
END$$

-- AI Recommendation za optimalni reminder vremena
CREATE PROCEDURE ai_optimal_reminder_time(
    IN p_user_id UUID,
    IN p_appointment_id UUID
)
BEGIN
    SELECT 
        CASE 
            WHEN energy_level_required = 'high' THEN 30
            WHEN energy_level_required = 'medium' THEN 20
            ELSE 10
        END AS recommended_reminder_minutes,
        CASE 
            WHEN user_completion_likely > 0.8 THEN 'push_notification'
            WHEN user_completion_likely > 0.5 THEN 'email_reminder'
            ELSE 'push_and_email'
        END AS recommended_method
    FROM appointments
    WHERE appointment_id = p_appointment_id
        AND user_id = p_user_id;
END$$

DELIMITER ;

-- =====================================================
-- INICIJALNI PODACI - Test Kategorije
-- =====================================================

-- Kreiraj default kategorije za test korisnika
INSERT INTO categories (user_id, name, color, emoji, is_default, priority) 
VALUES 
    (UUID(), 'Rad', '#3B82F6', '💼', TRUE, 9),
    (UUID(), 'Slobodno vreme', '#10B981', '🎯', TRUE, 7),
    (UUID(), 'Zdravlje', '#F59E0B', '💪', TRUE, 10),
    (UUID(), 'Lično', '#8B5CF6', '🌙', TRUE, 6);

-- =====================================================
-- END OF DATABASE SCHEMA
-- =====================================================
