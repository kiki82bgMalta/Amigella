// =====================================================
// AMIGELLA - UI/UX DESIGN SPECIFICATIONS
// Screen 2: Voice Interaction Mode - Govorna unosa
// =====================================================

/**
 * DESIGN PHILOSOPHY:
 * - Centralni pulsiras magličasti krug (waveform effect)
 * - Minimalist, all focus on voice
 * - Real-time transcription
 * - Reči se pretvaraju u "Bisere" - vizuelni prikaz
 * - Emocija: Sloboda, fluidnost, intuitivnost
 */

// =====================================================
// 1. BOJA PALET - Voice Mode (Warmer)
// =====================================================

const VOICE_COLORS = {
  // Tone je malo topliji - voice je koreografija
  primary: '#FFB74D',           // Warm orange - voice energy
  accent: '#FF8A65',            // Deeper orange
  
  // Bisere
  biser_color: '#FDD835',       // Golden - treasure
  biser_shadow: '#FFB300',
  
  // Neutral
  bg_dark: '#1A1A1A',           // Dark background for focus
  text_light: '#F5F5F5',
  gray: '#B0B0B0',
  
  // Waveform
  waveform_outer: '#FFB74D40',
  waveform_middle: '#FFB74D60',
  waveform_inner: '#FFB74D',
};

// =====================================================
// 2. BISERE - Što su "Bisere"?
// =====================================================

/**
 * BISER = Jedna ključna reč iz govora
 * 
 * Primer:
 * Korisnica kaže: "Sutra sa 14 do 15 meetup sa Ninom u kafiću"
 * 
 * BISERI koji se pronašli:
 * 🔸 "sutra" (VREME)
 * 🔸 "14 do 15" (VREMENSKI RASPON)
 * 🔸 "meetup" (AKTIVNOST)
 * 🔸 "Nina" (OSOBA)
 * 🔸 "kafiću" (LOKACIJA)
 * 
 * Svaki biser je animiran gde se pojavljuje na ekranu,
 * a onda se konsoliduje u strukturirani termin.
 */

// =====================================================
// 3. LAYOUT STRUKTURA - Voice Mode
// =====================================================

/**
 * HEADER (minimal, time)
 * ┌─────────────────────────────────────────┐
 * │  🔙        Govorna unosa        ⬇️      │
 * │  (back)                         (save)  │
 * └─────────────────────────────────────────┘
 *
 * CENTRAL WAVEFORM CIRCLE (pulsiras)
 * ┌─────────────────────────────────────────┐
 * │                                         │
 * │          ╭─────────────╮               │
 * │         ╱     ┌───┐     ╲              │
 * │        ╱   ·  │ 🎤 │  ·   ╲             │
 * │       │   ··  └───┘  ··   │             │
 * │       │  ·· ╭─────────╮ ··  │            │
 * │       │  ·· │  SLUŠA  │ ··  │            │
 * │        ╲  ·· ╰─────────╯ ·· ╱            │
 * │         ╲    ·········   ╱             │
 * │          ╰─────────────────╯             │
 * │       ^        ^        ^               │  (Pulsats 60-80 BPM)
 * │                                         │
 * └─────────────────────────────────────────┘
 *
 * TRANSCRIPT (live)
 * ┌─────────────────────────────────────────┐
 * │  Sutra sa 14 do 15 meetup sa Ninom |    │  (typing effect)
 * └─────────────────────────────────────────┘
 *
 * BISERI (kao žetoni koji se pojavljuju)
 * ┌─────────────────────────────────────────┐
 * │  🔸 sutra   🔸 14-15   🔸 meetup  🔸 Nina │
 * │                         🔸 kafiću         │
 * │                                         │
 * │ [Potvrdi termine]                       │
 * └─────────────────────────────────────────┘
 *
 * BOTTOM (action buttons)
 * ┌─────────────────────────────────────────┐
 * │  [Ponovi]        [Zaustavi]             │
 * └─────────────────────────────────────────┘
 */

// =====================================================
// 4. REACT KOMPONENTA - VOICE INTERACTION MODE
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Styled Components

const VoiceContainer = styled.div`
  background: linear-gradient(135deg, ${VOICE_COLORS.bg_dark} 0%, #0F0F0F 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  color: ${VOICE_COLORS.text_light};
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`;

const VoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${VOICE_COLORS.gray}20;
  
  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: ${VOICE_COLORS.text_light};
    transition: opacity 0.3s;
    
    &:hover {
      opacity: 0.7;
    }
  }
  
  .title {
    font-size: 18px;
    font-weight: 500;
    color: ${VOICE_COLORS.text_light};
  }
`;

// CENTRALNI PULSIRAS KRUG - SRCE VOICE MODE-a
const WaveformContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
`;

const PulsingCircle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    ${VOICE_COLORS.primary}30 0%,
    ${VOICE_COLORS.accent}10 50%,
    transparent 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  /* Outer ring - pulsats */
  &::before {
    content: '';
    position: absolute;
    width: 240px;
    height: 240px;
    border: 2px solid ${VOICE_COLORS.waveform_outer};
    border-radius: 50%;
    animation: pulse-ring-outer 2s ease-out infinite;
  }
  
  /* Middle ring */
  &::after {
    content: '';
    position: absolute;
    width: 220px;
    height: 220px;
    border: 1px solid ${VOICE_COLORS.waveform_middle};
    border-radius: 50%;
    animation: pulse-ring-middle 2s ease-out infinite 0.3s;
  }
  
  @keyframes pulse-ring-outer {
    0% {
      width: 240px;
      height: 240px;
      opacity: 1;
    }
    100% {
      width: 320px;
      height: 320px;
      opacity: 0;
    }
  }
  
  @keyframes pulse-ring-middle {
    0% {
      width: 220px;
      height: 220px;
      opacity: 1;
    }
    100% {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
`;

const MicrophoneIcon = styled.div`
  font-size: 64px;
  z-index: 10;
  animation: float-voice 3s ease-in-out infinite;
  
  @keyframes float-voice {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
`;

const ListeningText = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 14px;
  color: ${VOICE_COLORS.gray};
  animation: blink 1.5s ease-in-out infinite;
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// TRANSCRIPT SEKCIJA
const TranscriptSection = styled.div`
  padding: 0 20px 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
`;

const TranscriptBox = styled.div`
  width: 100%;
  padding: 16px;
  background: ${VOICE_COLORS.bg_dark}80;
  border: 1px solid ${VOICE_COLORS.primary}40;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  color: ${VOICE_COLORS.text_light};
  min-height: 60px;
  display: flex;
  align-items: center;
  
  .cursor {
    width: 2px;
    height: 20px;
    background: ${VOICE_COLORS.primary};
    margin-left: 4px;
    animation: cursor-blink 1s step-end infinite;
  }
  
  @keyframes cursor-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
`;

// BISERI SEKCIJA
const BiserContainer = styled.div`
  padding: 24px 20px;
  
  .label {
    font-size: 12px;
    color: ${VOICE_COLORS.gray};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    opacity: 0.7;
  }
`;

const BiserGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const Biser = styled.div`
  background: linear-gradient(135deg, ${VOICE_COLORS.biser_color} 0%, ${VOICE_COLORS.accent} 100%);
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: biser-appear 0.5s ease-out;
  box-shadow: 0 4px 12px ${VOICE_COLORS.biser_shadow}40;
  
  .type-icon {
    font-size: 12px;
  }
  
  @keyframes biser-appear {
    0% {
      transform: scale(0.5) translateY(10px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  
  /* Različiti tipovi bisera */
  &.time { --color: #42A5F5; }
  &.location { --color: #66BB6A; }
  &.person { --color: #AB47BC; }
  &.activity { --color: #FF7043; }
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, ${VOICE_COLORS.primary} 0%, ${VOICE_COLORS.accent} 100%);
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${VOICE_COLORS.primary}40;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ACTION BUTTONS
const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 20px 24px;
  
  button {
    padding: 12px;
    background: ${VOICE_COLORS.bg_dark}40;
    border: 1px solid ${VOICE_COLORS.gray}40;
    color: ${VOICE_COLORS.text_light};
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: ${VOICE_COLORS.primary};
      color: ${VOICE_COLORS.primary};
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
`;

// KOMPONENTA
export default function VoiceInteractionMode() {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [biseri, setBiseri] = useState([]);
  const inputRef = useRef('');
  
  useEffect(() => {
    // Simulacija live transcription
    if (!isListening) return;
    
    // Mock data - simulate typing
    const mockSpeech = "Sutra sa 14 do 15 meetup sa Ninom u kafiću";
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < mockSpeech.length) {
        setTranscript(mockSpeech.substring(0, index + 1));
        
        // Simulacija pronalaženja bisera
        const word = mockSpeech.substring(0, index + 1).split(' ').pop();
        checkForBiser(word);
        
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 80); // brzina tipanja
    
    return () => clearInterval(typeInterval);
  }, [isListening]);
  
  const checkForBiser = (word) => {
    // Jednostavna detekcija ključnih reči
    const keywordMap = {
      'sutra': { type: 'time', icon: '📅' },
      '14': { type: 'time', icon: '⏰' },
      'do': { type: 'time', icon: '🕐' },
      '15': { type: 'time', icon: '⏰' },
      'meetup': { type: 'activity', icon: '💬' },
      'sa': { type: 'person', icon: '👤' },
      'Ninom': { type: 'person', icon: '👤' },
      'kafiću': { type: 'location', icon: '☕' },
    };
    
    if (keywordMap[word] && !biseri.find(b => b.text === word)) {
      const newBiser = {
        id: Math.random(),
        text: word,
        type: keywordMap[word].type,
        icon: keywordMap[word].icon,
      };
      setBiseri(prev => [...prev, newBiser]);
    }
  };
  
  const handleConfirm = () => {
    // Pretvori bisere u appointment
    console.log('Confirming appointment from biseri:', biseri);
    alert('Termin sačuvan! Biseri su postali termin.');
  };
  
  const handleStop = () => {
    setIsListening(false);
  };
  
  const handleRetry = () => {
    setTranscript('');
    setBiseri([]);
    setIsListening(true);
  };
  
  return (
    <VoiceContainer>
      <VoiceHeader>
        <button>🔙</button>
        <div className="title">Govorna unosa</div>
        <button>⬇️</button>
      </VoiceHeader>
      
      <WaveformContainer>
        <PulsingCircle>
          <MicrophoneIcon>🎤</MicrophoneIcon>
          <ListeningText>
            {isListening ? 'SLUŠA...' : 'Gotovo'}
          </ListeningText>
        </PulsingCircle>
      </WaveformContainer>
      
      <TranscriptSection>
        <TranscriptBox>
          {transcript}
          {isListening && <span className="cursor"></span>}
        </TranscriptBox>
      </TranscriptSection>
      
      <BiserContainer>
        <div className="label">🔸 Pronađeni elementi</div>
        <BiserGrid>
          {biseri.map(biser => (
            <Biser key={biser.id} className={biser.type}>
              <span className="type-icon">{biser.icon}</span>
              <span>{biser.text}</span>
            </Biser>
          ))}
        </BiserGrid>
        
        {biseri.length > 0 && (
          <ConfirmButton onClick={handleConfirm} disabled={!isListening}>
            ✓ Potvrdi termin iz bisera
          </ConfirmButton>
        )}
      </BiserContainer>
      
      <ActionButtons>
        <button onClick={handleRetry}>🔄 Ponovi</button>
        <button onClick={handleStop}>⏹️ Zaustavi</button>
      </ActionButtons>
    </VoiceContainer>
  );
}

// =====================================================
// 5. ANIMACIJA - Detaljnije
// =====================================================

/*
PULSIRING EFFECT (magličasti krug):
- Tri koncentrična kruga
- Spoljni krug: Inicijatori sa 0% opacity, završava sa 100% opacity
- Srednji krug: Počinje malo kasnije (staggered animation)
- Tempo: ~2 sekunde (kao normalno disanje)

BISER ANIMACIJA:
- Scale: 0.5 → 1.0
- Y-translation: 10px → 0px
- Opacity: 0 → 1
- Ukupno vreme: 500ms ease-out
- Delay: Svaki sledeći biser +50ms

TRANSCRIPT:
- Tipaju se reči u realnom vremenu
- Cursor bleaks sa 1s ciklus
*/

// =====================================================
// 6. AUDIO PROCESSING (Backend Integration)
// =====================================================

/*
API FLOW:
1. Capture audio → blob
2. POST /api/voice/transcribe (send blob)
3. Google Gemini Speech-to-Text API
4. Return: {
     transcript: "Sutra sa 14 do 15 meetup sa Ninom",
     confidence: 0.95,
     biseri: [
       { text: "sutra", type: "time", confidence: 0.99 },
       { text: "14", type: "time", confidence: 0.98 },
       ...
     ]
   }
5. Render biseri na UI
6. User potvrduje ili edituje
7. POST /api/appointments/create (send parsed data)
8. Appointment je sačuvan!
*/
