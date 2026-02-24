// =====================================================
// AMIGELLA - BACKEND API
// Node.js/Express Server
// =====================================================

/**
 * SETUP:
 * npm install express dotenv cors morgan body-parser pg axios
 * npm install @google-cloud/speech-to-text
 * npm install multer uuid
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const axios = require('axios');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// =====================================================
// KONFIGURACIJA
// =====================================================

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// =====================================================
// DATABASE KONFIGURACIJA
// =====================================================

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'amigella',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// =====================================================
// GEMINI API KONFIGURACIJA
// =====================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// =====================================================
// FILE UPLOAD SETUP
// =====================================================

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}.${file.mimetype.split('/')[1]}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Pretvori audio blob u text koristeći Google Gemini API
 */
async function transcribeAudioWithGemini(audioBuffer) {
  try {
    // Konvertuj buffer u base64
    const base64Audio = audioBuffer.toString('base64');
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Ovo je audio snimak. Molim istraži šta osoba govori. Vrati samo transkript, ništa drugo. Jezik je srpski (ili miksovani srpski/engleski).",
            },
            {
              inline_data: {
                mime_type: "audio/mp3", // ili audio/wav, audio/ogg itd
                data: base64Audio,
              },
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      payload
    );

    const transcript = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return transcript.trim();
  } catch (error) {
    console.error('Gemini transcription error:', error.message);
    return null;
  }
}

/**
 * Ekstraktuj informacije iz transkripta koristeći Gemini
 */
async function extractAppointmentDataWithGemini(transcript) {
  try {
    const prompt = `
Analiziraj ovu srpsku izjavu o terminu i ekstraktuj strukturovane podatke:

"${transcript}"

Vrati JSON sa sledećim poljima (ako postoji):
{
  "title": "naslov aktivnosti",
  "start_time": "ISO format ili relative vreme (npr. 'sutra 14:00')",
  "duration_minutes": broj,
  "category": "rad|zdravlje|privatno|slobodno_vreme",
  "priority": "low|medium|high|critical",
  "location": "lokacija ako postoji",
  "person": "osoba ako se spominje",
  "urgency_level": 0.0 do 1.0,
  "confidence": 0.0 do 1.0,
  "emotion": "calm|neutral|stressed|excited"
}

Vrati SAMO JSON, bez komuniteta.
    `;

    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse JSON (sa error handling)
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      return {};
    }
  } catch (error) {
    console.error('Gemini extraction error:', error.message);
    return {};
  }
}

/**
 * Pronađi slobodno vreme za korisnika
 */
async function findFreeSlots(userId, startDate, endDate, minDurationMinutes = 60) {
  try {
    const result = await pool.query(
      'SELECT * FROM find_free_slots($1, $2, $3, $4)',
      [userId, startDate, endDate, minDurationMinutes]
    );
    return result.rows;
  } catch (error) {
    console.error('Find free slots error:', error.message);
    return [];
  }
}

/**
 * Pronađi konflikte za novi termin
 */
async function checkConflicts(userId, startTime, endTime, bufferMinutes = 15) {
  try {
    const result = await pool.query(
      'SELECT * FROM check_appointment_conflicts($1, $2, $3, $4)',
      [userId, startTime, endTime, bufferMinutes]
    );
    return result.rows;
  } catch (error) {
    console.error('Check conflicts error:', error.message);
    return [];
  }
}

/**
 * Pronađi Super Biser dan (10+ termina)
 */
async function checkSuperBiser(userId, date) {
  try {
    const result = await pool.query(
      'SELECT * FROM check_super_biser($1, $2)',
      [userId, date]
    );
    
    if (result.rows.length > 0) {
      return {
        appointmentCount: result.rows[0].appointment_count,
        isSuperBiser: result.rows[0].super_biser_active,
      };
    }
    
    return { appointmentCount: 0, isSuperBiser: false };
  } catch (error) {
    console.error('Check super biser error:', error.message);
    return { appointmentCount: 0, isSuperBiser: false };
  }
}

// =====================================================
// RUTE - AUTHENTICATION (Mock Za Demo)
// =====================================================

/**
 * POST /api/auth/login
 * Mock login - u produkciji koristiti JWT
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock: u produkciji proveri password + kreiraj JWT
    const user = await pool.query(
      'SELECT user_id, email, full_name FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Mock token
    const token = `mock-jwt-token-${user.rows[0].user_id}`;
    
    res.json({
      success: true,
      token,
      user: user.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/register
 * Kreiraj novog korisnika
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, full_name, timezone = 'UTC' } = req.body;
    
    // Proveri da li korisnik već postoji
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Kreiraj novog korisnika
    const newUser = await pool.query(
      `INSERT INTO users (email, full_name, timezone)
       VALUES ($1, $2, $3)
       RETURNING user_id, email, full_name`,
      [email, full_name, timezone]
    );
    
    // Kreiraj default kategorije
    const userId = newUser.rows[0].user_id;
    const defaultCategories = [
      { name: 'Rad', color: '#3B82F6', emoji: '💼' },
      { name: 'Slobodno vreme', color: '#10B981', emoji: '🎯' },
      { name: 'Zdravlje', color: '#F59E0B', emoji: '💪' },
      { name: 'Lično', color: '#8B5CF6', emoji: '🌙' },
    ];
    
    for (const cat of defaultCategories) {
      await pool.query(
        `INSERT INTO categories (user_id, name, color, emoji, is_default, priority)
         VALUES ($1, $2, $3, $4, true, 5)`,
        [userId, cat.name, cat.color, cat.emoji]
      );
    }
    
    const token = `mock-jwt-token-${userId}`;
    
    res.json({
      success: true,
      token,
      user: newUser.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTE - APPOINTMENTS
// =====================================================

/**
 * GET /api/appointments/:userId
 * Uzmi sve termine za korisnika
 */
app.get('/api/appointments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT a.*, c.name as category_name, c.emoji
      FROM appointments a
      LEFT JOIN categories c ON a.category_id = c.category_id
      WHERE a.user_id = $1
    `;
    const params = [userId];
    
    if (startDate && endDate) {
      query += ` AND a.start_time BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY a.start_time DESC`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, appointments: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/appointments/:userId/today
 * Uzmi termine za dan
 */
app.get('/api/appointments/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, c.name as category_name, c.emoji
       FROM appointments a
       LEFT JOIN categories c ON a.category_id = c.category_id
       WHERE a.user_id = $1 AND DATE(a.start_time) = CURRENT_DATE
       ORDER BY a.start_time ASC`,
      [userId]
    );
    
    res.json({ success: true, appointments: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/free-slots/:userId
 * Pronađi slobodno vreme
 */
app.get('/api/free-slots/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, minDuration = 60 } = req.query;
    
    const freeSlots = await findFreeSlots(userId, startDate, endDate, minDuration);
    res.json({ success: true, freeSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/appointments
 * Kreiraj novi termin (sa conflict check-om)
 */
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      userId,
      categoryId,
      title,
      description,
      startTime,
      endTime,
      priority = 'medium',
      isPrivate = false,
      blurLevel = 0,
    } = req.body;

    // 1. Pronađi konflikte
    const conflicts = await checkConflicts(userId, startTime, endTime);
    if (conflicts.length > 0) {
      return res.status(400).json({
        error: 'Appointment conflicts detected',
        conflicts,
      });
    }

    // 2. Proverite Super Biser
    const superBiserCheck = await checkSuperBiser(userId, startTime.split('T')[0]);
    
    // 3. Ako je Super Biser, vrati upozorenje
    if (superBiserCheck.isSuperBiser) {
      return res.status(200).json({
        warning: 'super_biser',
        appointmentCount: superBiserCheck.appointmentCount,
        message: `Već imate ${superBiserCheck.appointmentCount} termina ovog dana.`,
      });
    }

    // 4. Kreiraj termin
    const durationMinutes = Math.round(
      (new Date(endTime) - new Date(startTime)) / 60000
    );

    const result = await pool.query(
      `INSERT INTO appointments (
        user_id, category_id, title, description,
        start_time, end_time, duration_minutes,
        priority, is_private, blur_level, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled')
       RETURNING *`,
      [userId, categoryId, title, description, startTime, endTime, durationMinutes, priority, isPrivate, blurLevel]
    );

    res.json({ success: true, appointment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/appointments/:appointmentId
 * Ažuriraj termin
 */
app.put('/api/appointments/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { title, description, startTime, endTime, priority, status } = req.body;

    const result = await pool.query(
      `UPDATE appointments
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time),
           priority = COALESCE($6, priority),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE appointment_id = $1
       RETURNING *`,
      [appointmentId, title, description, startTime, endTime, priority, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, appointment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/appointments/:appointmentId
 * Obriši termin
 */
app.delete('/api/appointments/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const result = await pool.query(
      'DELETE FROM appointments WHERE appointment_id = $1 RETURNING *',
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTE - VOICE INPUT (SRčE AMIGELLE!)
// =====================================================

/**
 * POST /api/voice/transcribe
 * Pretvori audio u termin
 * FLOW: Audio blob → Gemini transcription → Gemini extraction → DB save
 */
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // 1. Čitaj audio fajl
    const audioBuffer = fs.readFileSync(req.file.path);
    const audioFileUrl = `/uploads/${req.file.filename}`;

    // 2. Transkribuj sa Gemini
    const transcript = await transcribeAudioWithGemini(audioBuffer);
    
    if (!transcript) {
      fs.unlinkSync(req.file.path); // Obriši ako greška
      return res.status(400).json({ error: 'Failed to transcribe audio' });
    }

    // 3. Ekstraktuj podatke sa Gemini
    const extractedData = await extractAppointmentDataWithGemini(transcript);
    
    // 4. Sačuvaj voice_logs
    const voiceLogResult = await pool.query(
      `INSERT INTO voice_logs (
        user_id, audio_file_url, audio_duration_seconds,
        transcribed_text, raw_text,
        extracted_title, extracted_start_time, extracted_duration_minutes,
        extracted_category, extracted_priority, extracted_urgency_score,
        voice_emotion_detected, voice_confidence, transcription_confidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        userId,
        audioFileUrl,
        req.file.size / 1024, // Aproksimacija
        transcript,
        transcript,
        extractedData.title || 'Novi termin',
        extractedData.start_time || null,
        extractedData.duration_minutes || 60,
        extractedData.category || 'rad',
        extractedData.priority || 'medium',
        extractedData.urgency_level || 0.5,
        extractedData.emotion || 'neutral',
        extractedData.confidence || 0.0,
        extractedData.confidence || 0.0,
      ]
    );

    // 5. Pronađi kategoriju
    const categoryResult = await pool.query(
      `SELECT category_id FROM categories
       WHERE user_id = $1 AND LOWER(name) LIKE LOWER($2)
       LIMIT 1`,
      [userId, `%${extractedData.category || 'rad'}%`]
    );

    const categoryId = categoryResult.rows[0]?.category_id || null;

    // 6. Parse start_time - ako je "sutra 14:00", pretvori u TIMESTAMP
    let startTime = extractedData.start_time;
    if (startTime && !startTime.includes('T')) {
      // Procesiranje relativnog vremena
      const now = new Date();
      
      if (startTime.toLowerCase().includes('sutra')) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const timeMatch = startTime.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          tomorrow.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0);
          startTime = tomorrow.toISOString();
        }
      } else if (startTime.toLowerCase().includes('sada')) {
        startTime = now.toISOString();
      }
    }

    // 7. Kreiraj appointment (sa conflict check-om)
    const conflicts = await checkConflicts(
      userId,
      startTime,
      new Date(new Date(startTime).getTime() + (extractedData.duration_minutes || 60) * 60000).toISOString()
    );

    const superBiserCheck = await checkSuperBiser(userId, startTime.split('T')[0]);

    // Ako ima konflikata ili Super Biser, vrati upozorenje (ali sačuvaj voice_log)
    if (conflicts.length > 0 || superBiserCheck.isSuperBiser) {
      return res.json({
        warning: conflicts.length > 0 ? 'conflict' : 'super_biser',
        voice_log: voiceLogResult.rows[0],
        conflicts: conflicts.length > 0 ? conflicts : [],
        appointmentCount: superBiserCheck.appointmentCount,
        extractedData,
      });
    }

    // 8. Kreiraj appointment
    const appointmentResult = await pool.query(
      `INSERT INTO appointments (
        user_id, category_id, title, description,
        start_time, end_time, duration_minutes,
        priority, status,
        is_voice_input, voice_confidence_score, voice_log_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled', true, $9, $10)
       RETURNING *`,
      [
        userId,
        categoryId,
        extractedData.title || 'Novi termin iz glasa',
        `Kreiran iz govorne unose: "${transcript}"`,
        startTime,
        new Date(new Date(startTime).getTime() + (extractedData.duration_minutes || 60) * 60000).toISOString(),
        extractedData.duration_minutes || 60,
        extractedData.priority || 'medium',
        extractedData.confidence || 0.8,
        voiceLogResult.rows[0].voice_log_id,
      ]
    );

    // 9. Log za AI analytics
    await pool.query(
      `INSERT INTO ai_analytics (
        user_id, appointment_id,
        prediction_type, user_action_type,
        voice_emotion_detected, voice_urgency_score, nlp_intent_confidence
      ) VALUES ($1, $2, 'voice_input', 'created', $3, $4, $5)`,
      [
        userId,
        appointmentResult.rows[0].appointment_id,
        extractedData.emotion || 'neutral',
        extractedData.urgency_level || 0.5,
        extractedData.confidence || 0.0,
      ]
    );

    res.json({
      success: true,
      voice_log: voiceLogResult.rows[0],
      appointment: appointmentResult.rows[0],
      extracted: extractedData,
      transcript,
    });
  } catch (error) {
    console.error('Voice transcribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/voice-logs/:userId
 * Uzmi sve voice logs za korisnika
 */
app.get('/api/voice-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM voice_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ success: true, voiceLogs: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTE - SENTINEL SHIELD
// =====================================================

/**
 * POST /api/sentinel/check
 * Proverite da li je dan Super Biser (10+ termina)
 */
app.post('/api/sentinel/check', async (req, res) => {
  try {
    const { userId, date } = req.body;

    const result = await checkSuperBiser(userId, date);

    res.json({
      success: true,
      appointmentCount: result.appointmentCount,
      isSuperBiser: result.isSuperBiser,
      remainingSlots: Math.max(0, 10 - result.appointmentCount),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sentinel/force-add
 * Dodaj 11+ termin sa warning logom
 */
app.post('/api/sentinel/force-add', async (req, res) => {
  try {
    const { userId, appointmentData } = req.body;

    // Kreiraj termin sa "super_biser_forced" flagom
    const result = await pool.query(
      `INSERT INTO appointments (
        user_id, category_id, title, description,
        start_time, end_time, duration_minutes,
        priority, status, super_biser_eligible
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled', true)
       RETURNING *`,
      [
        userId,
        appointmentData.categoryId,
        appointmentData.title,
        appointmentData.description,
        appointmentData.startTime,
        appointmentData.endTime,
        appointmentData.durationMinutes,
        appointmentData.priority,
      ]
    );

    // Log u AI_ANALYTICS sa warning
    await pool.query(
      `INSERT INTO ai_analytics (
        user_id, appointment_id,
        prediction_type, user_action_type, pattern_identified
      ) VALUES ($1, $2, 'super_biser_override', 'created', 'user_forced_super_biser')`,
      [userId, result.rows[0].appointment_id]
    );

    res.json({
      success: true,
      appointment: result.rows[0],
      warning: 'Appointment created with burnout warning',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTE - CATEGORIES
// =====================================================

/**
 * GET /api/categories/:userId
 * Uzmi sve kategorije za korisnika
 */
app.get('/api/categories/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY is_default DESC, priority DESC',
      [userId]
    );

    res.json({ success: true, categories: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// RUTE - HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =====================================================
// ERROR HANDLING
// =====================================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   AMIGELLA BACKEND API                 ║
║   🚀 Server running on port ${PORT}      ║
║   📍 http://localhost:${PORT}           ║
║                                        ║
║   Routes:                              ║
║   - /api/health                        ║
║   - /api/auth/register                 ║
║   - /api/auth/login                    ║
║   - /api/appointments                  ║
║   - /api/voice/transcribe              ║
║   - /api/sentinel/check                ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
