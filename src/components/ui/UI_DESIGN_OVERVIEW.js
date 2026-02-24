// =====================================================
// AMIGELLA - UI/UX DESIGN OVERVIEW
// Tri Ključna Ekrana - Integracija & Flow
// =====================================================

/**
 * AMIGELLA JE TRIPTIH OD TRI EKRANA:
 * 
 * 1. JUTARNJI MIR (8:00 AM)
 *    └─ Korisnica počinje dan
 *    └─ Vidi ceo dnevni raspored
 *    └─ Svi termini su organizovani
 *    └─ Fokus: Mirnoća, preglednost, kontrola
 * 
 * 2. VOICE INTERACTION (Bilo kada)
 *    └─ Korisnica kaže: "Sutra sa 14 do 15 meetup sa Ninom"
 *    └─ Govorna unosa → Transkript → Biseri → Termin
 *    └─ Fokus: Sloboda, fluidnost, intuitivnost
 * 
 * 3. THE SENTINEL SHIELD (11. termin)
 *    └─ Amigella zaustavlja burnout
 *    └─ "Preskupilo! Već imaš 10 termina"
 *    └─ Empatičan, ali čvrst - sa preporukama
 *    └─ Fokus: Zaštita, pažnja, samozaštita
 */

// =====================================================
// 1. DESIGN SYSTEM - Globalne Konstante
// =====================================================

const DESIGN_SYSTEM = {
  // Boja Palet - Source of Truth
  COLORS: {
    // Žalfija zelena - Heart of Amigella
    primary: {
      light: '#E8F5E9',
      regular: '#81C784', // Main
      deep: '#4CAF50',
      dark: '#2E7D32',
    },
    
    // Accent boje po scenariju
    voice: '#FFB74D',     // Warm orange - voice
    sentinel: '#FFD166',  // Gold - protection
    
    // Neutrals
    white: '#FFFFFF',
    light_gray: '#F5F5F5',
    gray: '#999999',
    dark_gray: '#424242',
  },
  
  TYPOGRAPHY: {
    family: "'Inter', 'Helvetica Neue', sans-serif",
    sizes: {
      h1: '32px',
      h2: '24px',
      h3: '18px',
      body: '16px',
      small: '14px',
      caption: '12px',
    },
  },
  
  SPACING: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  RADIUS: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  
  ANIMATIONS: {
    duration_fast: '0.3s',
    duration_normal: '0.5s',
    duration_slow: '1s',
    easing_default: 'ease-out',
    easing_bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// =====================================================
// 2. USER FLOW - Kako Se Ekrani Povezuju
// =====================================================

/**
 * TIPIČAN DAN U AMIGELLI:
 * 
 * 08:00 - Korisnica ustane
 * ├─ Otvori aplikaciju
 * ├─ Vidi JUTARNJI MIR ekran
 * │  ├─ "Dobro jutro, Nina" ✨
 * │  ├─ Slobodno vreme: 6h 45min
 * │  ├─ Termini: 3 zakazana
 * │  ├─ Timeline sa dnevnim rasporedom
 * │  └─ Akcije: Voice input, Calendar, Privacy, Settings
 * │
 * 09:00 - Korisnica želi da doda termin
 * ├─ Klikne na "🎤 Govorna unosa"
 * ├─ Ide na Voice Interaction Mode
 * ├─ Govori: "Sutra sa 14 do 15 meetup sa Ninom u kafiću"
 * ├─ VOICE SCREEN animira:
 * │  ├─ Pulsiras magličasti krug
 * │  ├─ Live transkript: "Sutra sa 14 do 15 meetup..."
 * │  ├─ Biseri se pojavljuju: 🔸sutra 🔸14-15 🔸meetup 🔸Nina 🔸kafiću
 * │  ├─ Korisnica potvrdi: "✓ Potvrdi termin iz bisera"
 * │  └─ Termin se kreira
 * │
 * 14:00 - Korisnica želi da doda 11. termin
 * ├─ Sistem detektuje: super_biser_count >= 10
 * ├─ Modal se pojavljuje: THE SENTINEL SHIELD
 * ├─ Ekran: "Preskupilo! Već imaš 10 termina na Ponedeljak"
 * ├─ AI preporuka: "Postavimo Focus blok od 19:00-21:00"
 * ├─ Korisnica ima dve opcije:
 * │  ├─ A) "Izvini, nije hitna" (AI je u pravu)
 * │  └─ B) "Ovo je hitno!" (korisnica insistira - sa warning logom)
 * │
 * 21:00 - Korisnica ide spavati
 * └─ AI_ANALYTICS log sve: termini, voice inputs, sentiment, patterns
 *    └─ Tomorrow morning, AI će biti 0.5% pametnija
 */

// =====================================================
// 3. KOMPONENTE - FILE MAPPING
// =====================================================

const FILE_STRUCTURE = {
  'UI_SCREEN_1_JUTARNJI_MIR.jsx': {
    description: 'Dashboard - 8:00 AM morning screen',
    colors: ['primary_green', 'light_neutrals'],
    animations: ['float', 'slideUp'],
    scrollable: true,
    tab_bar: true,
  },
  
  'UI_SCREEN_2_VOICE_MODE.jsx': {
    description: 'Voice Interaction - govorna unosa',
    colors: ['warm_orange', 'dark_bg'],
    animations: ['pulsing_circle', 'biser_appear', 'cursor_blink'],
    interactive: 'voice_input',
    key_feature: 'biseri (keyword extraction)',
  },
  
  'UI_SCREEN_3_SENTINEL_SHIELD.jsx': {
    description: 'Super Biser Alert - 11. termin warning',
    colors: ['gold_accent', 'semi_transparent_overlay'],
    animations: ['slide_up_modal', 'float_shield'],
    modal: true,
    workflow: 'super_biser_prevention',
  },
};

// =====================================================
// 4. KLJUČNE BOJE - Deep Dive
// =====================================================

const COLOR_STORY = {
  // ŽALFIJA ZELENA - Why this color?
  primary_green: {
    hex: '#81C784',
    psychology: 'Calm, peace, nature, growth, trust',
    usage: [
      'Main brand color',
      'Free time highlights',
      'Primary buttons',
      'Health/wellness indicators',
    ],
    inspiration: 'Sage green used in meditation spaces',
  },
  
  // WARM ORANGE - Voice energy
  voice_orange: {
    hex: '#FFB74D',
    psychology: 'Warmth, energy, creativity, communication',
    usage: [
      'Voice input screen',
      'Accent colors',
      'Engagement states',
    ],
    inspiration: 'Sunset energy - end of day + transitions',
  },
  
  // GOLD - Sentinel protection
  sentinel_gold: {
    hex: '#FFD166',
    psychology: 'Value, protection, wisdom, precious',
    usage: [
      'Emergency alerts',
      'Shield modal',
      'AI recommendations',
    ],
    inspiration: 'Medieval shields - protector, not threat',
  },
};

// =====================================================
// 5. MICRO-INTERACTIONS DETAIL
// =====================================================

const MICRO_INTERACTIONS = {
  // JUTARNJI MIR
  dashboard: {
    header_emoji_float: {
      animation: 'float 3s ease-in-out infinite',
      purpose: 'Subtle life - not robotic, but alive',
    },
    free_time_pulse: {
      animation: 'pulse 2s ease-in-out infinite',
      purpose: 'Highlight important metric',
    },
    timeline_item_hover: {
      effect: 'borderColor_change + shadow_lift',
      purpose: 'Indicate interactivity',
    },
  },
  
  // VOICE MODE
  voice_mode: {
    pulsing_circle: {
      rings: 3,
      tempo: '2s',
      purpose: 'Deep breathing effect - calm + engaged',
    },
    transcript_typing: {
      speed: '80ms per character',
      cursor: 'blinking',
      purpose: 'Real-time feedback - feels ALIVE',
    },
    biser_appear: {
      scale: '0.5 → 1.0',
      duration: '500ms',
      stagger: '+50ms per item',
      purpose: 'Playful, treasure-like feeling',
    },
  },
  
  // SENTINEL SHIELD
  sentinel_shield: {
    overlay_fade: {
      duration: '300ms',
      backdrop_blur: '4px',
      overlay_opacity: '0.5',
      purpose: 'Focus on modal, block interactions',
    },
    modal_entrance: {
      animation: 'slide_up with cubic-bezier bounce',
      y_translation: '40px → 0px',
      purpose: 'Feeling of importance + approach',
    },
    button_feedback: {
      hover: 'translateY(-2px) + shadow',
      active: 'scale(0.98)',
      purpose: 'Physical feedback - tactile feel',
    },
  },
};

// =====================================================
// 6. RESPONSIVE DESIGN BREAKPOINTS
// =====================================================

const RESPONSIVE = {
  mobile_small: '280px-320px', // iPhone SE, iPhone 5S
  mobile: '375px-425px',        // iPhone 12, 13, 14
  tablet: '768px-1024px',
  desktop: '1025px+',
  
  // Mobile-first approach
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

// =====================================================
// 7. ACCESSIBILITY CONSIDERATIONS
// =====================================================

const A11Y = {
  color_contrast: {
    primary_text_on_white: '#424242 (WCAG AAA)',
    primary_text_on_green: '#FFFFFF (WCAG AAA)',
  },
  
  font_sizes: {
    minimum: '14px (body text)',
    buttons: '16px+',
    touch_target: '44x44px minimum',
  },
  
  labels: {
    all_buttons: 'aria-label required',
    forms: 'associated labels required',
    icons: 'title attribute required',
  },
  
  keyboard_navigation: {
    tab_order: 'logical flow - left to right, top to bottom',
    focus_visible: 'clear outline on interactive elements',
    screen_readers: 'semantic HTML + ARIA roles',
  },
};

// =====================================================
// 8. DARK MODE SUPPORT
// =====================================================

const DARK_MODE = {
  backgrounds: {
    primary: '#0F0F0F', // Voice mode feels dark by default
    secondary: '#1A1A1A',
    tertiary: '#2A2A2A',
  },
  
  text: {
    primary: '#F5F5F5',
    secondary: '#B0B0B0',
    tertiary: '#707070',
  },
  
  // Green adjusts for dark mode
  primary_green_dark: '#66BB6A', // Lighter in dark mode
  
  // All other colors remain consistent
};

// =====================================================
// 9. PERFORMANCE OPTIMIZATION
// =====================================================

const PERFORMANCE = {
  animations: {
    gpu_optimized: ['transform', 'opacity'],
    avoid: ['width', 'height', 'left', 'top'],
    method: 'CSS transforms + requestAnimationFrame',
  },
  
  images: {
    emojis: 'inline (no loading)',
    icons: 'SVG (scalable)',
    backgrounds: 'CSS gradients (no image files)',
  },
  
  lazy_loading: {
    timeline_items: 'virtualized list (show 5+2)',
    voice_archive: 'lazy load on demand',
  },
  
  bundle_size: {
    target: '< 200KB (gzipped)',
    libraries: [
      'React (required)',
      'styled-components (CSS-in-JS)',
      'No jQuery, no Bootstrap',
    ],
  },
};

// =====================================================
// 10. INTEGRATION WITH DATABASE
// =====================================================

const DATA_FLOW = {
  'Jutarnji Mir': {
    queries: [
      'SELECT * FROM appointments WHERE user_id = ? AND DATE(start_time) = CURDATE()',
      'CALL find_free_slots(user_id, today, today, 60)',
      'SELECT SUM(duration_minutes) FROM appointments WHERE user_id = ? AND DATE(start_time) = TODAY()',
    ],
    cache: '5 minutes (update on foreground)',
  },
  
  'Voice Mode': {
    workflow: [
      '1. Capture audio → blob',
      '2. POST /api/voice/transcribe → Google Gemini API',
      '3. Extract biseri (NLP)',
      '4. INSERT voice_logs record',
      '5. INSERT appointments record',
      '6. INSERT ai_analytics record (for ML)',
    ],
    latency: '< 5 seconds total',
  },
  
  'Sentinel Shield': {
    trigger: 'IF appointments_count >= 10 ON DATE(today)',
    check: [
      'COUNT(*) FROM appointments WHERE DATE(start_time) = TODAY()',
      'IF count >= 10 → SHOW Modal',
      'If user confirms → log with "super_biser=true" flag',
    ],
  },
};

// =====================================================
// 11. TESTING SCENARIOS
// =====================================================

const TEST_CASES = {
  'Jutarnji Mir': [
    '✓ Display greeting matching time of day',
    '✓ Calculate free time correctly',
    '✓ Show timeline with no appointments',
    '✓ Show timeline with 5+ appointments',
    '✓ Highlight free slots',
    '✓ Responsive on all breakpoints',
    '✓ Dark mode support',
  ],
  
  'Voice Mode': [
    '✓ Microphone permission handling',
    '✓ Live transcription display',
    '✓ Biseri extraction & display',
    '✓ Add/remove biseri interaction',
    '✓ Confirm appointment creation',
    '✓ Retry/cancel flow',
    '✓ Network failure handling',
    '✓ Audio file upload to storage',
  ],
  
  'Sentinel Shield': [
    '✓ Appear only when count >= 10',
    '✓ Display correct count',
    '✓ Show AI recommendation',
    '✓ Accept decline button',
    '✓ Accept force-add button',
    '✓ View all appointments expansion',
    '✓ Log decision to database',
    '✓ Modal dismiss on outside tap',
  ],
};

// =====================================================
// 12. NEXT STEPS - DEVELOPMENT ROADMAP
// =====================================================

const DEVELOPMENT_ROADMAP = {
  phase_1: {
    name: 'Static UI (Week 1)',
    tasks: [
      'Setup React + styled-components',
      'Implement component structures',
      'Test responsive design',
      'Implement animations',
      'Dark mode support',
    ],
  },
  
  phase_2: {
    name: 'Backend Integration (Week 2)',
    tasks: [
      'REST API endpoints creation',
      'Connect Jutarnji Mir to database',
      'Implement voice API (Gemini integration)',
      'Connect Sentinel Shield logic',
      'Error handling & validation',
    ],
  },
  
  phase_3: {
    name: 'Real-time Features (Week 3)',
    tasks: [
      'WebSocket for live updates',
      'Audio file storage (S3?)',
      'AI analytics logging',
      'Notification system',
      'Performance optimization',
    ],
  },
  
  phase_4: {
    name: 'QA & Launch (Week 4)',
    tasks: [
      'E2E testing',
      'Load testing (1000 concurrent)',
      'Security audit',
      'Accessibility testing',
      'App store deployment',
    ],
  },
};

// =====================================================
// 13. EXPORTED CONSTANTS FOR USE
// =====================================================

export {
  DESIGN_SYSTEM,
  FILE_STRUCTURE,
  COLOR_STORY,
  MICRO_INTERACTIONS,
  RESPONSIVE,
  A11Y,
  DARK_MODE,
  PERFORMANCE,
  DATA_FLOW,
  TEST_CASES,
  DEVELOPMENT_ROADMAP,
};

// =====================================================
// 14. SUMMARY - TRI EKRANA UKRATKO
// =====================================================

/**
 * 🏡 JUTARNJI MIR
 *    Minimalist dashboard sa žalfijom zelenu
 *    Korisnica vidi: vreme, slobodno vreme, termine
 *    Fokus: Mir, preglednost, kontrola
 *
 * 🎤 VOICE INTERACTION
 *    Pulsiras krug, transkript, biseri
 *    Korisnica govori, sistem sluša i pravi termine
 *    Fokus: Sloboda, fluidnost, intuitivnost
 *
 * 🛡️ THE SENTINEL SHIELD
 *    Zlatni alarm: "Preskupilo! 10+ termina"
 *    Empatičan, sa preporukama, ne represivan
 *    Fokus: Zaštita od burnout-a
 *
 * SVI ZAJEDNO = Complete Calendar Experience
 * Amigella = The Pearl (beauty) + The Sentinel (protection)
 */
