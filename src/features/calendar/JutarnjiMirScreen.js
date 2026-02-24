// =====================================================
// SCREEN 1: JUTARNJI MIR (Morning Dashboard)
// React Native Version
// =====================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
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
  border: '#E0E0E0',
};

const { width } = Dimensions.get('window');
const API_URL = 'http://localhost:3000/api';

export default function JutarnjiMirScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [superBiserStatus, setSuperBiserStatus] = useState(null);
  const [userId] = useState('user-123'); // Mock - trebao bi iz auth contexta

  // Učitaj termine
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Uzmi termine za dan
      const appointmentsRes = await axios.get(
        `${API_URL}/appointments/${userId}/today`
      );

      // Proverite Super Biser status
      const today = new Date().toISOString().split('T')[0];
      const sentinelRes = await axios.post(
        `${API_URL}/sentinel/check`,
        { userId, date: today }
      );

      setAppointments(appointmentsRes.data.appointments || []);
      setSuperBiserStatus(sentinelRes.data);

      // Ako je Super Biser, pokaži Sentinel Shield modal
      if (sentinelRes.data.isSuperBiser) {
        navigation.navigate('SentinelModal', {
          appointmentCount: sentinelRes.data.appointmentCount,
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // Formatator vremena
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('sr-RS', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Priority boja
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return COLORS.danger;
      case 'high':
        return COLORS.secondary;
      case 'medium':
        return COLORS.primary;
      default:
        return COLORS.textLight;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Dobro jutro! 🌅</Text>
        <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
      </View>

      {/* SUPER BISER STATUS */}
      {superBiserStatus && (
        <View
          style={[
            styles.statusCard,
            {
              borderLeftColor: superBiserStatus.isSuperBiser
                ? COLORS.danger
                : COLORS.primary,
            },
          ]}
        >
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              Termini trenutno: {superBiserStatus.appointmentCount}
            </Text>
            <Text style={styles.statusValue}>
              {superBiserStatus.isSuperBiser
                ? `⚠️ Preskupilo! Još ${10 - superBiserStatus.appointmentCount} termina do maksimuma`
                : `Slobodno još ${superBiserStatus.remainingSlots} termina`}
            </Text>
          </View>
        </View>
      )}

      {/* QUICK ACTIONS */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Brze akcije</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Voice')}
          >
            <FontAwesome5
              name="microphone"
              size={24}
              color={COLORS.secondary}
              solid
            />
            <Text style={styles.actionLabel}>Govorna unosa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <FontAwesome5 name="plus-circle" size={24} color={COLORS.primary} />
            <Text style={styles.actionLabel}>Novi termin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <FontAwesome5 name="sliders-h" size={24} color={COLORS.accent} />
            <Text style={styles.actionLabel}>Kategorije</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TODAY'S APPOINTMENTS */}
      <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>Termini za dan</Text>

        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="calendar-check" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Nema termina za dan</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Voice')}
            >
              <Text style={styles.emptyButtonText}>Dodaj prvi termin</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.appointment_id} style={styles.appointmentCard}>
              {/* TIME */}
              <View style={styles.timeSection}>
                <Text style={styles.appointmentTime}>
                  {formatTime(appointment.start_time)}
                </Text>
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(appointment.priority) },
                  ]}
                />
              </View>

              {/* CONTENT */}
              <View style={styles.appointmentContent}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                {appointment.category_name && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryEmoji}>
                      {appointment.emoji || '📌'}
                    </Text>
                    <Text style={styles.categoryName}>
                      {appointment.category_name}
                    </Text>
                  </View>
                )}
                {appointment.description && (
                  <Text style={styles.appointmentDesc}>
                    {appointment.description}
                  </Text>
                )}
              </View>

              {/* DURATION */}
              <View style={styles.durationSection}>
                <FontAwesome5 name="clock" size={14} color={COLORS.textLight} />
                <Text style={styles.durationText}>
                  {appointment.duration_minutes}m
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* FOOTER SPACING */}
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
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },

  // STATUS CARD
  statusCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // QUICK ACTIONS
  quickActionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },

  // APPOINTMENTS SECTION
  appointmentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // EMPTY STATE
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginVertical: 16,
    fontWeight: '500',
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 14,
  },

  // APPOINTMENT CARD
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeSection: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 60,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 2,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  appointmentDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  durationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
});
