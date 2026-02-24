// =====================================================
// AMIGELLA - REACT NATIVE MOBILE APP
// Setup & Navigation
// =====================================================

/**
 * SETUP:
 * npx react-native init Amigella
 * cd Amigella
 * npm install @react-navigation/native @react-navigation/bottom-tabs
 * npm install react-native-screens react-native-safe-area-context
 * npm install react-native-gesture-handler
 * npm install axios react-native-audio-toolkit react-native-sound
 * npm install @react-native-camera/camera react-native-mm-record-audio
 * npm install react-native-svg react-native-reanimated
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// =====================================================
// SCREENS - IMPORT
// =====================================================

import JutarnjiMirScreen from './src/features/calendar/JutarnjiMirScreen';
import VoiceInputScreen from './src/screens/VoiceInputScreen';
import SentinelShieldScreen from './src/screens/SentinelShieldScreen';
import { CalendarListScreen, SettingsScreen, LoginScreen, RegisterScreen } from './src/screens/AdditionalScreens';

// =====================================================
// NAVIGATION STACK & TAB
// =====================================================

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// COLORS - AMIGELLA BRAND
const COLORS = {
  primary: '#81C784',      // Sage Green
  secondary: '#FFB74D',    // Warm Orange
  accent: '#FFD166',       // Gold
  danger: '#EF5350',       // Red
  background: '#FAFAF9',   // Off-white
  surface: '#FFFFFF',      // White
  text: '#263238',         // Dark blue-gray
  textLight: '#78909C',    // Light gray-blue
  border: '#E0E0E0',       // Light gray
};

// =====================================================
// AUTH NAVIGATOR
// =====================================================

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animationTypeForReplace: 'pop' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
    </Stack.Navigator>
  );
}

// =====================================================
// HOME TAB NAVIGATOR
// =====================================================

function HomeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'JutarnjiMir':
              iconName = 'sun';
              break;
            case 'Voice':
              iconName = 'microphone';
              break;
            case 'Calendar':
              iconName = 'calendar-alt';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            default:
              iconName = 'home';
          }

          return (
            <FontAwesome5
              name={iconName}
              size={size}
              color={color}
              solid={focused}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 5,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          borderBottomColor: COLORS.border,
          borderBottomWidth: 1,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="JutarnjiMir"
        component={JutarnjiMirScreen}
        options={{
          title: 'Jutarnji Mir',
          tabBarLabel: 'Početna',
        }}
      />

      <Tab.Screen
        name="Voice"
        component={VoiceInputScreen}
        options={{
          title: 'Govorna Unosa',
          tabBarLabel: 'Mikrofon',
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarListScreen}
        options={{
          title: 'Kalendar',
          tabBarLabel: 'Termini',
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Postavke',
          tabBarLabel: 'Postavke',
        }}
      />
    </Tab.Navigator>
  );
}

// =====================================================
// ROOT NAVIGATOR
// =====================================================

export default function Navigation() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            isLoading: false,
            isSignedIn: !!action.payload,
            userToken: action.payload,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignedIn: true,
            userToken: action.payload,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignedIn: false,
            userToken: null,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignedIn: true,
            userToken: action.payload,
          };
      }
    },
    {
      isLoading: true,
      isSignedIn: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      try {
        // Restori token iz secured storage (AsyncStorage ili SecureStore)
        // userToken = await SecureStore.getItemAsync('userToken');
        userToken = null; // Mock
      } catch (e) {
        // Ignoruj greške pri restoranju tokena
      }

      dispatch({ type: 'RESTORE_TOKEN', payload: userToken });
    };

    bootstrapAsync();
  }, []);

  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textLight }}>
          Amigella se učitava...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.isSignedIn ? <HomeTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { COLORS };
