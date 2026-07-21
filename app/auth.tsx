import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../lib/theme-context';
import { authAPI } from '../lib/api';

export default function AuthScreen() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both Email and Password');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await authAPI.register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        });
        if (res.token) {
          router.replace('/(tabs)');
        }
      } else {
        const res = await authAPI.login({
          email: email.trim(),
          password: password.trim(),
        });
        if (res.token) {
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      console.log('Auth API Error:', err.message);
      setError(err.message || 'Authentication failed. Check your network or credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('akash@example.com');
    setPassword('password123');
    setError(null);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Theme Toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Brand Icon & Welcome Title */}
        <View style={styles.brandContainer}>
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="fire" size={42} color="#FFF" />
          </LinearGradient>

          <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
            Habit Tracker ⚡
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isSignUp
              ? 'Create an account to start tracking habits'
              : 'Welcome back! Log in to continue your streak'}
          </Text>
        </View>

        {/* Auth Form Card */}
        <Surface style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {isSignUp && (
            <>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
              <TextInput
                mode="outlined"
                placeholder="Akash Melan"
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.cardBorder}
                activeOutlineColor={colors.primary}
                textColor={colors.text}
                left={<TextInput.Icon icon="account-outline" color={colors.textSecondary} />}
              />
            </>
          )}

          {/* Email */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
          <TextInput
            mode="outlined"
            placeholder="example@gmail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            left={<TextInput.Icon icon="email-outline" color={colors.textSecondary} />}
          />

          {/* Password */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
          <TextInput
            mode="outlined"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            left={<TextInput.Icon icon="lock-outline" color={colors.textSecondary} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                color={colors.textSecondary}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

          {/* Main Action Button */}
          <Button
            mode="contained"
            onPress={handleAuth}
            loading={loading}
            disabled={loading}
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          >
            {isSignUp ? 'Create Free Account' : 'Sign In'}
          </Button>

          {/* Quick Demo Access Button */}
          <TouchableOpacity
            style={[styles.demoBtn, { borderColor: colors.primary }]}
            onPress={handleDemoLogin}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.primary} />
            <Text style={[styles.demoBtnText, { color: colors.primary }]}>
              Explore Demo Instantly
            </Text>
          </TouchableOpacity>

          {/* Toggle Sign In / Sign Up */}
          <TouchableOpacity
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            style={styles.switchContainer}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 54,
    paddingBottom: 40,
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  authButton: {
    borderRadius: 16,
    marginTop: 16,
    elevation: 2,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 12,
    gap: 6,
  },
  demoBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  switchContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
});