// =====================================================
// AMIGELLA - UI/UX DESIGN SPECIFICATIONS
// Screen 1: Dashboard - Jutarnji Mir (8:00 AM)
// =====================================================

/**
 * DESIGN PHILOSOPHY:
 * - Žalfija zelena (svakotečnoj boju koja uspokojava)
 * - Minimalist approach: samo neophodne informacije
 * - Breathing space - dosta whitespace
 * - Typography: Light & Elegant
 * - Emocija: Mir, planiranost, kontrola
 */

// =====================================================
// 1. BOJA PALET
// =====================================================

const COLORS = {
  // PRIMARY - Žalfija Zelena (Heart of Amigella)
  primary_light: '#E8F5E9',      // ultra-light, background
  primary_regular: '#81C784',    // main green
  primary_deep: '#4CAF50',       // deep, for text
  primary_dark: '#2E7D32',       // darkest green, only for emphasis
  
  // NEUTRALS - Minimalizam
  white: '#FFFFFF',
  light_gray: '#F5F5F5',
  gray: '#9E9E9E',
  dark_gray: '#424242',
  
  // ACCENTS
  accent_warm: '#FFB74D',        // Orange for voice/alerts
  accent_calm: '#64B5F6',        // Blue for reminders
  danger: '#EF5350',             // Red, only for critical
  
  // BACKGROUND
  bg_main: '#FAFAFA',            // Softer than pure white
  bg_card: '#FFFFFF',
};

// =====================================================
// 2. TIPOGRAFIJA
// =====================================================

const TYPOGRAPHY = {
  // Font family: Inter (eller Helvetica Neue za fallback)
  family_main: "'Inter', 'Helvetica Neue', sans-serif",
  
  // Sizes
  h1: { size: '32px', weight: '300', lineHeight: '1.2' }, // "Dobro jutro, Nina"
  h2: { size: '24px', weight: '400', lineHeight: '1.3' }, // "Tvoj Kalendar"
  h3: { size: '18px', weight: '500', lineHeight: '1.4' }, // Card titles
  body: { size: '16px', weight: '400', lineHeight: '1.6' }, // Regular text
  small: { size: '14px', weight: '400', lineHeight: '1.5' }, // Secondary text
  caption: { size: '12px', weight: '400', lineHeight: '1.4' }, // Timestamps
};

// =====================================================
// 3. JUTARNJI MIR - LAYOUT STRUKTURA
// =====================================================

/**
 * STATUS BAR (top, minimal)
 * ┌─────────────────────────────────────────┐
 * │  8:32          [WiFi] [Battery]       │  (system - OS handles)
 * └─────────────────────────────────────────┘
 * 
 * HEADER (greeting + time)
 * ┌─────────────────────────────────────────┐
 * │                                         │
 * │  Dobro jutro, Nina ✨                  │  (h1, very light)
 * │  Ponedeljak, 24. februar                │  (small, secondary)
 * │                                         │
 * └─────────────────────────────────────────┘
 *
 * HERO SECTION (Dnevni Pregled)
 * ┌─────────────────────────────────────────┐
 * │                                         │
 * │     Slobodno vreme                      │  (caption)
 * │     6h 45min                            │  (h2, primary green)
 * │                                         │
 * │     Termini 3                           │  (caption)
 * │                                         │
 * └─────────────────────────────────────────┘
 *
 * QUICK ACTIONS (Card grid 2x2)
 * ┌──────────────────┬──────────────────┐
 * │  + Govorna unos  │  📅 Mesec        │
 * │  (Voice button)  │  (Calendar view) │
 * ├──────────────────┼──────────────────┤
 * │  🔐 Privatnost   │  ⚙️  Postavke   │
 * │  (Privacy check) │  (Settings)      │
 * └──────────────────┴──────────────────┘
 *
 * DAILY TIMELINE (scrollable, minimal)
 * ┌─────────────────────────────────────────┐
 * │  08:00  Standup                         │
 * │         10:00 → 10:30                   │
 * │         📍 Zoom → /workspace1           │
 * ├─────────────────────────────────────────┤
 * │  11:00  [FREE BLOCK] ← Green highlight │
 * │         120 min - idealno za fokus      │
 * ├─────────────────────────────────────────┤
 * │  14:00  Meeting salientom              │
 * │         14:00 → 15:30                   │
 * │         📍 Kafe Blue Corner             │
 * └─────────────────────────────────────────┘
 *
 * TAB BAR (bottom)
 * ┌─────────────────────────────────────────┐
 * │ 🏠 Početna  📅 Detaljno  🎤 Glasaj  ⚙️ │
 * └─────────────────────────────────────────┘
 */

// =====================================================
// 4. REACT KOMPONENTA - DASHBOARD JUTARNJI MIR
// =====================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components
const DashboardContainer = styled.div`
  background: ${COLORS.bg_main};
  min-height: 100vh;
  padding: 16px;
  font-family: ${TYPOGRAPHY.family_main};
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* Space za tab bar */
`;

const Header = styled.div`
  padding: 24px 0;
  margin-bottom: 8px;
  
  h1 {
    font-size: ${TYPOGRAPHY.h1.size};
    font-weight: ${TYPOGRAPHY.h1.weight};
    color: ${COLORS.dark_gray};
    margin: 0 0 4px 0;
    
    /* Emoji effect - light animation */
    span.emoji {
      display: inline-block;
      animation: float 3s ease-in-out infinite;
      margin-left: 8px;
    }
  }
  
  p {
    font-size: ${TYPOGRAPHY.small.size};
    color: ${COLORS.gray};
    margin: 0;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
  }
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, ${COLORS.primary_light} 0%, #F1F8F6 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin-bottom: 32px;
  text-align: center;
  border: 1px solid ${COLORS.primary_regular}20;
  
  .metric {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .label {
    font-size: ${TYPOGRAPHY.caption.size};
    color: ${COLORS.gray};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: ${TYPOGRAPHY.h2.size};
    font-weight: 300;
    color: ${COLORS.primary_deep};
    line-height: 1.2;
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
  
  @media (max-width: 375px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  background: ${COLORS.bg_card};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid ${COLORS.light_gray};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${COLORS.primary_regular};
    box-shadow: 0 4px 12px ${COLORS.primary_regular}15;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  .icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .label {
    font-size: ${TYPOGRAPHY.small.size};
    color: ${COLORS.dark_gray};
    font-weight: 500;
    text-align: center;
  }
`;

const TimelineSection = styled.div`
  h3 {
    font-size: ${TYPOGRAPHY.small.size};
    color: ${COLORS.gray};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    padding: 0 4px;
  }
`;

const TimelineItem = styled.div`
  background: ${COLORS.bg_card};
  border-left: 4px solid ${props => props.isFreeSlot 
    ? COLORS.primary_regular 
    : COLORS.accent_calm};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  
  .time {
    font-size: ${TYPOGRAPHY.caption.size};
    color: ${COLORS.gray};
    margin-bottom: 4px;
  }
  
  .title {
    font-size: ${TYPOGRAPHY.body.size};
    color: ${COLORS.dark_gray};
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .description {
    font-size: ${TYPOGRAPHY.small.size};
    color: ${COLORS.gray};
  }
  
  ${props => props.isFreeSlot && `
    background: linear-gradient(135deg, ${COLORS.primary_light}80 0%, transparent 100%);
    
    .title {
      color: ${COLORS.primary_deep};
      font-weight: 600;
    }
  `}
`;

// KOMPONENTA
export default function DashboardJutranjiMir() {
  const [time, setTime] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setTime(new Date()), 60000);
    
    // TODO: Fetch appointments from backend
    // setAppointments(fetchTodayAppointments());
    
    // Mock data
    setAppointments([
      {
        id: 1,
        time: '08:00 - 08:30',
        title: 'Standup',
        location: 'Zoom /workspace1',
        isFreeSlot: false,
      },
      {
        id: 2,
        time: '08:45 - 10:45',
        title: '[SLOBODNO VREME]',
        description: '120 min - idealno za fokus blok',
        isFreeSlot: true,
      },
      {
        id: 3,
        time: '14:00 - 15:30',
        title: 'Meeting sa Ninom',
        location: 'Kafe Blue Corner',
        isFreeSlot: false,
      },
    ]);
    
    return () => clearInterval(timer);
  }, []);
  
  const greeting = time.getHours() < 12 ? '✨ Dobro jutro' : '☀️ Dobar dan';
  const freeTime = '6h 45min';
  
  return (
    <DashboardContainer>
      <Header>
        <h1>{greeting}, <span className="emoji">Nina</span></h1>
        <p>Ponedeljak, 24. februar 2026</p>
      </Header>
      
      <HeroSection>
        <div className="metric">
          <div className="label">Slobodno vreme</div>
          <div className="value">{freeTime}</div>
        </div>
        <div className="metric">
          <div className="label">Termini</div>
          <div className="value">3</div>
        </div>
      </HeroSection>
      
      <QuickActionsGrid>
        <ActionCard onClick={() => alert('Voice input')}>
          <div className="icon">🎤</div>
          <div className="label">Govorna unosa</div>
        </ActionCard>
        <ActionCard onClick={() => alert('Calendar')}>
          <div className="icon">📅</div>
          <div className="label">Detaljni pogled</div>
        </ActionCard>
        <ActionCard onClick={() => alert('Privacy')}>
          <div className="icon">🔐</div>
          <div className="label">Privatnost</div>
        </ActionCard>
        <ActionCard onClick={() => alert('Settings')}>
          <div className="icon">⚙️</div>
          <div className="label">Postavke</div>
        </ActionCard>
      </QuickActionsGrid>
      
      <TimelineSection>
        <h3>Danasnji raspored</h3>
        {appointments.map(appt => (
          <TimelineItem key={appt.id} isFreeSlot={appt.isFreeSlot}>
            <div className="time">{appt.time}</div>
            <div className="title">{appt.title}</div>
            {appt.description && <div className="description">{appt.description}</div>}
            {appt.location && <div className="description">📍 {appt.location}</div>}
          </TimelineItem>
        ))}
      </TimelineSection>
    </DashboardContainer>
  );
}

// =====================================================
// 5. CSS VARIABLES (za light/dark mode)
// =====================================================

/*
:root {
  --color-primary-light: #E8F5E9;
  --color-primary-regular: #81C784;
  --color-primary-deep: #4CAF50;
  --color-primary-dark: #2E7D32;
  
  --color-bg-main: #FAFAFA;
  --color-bg-card: #FFFFFF;
  
  --font-h1: 32px;
  --font-h2: 24px;
  --font-body: 16px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

body {
  background: var(--color-bg-main);
  color: var(--color-dark-gray);
  font-family: 'Inter', sans-serif;
}
*/

// =====================================================
// 6. ANIMATIONS - Micro-interactions
// =====================================================

/*
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.appointment-new {
  animation: slideUp 0.4s ease-out;
}

.free-slot-highlight {
  animation: pulse 2s ease-in-out infinite;
}
*/
