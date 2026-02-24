// =====================================================
// SCREEN 2: VOICE INPUT (Govorna Unosa)
// React Native Version - sa audio snimanjem
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';

const COLORS = {
  primary: '#81C784',
  secondary: '#FFB74D',
  accent: '#FFD166',
  danger: '#EF5350',
  background: '#FAFAF9',
  surface: '#FFFFFF',
  text: '#263238',
  textLight: '#78909C',
};

const API_URL = 'http://localhost:3000/api';

export default function VoiceInputScreen({ navigation }) {
  // RECORDING STATE
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPath, setAudioPath] = useState(null);

  // PROCESSING STATE
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [biseri, setBiseri] = useState([]);
  const [extractedData, setExtractedData] = useState(null);

  // ANIMATION
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [userId] = useState('user-123'); // Mock - iz auth contexta

  // AUDIO RECORDER
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const recordingInterval = useRef(null);

  // CLEANUP
  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  // =====================================================
  // RECORDING LOGIC
  // =====================================================

  const startRecording = async () => {
    try {
      const path = Platform.select({
        ios: 'amigella_recording.m4a',
        android: `${audioRecorderPlayer.DEFAULT_PATH}amigella_recording.mp4`,
      });

      const result = await audioRecorderPlayer.startRecorder(path);
      setAudioPath(result);
      setIsRecording(true);
      setRecordingTime(0);

      // Timer za vreme snimanja
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Pokreni pulsing animation
      startPulseAnimation();
    } catch (error) {
      console.error('Error starting recorder:', error);
      Alert.alert('Greška', 'Nije moguće započeti snimanje audio-a');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      clearInterval(recordingInterval.current);
      setAudioPath(result);

      // Animacija se zaustavlja
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error stopping recorder:', error);
      Alert.alert('Greška', 'Nije moguće zaustaviti snimanje');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // =====================================================
  // PROCESSING LOGIC (Gemini API)
  // =====================================================

  const processAudio = async () => {
    if (!audioPath) {
      Alert.alert('Greška', 'Nema snimljenog audio-a');
      return;
    }

    try {
      setIsProcessing(true);

      // Pročitaj audio fajl i konvertuj u base64
      const audioBlob = await fetch(`file://${audioPath}`).then((r) =>
        r.arrayBuffer()
      );

      // Kreiraj FormData za slanje
      const formData = new FormData();
      formData.append('audio', {
        uri: `file://${audioPath}`,
        type: 'audio/mp3',
        name: 'recording.mp3',
      });
      formData.append('userId', userId);

      // Pošalji na backend
      const response = await axios.post(
        `${API_URL}/voice/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Prikaži rezultate
      if (response.data.success) {
        setTranscript(response.data.transcript);
        setExtractedData(response.data.extracted);
        
        // Ekstraktuj "biseri" (ključne reči)
        const biserKeywords = extractBiseri(response.data.extracted);
        setBiseri(biserKeywords);

        // Ako je bio warning (conflict ili super biser)
        if (response.data.warning) {
          if (response.data.warning === 'super_biser') {
            navigation.navigate('SentinelModal', {
              appointmentCount: response.data.appointmentCount,
              appointmentData: response.data.extracted,
            });
          } else if (response.data.warning === 'conflict') {
            Alert.alert(
              'Konflikt termina',
              'Novi termin se sudara sa postojećim.',
              [{ text: 'OK' }]
            );
          }
        } else {
          // Uspešno kreiram termin
          Alert.alert('Uspeh', 'Termin je kreiran iz govorne unose!', [
            {
              text: 'Vidim',
              onPress: () => navigation.navigate('JutarnjiMir'),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert(
        'Greška',
        'Nije moguće obraditi audio. Pokušajte ponovo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Ekstraktuj ključne reči ("biseri")
  const extractBiseri = (data) => {
    const keywords = [];

    if (data.title) keywords.push(data.title);
    if (data.category) keywords.push(`#${data.category}`);
    if (data.priority && data.priority !== 'medium') {
      keywords.push(`! ${data.priority}`);
    }

    return keywords.filter((k) => k && k.length > 0);
  };

  // Formatuj vreme snimanja
  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (isProcessing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.processingText}>
          Obrađujem vašu govornu unos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Govorna Unosa</Text>
        <Text style={styles.headerSubtitle}>
          Recite šta trebate da uradite
        </Text>
      </View>

      {/* RECORDING SECTION */}
      <View style={styles.recordingSection}>
        {/* PULSING CIRCLE */}
        <Animated.View
          style={[
            styles.pulsingCircleOuter,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [1, 0.3],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            styles.pulsingCircleMiddle,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.6, 0],
              }),
            },
          ]}
        />

        <View style={styles.pulsingCircleInner}>
          <FontAwesome5
            name="microphone"
            size={40}
            color={COLORS.surface}
            solid
          />
        </View>

        {/* RECORDING TIME */}
        {isRecording && (
          <Text style={styles.recordingTime}>
            {formatRecordingTime(recordingTime)}
          </Text>
        )}
      </View>

      {/* RECORDING BUTTON */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <FontAwesome5
            name={isRecording ? 'stop-circle' : 'circle'}
            size={24}
            color={COLORS.surface}
            solid
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Zaustavi snimanje' : 'Počni snimanje'}
          </Text>
        </TouchableOpacity>

        {audioPath && !isRecording && (
          <TouchableOpacity
            style={styles.processButton}
            onPress={processAudio}
          >
            <FontAwesome5 name="magic" size={20} color={COLORS.surface} />
            <Text style={styles.processButtonText}>
              Obradi pomoću AI-ja
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TRANSCRIPT */}
      {transcript && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Transkript:</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      )}

      {/* BISERI (Keywords) */}
      {biseri.length > 0 && (
        <View style={styles.biserCard}>
          <Text style={styles.biserTitle}>✨ Biseri (Ključne reči):</Text>
          <View style={styles.biserContainer}>
            {biseri.map((biser, idx) => (
              <View key={idx} style={styles.biserTag}>
                <Text style={styles.biserText}>{biser}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* EXTRACTED DATA */}
      {extractedData && (
        <View style={styles.extractedCard}>
          <Text style={styles.extractedTitle}>📊 Ekstraktovani podaci:</Text>
          <View style={styles.extractedContent}>
            {extractedData.title && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Naslov:</Text>
                <Text style={styles.dataValue}>{extractedData.title}</Text>
              </View>
            )}
            {extractedData.category && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Kategorija:</Text>
                <Text style={styles.dataValue}>{extractedData.category}</Text>
              </View>
            )}
            {extractedData.priority && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Prioritet:</Text>
                <Text
                  style={[
                    styles.dataValue,
                    {
                      color:
                        extractedData.priority === 'high'
                          ? COLORS.danger
                          : COLORS.primary,
                    },
                  ]}
                >
                  {extractedData.priority}
                </Text>
              </View>
            )}
            {extractedData.duration_minutes && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Trajanje:</Text>
                <Text style={styles.dataValue}>
                  {extractedData.duration_minutes} minuta
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* INFO */}
      <View style={styles.infoSection}>
        <FontAwesome5 name="lightbulb" size={18} color={COLORS.secondary} />
        <Text style={styles.infoText}>
          Govornite termini se obrađuju AI-jem (Google Gemini) i automatski
          se dodeljuju vašem kalendaru.
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },

  // RECORDING SECTION
  recordingSection: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingCircleOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.secondary,
    opacity: 0.3,
  },
  pulsingCircleMiddle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.secondary,
    opacity: 0.2,
  },
  pulsingCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingTime: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  // BUTTONS
  buttonSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    gap: 10,
  },
  recordButtonActive: {
    backgroundColor: COLORS.danger,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    gap: 8,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },

  // RESULTS
  resultCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 4,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  transcript: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  biserCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  biserTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  biserContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  biserTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
  },
  biserText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },

  extractedCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderLeftColor: COLORS.secondary,
    borderLeftWidth: 4,
  },
  extractedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  extractedContent: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },

  // INFO
  infoSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
    lineHeight: 18,
  },

  processingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textLight,
  },
});
