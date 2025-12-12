/**
 * Pantalla de Login - Rediseñada basada en HTML prototype
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error) {
      Alert.alert(
        'Error de autenticación',
        error instanceof Error ? error.message : 'Credenciales inválidas'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const textPrimary = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const textSecondary = isDark ? colors.text.secondary.dark : colors.text.secondary.light;
  const inputBg = isDark ? '#1c2630' : '#ffffff';
  const borderColor = isDark ? colors.border.dark : colors.border.light;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Driver Portal</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={[styles.helpText, { color: colors.primary }]}>Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacing} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo / Icon Area */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: `${colors.primary}20` }]}>
              <MaterialIcons name="local-shipping" size={40} color={colors.primary} />
            </View>
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: textPrimary }]}>Welcome Back</Text>

          {/* Subheadline */}
          <Text style={[styles.subheadline, { color: textSecondary }]}>
            Sign in to manage your deliveries
          </Text>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textPrimary }]}>Username or Email</Text>
              <View style={[styles.inputContainer, { borderColor: borderColor, backgroundColor: inputBg }]}>
                <MaterialIcons
                  name="mail"
                  size={20}
                  color={textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: textPrimary }]}
                  placeholder="driver@delivery.com"
                  placeholderTextColor={textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textPrimary }]}>Password</Text>
              <View style={[styles.inputContainer, { borderColor: borderColor, backgroundColor: inputBg }]}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { borderColor: borderColor }]} />
            <Text style={[styles.dividerText, { color: textSecondary, backgroundColor: bgColor }]}>
              Or continue with
            </Text>
          </View>

          {/* Social Login / Biometric Alternative */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { borderColor: borderColor, backgroundColor: inputBg }]}>
              <MaterialIcons name="fingerprint" size={20} color={textPrimary} />
              <Text style={[styles.socialButtonText, { color: textPrimary }]}>Face ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: borderColor, backgroundColor: inputBg }]}>
              <MaterialIcons name="qr-code-scanner" size={20} color={textPrimary} />
              <Text style={[styles.socialButtonText, { color: textPrimary }]}>Scan Badge</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacing: {
    height: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    marginTop: 40,
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  dividerText: {
    paddingHorizontal: 24,
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
