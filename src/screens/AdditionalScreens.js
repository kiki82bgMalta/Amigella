// =====================================================
// ADDITIONAL SCREEN COMPONENTS
// CalendarListScreen, LoginScreen, SettingsScreen
// React Native Version
// =====================================================

// ======================================
// 1. CALENDAR LIST SCREEN
// ======================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
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
};

const API_URL = 'http://localhost:3000/api';

export function CalendarListScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState(null);
  const [userId] = useState('user-123');

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, filterCategory]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);

      const res = await axios.get(`${API_URL}/appointments/${userId}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      let filtered = res.data.appointments || [];
      if (filterCategory) {
        filtered = filtered.filter((a) => a.category_id === filterCategory);
      }

      setAppointments(filtered);
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće učitati termine');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    Alert.alert('Obriši termin', 'Jeste li sigurni?', [
      { text: 'Ne', onPress: () => {} },
      {
        text: 'Da',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/appointments/${appointmentId}`);
            fetchAppointments();
            Alert.alert('Uspeh', 'Termin obrisan');
          } catch (error) {
            Alert.alert('Greška', 'Nije moguće obrisati');
          }
        },
      },
    ]);
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentListItem}>
      <View style={styles.appointmentListTime}>
        <Text style={styles.appointmentListTimeText}>
          {new Date(item.start_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.appointmentListContent}>
        <Text style={styles.appointmentListTitle}>{item.title}</Text>
        {item.category_name && (
          <Text style={styles.appointmentListCategory}>
            {item.emoji} {item.category_name}
          </Text>
        )}
      </View>
      <View style={styles.appointmentListActions}>
        <TouchableOpacity
          onPress={() => {
            // Edit logic
          }}
        >
          <FontAwesome5 name="edit" size={16} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteAppointment(item.appointment_id)}
        >
          <FontAwesome5 name="trash" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.appointment_id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>Nema termina za ovaj period</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ======================================
// 2. LOGIN SCREEN
// ======================================

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        // Sačuvaj token (AsyncStorage ili SecureStore)
        // await SecureStore.setItemAsync('userToken', response.data.token);
        
        // Navigiraj na Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      Alert.alert('Greška', 'Ulogovati se nije moguće');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authHeader}>
        <Text style={styles.authTitle}>🌅 Amigella</Text>
        <Text style={styles.authSubtitle}>Pametni Kalendar</Text>
      </View>

      <View style={styles.authForm}>
        {/* EMAIL INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lozinka</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={[styles.authButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.authButtonText}>Uloguj se</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* REGISTER LINK */}
      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Nemaš račun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.authFooterLink}>Registruj se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ======================================
// 2B. REGISTER SCREEN
// ======================================

export function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
      });

      if (response.data.success) {
        Alert.alert('Uspeh', 'Konto je kreiran!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Greška', 'Registracija nije uspešna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authHeader}>
        <Text style={styles.authTitle}>🌅 Amigella</Text>
        <Text style={styles.authSubtitle}>Kreiraj račun</Text>
      </View>

      <View style={styles.authForm}>
        {/* EMAIL INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lozinka</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        {/* CONFIRM PASSWORD INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Potvrdi lozinku</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color={COLORS.textLight} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        {/* REGISTER BUTTON */}
        <TouchableOpacity
          style={[styles.authButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.authButtonText}>Registruj se</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LOGIN LINK */}
      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Već imaš račun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.authFooterLink}>Uloguj se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ======================================
// 3. SETTINGS SCREEN
// ======================================

export function SettingsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState('user-123');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories/${userId}`);
      setCategories(res.data.categories || []);
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće učitati kategorije');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* PROFILE SECTION */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Profil</Text>
        <View style={styles.settingsItem}>
          <FontAwesome5 name="user-circle" size={24} color={COLORS.primary} />
          <Text style={styles.settingsItemText}>Test Korisnik</Text>
        </View>
        <View style={styles.settingsItem}>
          <FontAwesome5
            name="envelope"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.settingsItemText}>test@example.com</Text>
        </View>
      </View>

      {/* CATEGORIES SECTION */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Kategorije</Text>
        {categories.map((category) => (
          <View key={category.category_id} style={styles.categoryItem}>
            <Text style={styles.categoryItemEmoji}>{category.emoji}</Text>
            <Text style={styles.categoryItemName}>{category.name}</Text>
            <View
              style={[
                styles.categoryColor,
                { backgroundColor: category.color },
              ]}
            />
          </View>
        ))}
      </View>

      {/* PREFERENCES */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Postavke</Text>
        <View style={styles.settingsItem}>
          <FontAwesome5 name="bell" size={20} color={COLORS.secondary} />
          <Text style={styles.settingsItemText}>Notifikacije</Text>
          <Text style={styles.settingsToggle}>Uključene</Text>
        </View>
        <View style={styles.settingsItem}>
          <FontAwesome5 name="moon" size={20} color={COLORS.accent} />
          <Text style={styles.settingsItemText}>Noćni režim</Text>
          <Text style={styles.settingsToggle}>Isključen</Text>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton}>
        <FontAwesome5 name="sign-out-alt" size={16} color={COLORS.surface} />
        <Text style={styles.logoutButtonText}>Odjavi se</Text>
      </TouchableOpacity>
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

  // CALENDAR LIST
  appointmentListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    gap: 12,
  },
  appointmentListTime: {
    alignItems: 'center',
    minWidth: 50,
  },
  appointmentListTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  appointmentListContent: {
    flex: 1,
  },
  appointmentListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  appointmentListCategory: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  appointmentListActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // AUTH SCREENS
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  authForm: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderColor: COLORS.border,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  authButton: {
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  authFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  authFooterText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  authFooterLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // SETTINGS
  settingsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  settingsToggle: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  categoryItemEmoji: {
    fontSize: 18,
  },
  categoryItemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
});

// ======================================
// PREVIEW COMPONENT (development-only)
// Omogućava brz pregled ekrana u editoru
// ======================================

export default function PreviewScreens() {
  const [screen, setScreen] = React.useState('calendar');

  const renderScreen = () => {
    switch (screen) {
      case 'calendar':
        return <CalendarListScreen navigation={{ navigate: () => {} }} />;
      case 'login':
        return <LoginScreen navigation={{ navigate: () => {}, reset: () => {} }} />;
      case 'settings':
        return <SettingsScreen navigation={{ navigate: () => {} }} />;
      default:
        return <CalendarListScreen navigation={{ navigate: () => {} }} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 12, backgroundColor: COLORS.surface }}>
        <TouchableOpacity onPress={() => setScreen('calendar')} style={{ marginRight: 12 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('login')} style={{ marginRight: 12 }}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600' }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('settings')}>
          <Text style={{ color: COLORS.accent, fontWeight: '600' }}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>{renderScreen()}</View>
    </View>
  );
}
