// =====================================================
// AMIGELLA - UI/UX DESIGN SPECIFICATIONS
// Screen 3: The Sentinel Shield (Scenario 4)
// Ekran koji se pojavljuje: "Ne, 11. obaveza je previše!"
// =====================================================

/**
 * DESIGN PHILOSOPHY:
 * - Zaštitni ekran (modal) koji zaustavlja burnout
 * - Vizuelno snažna - ali ne agresivna
 * - Empatična, ne represivna
 * - Dve opcije: "Izvini, nije hitna" vs "Ovo je hitno, moram!"
 * - AI-powered preporuke za bolji raspored
 */

// =====================================================
// 1. BOJA PALET - Sentinel Mode (Protective)
// =====================================================

const SENTINEL_COLORS = {
  // Protective energy - ne crvena (agresivna), nego zlata (zaštita)
  accent_gold: '#FFD166',        // Golden shield
  accent_warm: '#FF9F43',        // Warmer orange
  
  // Sentiment
  warning: '#FF6B6B',            // Subtle red for alert
  success: '#51CF66',            // Green pentru affirmation
  
  // Background
  bg_overlay: '#00000080',       // Semi-transparent overlay
  bg_card: '#FFFFFF',
  
  // Text
  text_dark: '#1A1A1A',
  text_secondary: '#666666',
  
  // Neutral
  gray: '#999999',
  light_gray: '#F5F5F5',
};

// =====================================================
// 2. LAYOUT STRUKTURA - The Sentinel Shield
// =====================================================

/**
 * OVERLAY (full screen, semi-transparent)
 * ┌─────────────────────────────────────────┐
 * │  ⋰                                       │
 * │ ╱                                        │
 * │╱         [Sentinel Shield Modal]       │  Blur effect na background
 * │╲                                        │
 * │ ╲                                       │
 * │  ⋱                                      │
 * └─────────────────────────────────────────┘
 *
 * MODAL CARD (centered, with animation)
 * ┌─────────────────────────────────────────┐
 * │                                         │
 * │            🛡️                           │  Large shield emoji
 * │                                         │
 * │     PRESKUPILO!                         │  h1, bold
 * │                                         │
 * │   Već imaš 10 termina                  │  Explanation
 * │   Još jedan bi mogao biti                │
 * │   preskupo. 💙                          │
 * │                                         │
 * │   💡 Predlog:                           │
 * │   Postavimo "Focus blok" od             │
 * │   19:00-21:00 - oporavak vreme        │
 * │                                         │
 * │   ┌──────────────┬──────────────┐      │
 * │   │ Izvini, nije │ Ovo je hitno │      │
 * │   │   hitna      │   Moram!     │      │
 * │   └──────────────┴──────────────┘      │
 * │                                         │
 * │   [Pogledaj sve termine za dan]        │
 * │                                         │
 * └─────────────────────────────────────────┘
 */

// =====================================================
// 3. REACT KOMPONENTA - THE SENTINEL SHIELD
// =====================================================

import React, { useState } from 'react';
import styled from 'styled-components';

// Styled Components

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${SENTINEL_COLORS.bg_overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  
  /* Blur effect na background */
  backdrop-filter: blur(4px);
  animation: fade-in 0.3s ease-out;
  
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

const ModalCard = styled.div`
  background: ${SENTINEL_COLORS.bg_card};
  border-radius: 24px;
  padding: 32px 24px;
  max-width: 340px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slide-up-modal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  @keyframes slide-up-modal {
    0% {
      transform: translateY(40px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 375px) {
    padding: 24px 16px;
    border-radius: 20px;
  }
`;

const ShieldIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  animation: float-shield 3s ease-in-out infinite;
  
  @keyframes float-shield {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-8px) rotate(-2deg); }
    75% { transform: translateY(-8px) rotate(2deg); }
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${SENTINEL_COLORS.text_dark};
  margin: 0 0 12px 0;
  line-height: 1.3;
  
  /* Gradient effect na ključnu reč */
  background: linear-gradient(135deg, ${SENTINEL_COLORS.accent_gold} 0%, ${SENTINEL_COLORS.accent_warm} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ExplanationSection = styled.div`
  margin-bottom: 20px;
  
  .explanation-text {
    font-size: 15px;
    color: ${SENTINEL_COLORS.text_secondary};
    line-height: 1.6;
    margin-bottom: 12px;
    
    span.emoji {
      display: inline-block;
      margin: 0 2px;
    }
  }
`;

const SuggestionBox = styled.div`
  background: ${SENTINEL_COLORS.light_gray};
  border-left: 4px solid ${SENTINEL_COLORS.accent_gold};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: left;
  
  .suggestion-label {
    font-size: 12px;
    color: ${SENTINEL_COLORS.gray};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    font-weight: 600;
  }
  
  .suggestion-text {
    font-size: 14px;
    color: ${SENTINEL_COLORS.text_dark};
    line-height: 1.6;
    
    strong {
      color: ${SENTINEL_COLORS.accent_gold};
    }
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 320px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  padding: 16px 12px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, ${SENTINEL_COLORS.accent_gold} 0%, ${SENTINEL_COLORS.accent_warm} 100%);
    color: #000;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px ${SENTINEL_COLORS.accent_gold}40;
    }
    
    &:active {
      transform: translateY(0);
    }
  ` : `
    background: ${SENTINEL_COLORS.light_gray};
    color: ${SENTINEL_COLORS.text_dark};
    border: 1px solid #DDD;
    
    &:hover {
      background: #EFEFEF;
      border-color: ${SENTINEL_COLORS.accent_gold};
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: ${SENTINEL_COLORS.accent_gold};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s;
  
  &:hover {
    opacity: 0.7;
  }
`;

// KOMPONENTA
export default function TheSentinelShield() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  
  // Mock data - "10+ termina" scenario
  const appointmentCount = 10;
  const todayDate = 'Ponedeljak, 24. februar';
  const suggestedFocusTime = '19:00-21:00';
  const email = 'nina@amigella.com'; // Placeholder
  
  const handleDecline = () => {
    console.log('Korisnica je otkazala dodavanje 11. termina');
    setSelectedAction('declined');
    // Close modal nakon 1s
    setTimeout(() => {
      // TODO: close modal
    }, 800);
  };
  
  const handleForceAdd = () => {
    console.log('Korisnica je insistirala na dodavanju termina');
    setSelectedAction('confirmed');
    // Registruj termin sa "warning" statusom
    alert('Termin dodat! (Sa upozorenjem u AI sistemu)');
  };
  
  const handleViewAllAppointments = () => {
    setShowAllAppointments(!showAllAppointments);
  };
  
  return (
    <OverlayContainer>
      <ModalCard>
        <ShieldIcon>🛡️</ShieldIcon>
        
        <Title>
          Preskupilo!
        </Title>
        
        <ExplanationSection>
          <div className="explanation-text">
            Već imaš <strong>{appointmentCount} termina</strong> na <strong>{todayDate}</strong>.
          </div>
          <div className="explanation-text">
            Još jedan bi mogao biti preskupo. <span className="emoji">💙</span>
          </div>
        </ExplanationSection>
        
        <SuggestionBox>
          <div className="suggestion-label">💡 Moj predlog:</div>
          <div className="suggestion-text">
            Postavimo <strong>Focus blok</strong> od <strong>{suggestedFocusTime}</strong> — 
            to je oporavak vreme za tebe.
          </div>
        </SuggestionBox>
        
        <ButtonGrid>
          <Button 
            onClick={handleDecline}
            disabled={selectedAction === 'declined'}
          >
            ✓ Izvini, nije hitna
          </Button>
          <Button 
            primary 
            onClick={handleForceAdd}
            disabled={selectedAction === 'confirmed'}
          >
            ⚡ Ovo je hitno!
          </Button>
        </ButtonGrid>
        
        <SecondaryButton onClick={handleViewAllAppointments}>
          Pogledaj sve termine za dan
        </SecondaryButton>
      </ModalCard>
    </OverlayContainer>
  );
}

// =====================================================
// 4. EXTENDED VERSION - Sve obaveze za dan
// =====================================================

/*
AKO KORISNICA KLIKNE "Pogledaj sve termine":

OVERLAY se expande da pokazuje:

┌──────────────────────────────────────────┐
│  Ponedeljak, 24. februar - Sve obaveze   │
├──────────────────────────────────────────┤
│  08:00  Standup  [30 min]                │
│  09:00  Planning  [1h]                   │
│  10:00  Design Review  [1h]              │
│  11:00  Brainstorm  [1h 30min]           │
│  13:00  Lunch  [1h]                      │
│  14:00  Meeting sa Design team  [1.5h]   │
│  15:30  Code review  [45 min]            │
│  16:15  One-on-one  [30 min]             │
│  17:00  Presentation prep  [1h]          │
│  18:00  Retrospective  [1h]              │
│                                          │
│  ⚠️ UKUPNO: 10h 45min zakazano           │
│  ❌ Nema "pauza" za mentalni reset!      │
│                                          │
│  AI ANALITIKA:                           │
│  • Burnout rizik: 78%                    │
│  • Produktivnost posle 16:00: -45%       │
│  • Preporuka: Otkazi najmanje 2 termina │
│                                          │
│  [X] Zatvori, vidim šta si htela        │
└──────────────────────────────────────────┘
*/

// =====================================================
// 5. SCENARIO: KORISNICA PRESS "Ovo je hitno"
// =====================================================

/*
Ako korisnica insistira:

1. Termin se DODAJE sa warning statusom
2. AI_ANALYTICS log: "user_forced_super_biser=true"
3. Amigella hendluje sa posebnom pažnjom

Zatim se pojavljuje FOLLOW-UP modal:

┌─────────────────────────────────────────┐
│                                         │
│  Pristao sam. 💭                        │
│                                         │
│  Ali, molim te - nakon dneške           │
│  ode na odmor ili smani sa nečim        │
│  novo? Nemaš šanse da zaustavi          │
│  burnout samu energijom.                │
│                                         │
│  Šta misliš - sutra malo opuštenije?   │
│                                         │
│  [Hvala, razmisliću]  [Da, pomezi!]    │
│                                         │
└─────────────────────────────────────────┘
*/

// =====================================================
// 6. ANIMATIONS - Sentinel Shield Specifično
// =====================================================

/*
SHIELD IKONA:
- Float animation (up-down)
- Suptilne rotacije levo-desno (kao da se ljulja)
- Tempo: 3s, ease-in-out repeat

MODAL POJAVA:
- Scale: 0.8 → 1.0 (nije drastično)
- Y translation: 40px → 0px
- Cubic bezier za "elastic" osećaj
- 500ms duration

BUTTON HOVER:
- Lift effect (translateY -2px)
- Shadow effect
- Smooth transition

OVERLAY FADE:
- 0% opacity → 100% opacity
- Backdrop blur effect
- 300ms duration
*/

// =====================================================
// 7. PSYCHOLOGY BEHIND THE DESIGN
// =====================================================

/*
WHY SENTINEL SHIELD WORKS:

1. NON-AGGRESSIVE DESIGN
   - Koristi ZLATNU boju (zaštita, vrednost) - ne crvenu (danger)
   - Shield emoji je "defender", ne "attacker"
   
2. EMPATIJA
   - "Preskupilo" je empathican - razume korisnica
   - "Još jedan bi mogao biti preskupo" - ne sudim
   - "💙" emoji - sve je sa ljubavlju

3. KONKRETNI PREDLOZI
   - Predlagar "Focus blok" sa konkretnim vremenom
   - Ne samo "nemoj", već "evo šta mislim"
   
4. DVE OPCIJE
   - "Izvini, nije hitna" (korisnica se slaže sa preporukom)
   - "Ovo je hitno!" (korisnica ima autonomiju)
   - Oba su validna, ali prvi je encouraged

5. TRANSPARENCY
   - Ako korisnica insistira, Amigella logs sve (za AI learning)
   - AI impro voljno supa sa ovim terminima

6. FOLLOW-UP CARE
   - Ako korisnica doda 11. termin, dobija follow-up encouragement
   - Ne "ja sam ti rekla", već "hajde da čini nešto bolje sutra"
*/

// =====================================================
// 8. A/B TESTING VERSIONS
// =====================================================

/*
VERSION A (Current): Shield emoji, empatična
VERSION B: Gently firmer message dengan "Hvata se može nije dobro"
VERSION C: Gamified - "Imaš -5 XP za burnout risk"

Test koji raduje korisnice :)
*/
