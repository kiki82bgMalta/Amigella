// =====================================================
// SCREEN 3: SENTINEL SHIELD MODAL
// Burnout Prevention Alert
// React Native Version
// =====================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
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

export default function SentinelShieldScreen({ route, navigation }) {
  const { appointmentCount, appointmentData } = route.params || {
    appointmentCount: 10,
    appointmentData: null,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [shieldAnim] = useState(new Animated.Value(0));
  const [userId] = useState('user-123'); // Mock - iz auth contexta

  // Animacija za shield
  useEffect(() => {
    Animated.sequence([
      Animated.timing(shieldAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(shieldAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(shieldAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const shieldScale = shieldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const shieldOpacity = shieldAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  // DECLINE - Ne dodaj termin
  const handleDecline = async () => {
    try {
      setIsLoading(true);
      // Log u database
      await axios.post(`${API_URL}/sentinel/decline`, {
        userId,
        appointmentData,
        appointmentCount,
      });

      // Nazad na početnu
      navigation.goBack();
    } catch (error) {
      console.error('Error declining:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // FORCE ADD - Dodaj i upozori
  const handleForceAdd = async () => {
    try {
      setIsLoading(true);

      // Kreiraj termin sa "force" flagom
      const response = await axios.post(`${API_URL}/sentinel/force-add`, {
        userId,
        appointmentData,
      });

      // Prikaži potvrdu
      navigation.goBack();
      // Emit event ili redirect na JutarnjiMir
    } catch (error) {
      console.error('Error forcing add:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingSlots = Math.max(0, 10 - appointmentCount);

  return (
    <View style={styles.container}>
      {/* SEMI-TRANSPARENT OVERLAY */}
      <View style={styles.overlay} />

      {/* MODAL CARD */}
      <Animated.View
        style={[
          styles.modalCard,
          {
            transform: [{ scale: shieldScale }],
            opacity: shieldOpacity,
          },
        ]}
      >
        {/* SHIELD ICON */}
        <View style={styles.shieldContainer}>
          <View style={styles.shieldIconOuter}>
            <FontAwesome5
              name="shield-alt"
              size={60}
              color={COLORS.surface}
              solid
            />
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.modalTitle}>Sentinel Shield 🛡️</Text>

        {/* MESSAGE */}
        <Text style={styles.modalSubtitle}>
          Otkrio sam da ste već zakazali {appointmentCount} termina za ovaj dan.
        </Text>

        {/* APPOINTMENT COUNT DISPLAY */}
        <View style={styles.counterSection}>
          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>Trenutni termini:</Text>
            <Text style={styles.counterValue}>{appointmentCount}</Text>
          </View>

          <View style={styles.arrowContainer}>
            <FontAwesome5
              name="arrow-right"
              size={20}
              color={COLORS.textLight}
            />
          </View>

          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>Maksimum:</Text>
            <Text style={styles.counterValue}>10</Text>
          </View>
        </View>

        {/* WARNING MESSAGE */}
        <View style={styles.warningCard}>
          <FontAwesome5
            name="exclamation-triangle"
            size={18}
            color={COLORS.danger}
          />
          <Text style={styles.warningText}>
            Previše obveza može dovesti do iscrpljenosti. Preporučujem vam da
            odmorite.
          </Text>
        </View>

        {/* AI RECOMMENDATION */}
        {remainingSlots <= 0 && (
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>💡 Preporuka:</Text>
            <Text style={styles.recommendationText}>
               Day je konačno popunjeno. Razmislite o izmenama postojećih
              termina ili premještanju na drugi dan.
            </Text>
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View style={styles.buttonSection}>
          {/* DECLINE BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.declineButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleDecline}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <>
                <FontAwesome5
                  name="times-circle"
                  size={18}
                  color={COLORS.text}
                />
                <Text style={styles.declineButtonText}>Izvini, nije hitna</Text>
              </>
            )}
          </TouchableOpacity>

          {/* FORCE ADD BUTTON */}
          {remainingSlots > 0 && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.forceButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleForceAdd}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.surface} size="small" />
              ) : (
                <>
                  <FontAwesome5 name="check-circle" size={18} color={COLORS.surface} />
                  <Text style={styles.forceButtonText}>Ovo Je Hitno!</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* SNOOZE / RESCHEDULE BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.snoozeButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={() => {
              // Ponudi da pomakne termin
              navigation.goBack();
            }}
            disabled={isLoading}
          >
            <FontAwesome5 name="clock" size={18} color={COLORS.textLight} />
            <Text style={styles.snoozeButtonText}>Pomakni na drugi dan</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER NOTE */}
        <Text style={styles.footerNote}>
          Sentinel Shield čuva vaše zdravlje mentalno. Malo rada, više brige o
          sebi.
        </Text>
      </Animated.View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // MODAL CARD
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },

  // SHIELD ICON
  shieldContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  // TEXT
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  // COUNTER SECTION
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '100%',
  },
  counterBox: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  counterValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  arrowContainer: {
    marginHorizontal: 8,
  },

  // WARNING CARD
  warningCard: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    borderRadius: 10,
    marginBottom: 12,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },

  // RECOMMENDATION CARD
  recommendationCard: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 209, 102, 0.1)',
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
  },

  // BUTTONS
  buttonSection: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  declineButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 2,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  forceButton: {
    backgroundColor: COLORS.danger,
  },
  forceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
  snoozeButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  snoozeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // FOOTER
  footerNote: {
    marginTopVertical: 16,
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
