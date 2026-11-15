// ─────────────────────────────────────────────────────────────────
// Screen 1: Login / Register
// Migrated from: Auth Modal in client/src/app/page.tsx
// Changes:
//   - <div>/<form>/<input>/<button> → View/TextInput/Pressable/Text
//   - Tailwind classes → StyleSheet
//   - localStorage auth  → AuthContext (which uses SecureStore)
//   - lucide-react icons → Ionicons (@expo/vector-icons)
//   - Navigation: replace modal close → navigation.replace('(tabs)')
// ─────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

type Mode = 'login' | 'register';

interface LoginScreenProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function LoginScreen({ onSuccess, onClose }: LoginScreenProps) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'register' && (!name.trim() || !companyName.trim())) {
      setError('Full name and company name are required.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, companyName.trim());
      }
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('treasury@globaltrade.io', 'Password123!');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={Colors.textMuted} />
          </Pressable>
        )}

        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="swap-horizontal" size={28} color={Colors.text} />
          </View>
          <Text style={styles.logoTitle}>Cross-Border FX</Text>
          <Text style={styles.logoSub}>Multi-Rail Spread & Remittance Engine</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Router v2.4</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Mode Toggle */}
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
              onPress={() => { setMode('login'); setError(null); }}
            >
              <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
              onPress={() => { setMode('register'); setError(null); }}
            >
              <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>
                Register
              </Text>
            </Pressable>
          </View>

          {/* Demo Button */}
          <Pressable
            style={({ pressed }) => [styles.demoBtn, pressed && styles.pressed]}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Ionicons name="flash" size={16} color={Colors.emerald} />
            <Text style={styles.demoBtnText}>1-Click Client Sandbox (Elena Rostova)</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter credentials</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.rose} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Register-only fields */}
          {mode === 'register' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={16} color={Colors.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Elena Rostova"
                    placeholderTextColor={Colors.textDim}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Company / Organization</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="business-outline" size={16} color={Colors.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="e.g. Apex Industrial Dynamics"
                    placeholderTextColor={Colors.textDim}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            </>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Corporate Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={16} color={Colors.textDim} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="treasury@company.io"
                placeholderTextColor={Colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.textDim} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textDim}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed, loading && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'login' ? 'Sign In to Treasury' : 'Create Account'}
              </Text>
            )}
          </Pressable>

          {/* Switch mode */}
          <Pressable
            onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {mode === 'login'
                ? "Don't have an enterprise account? Register"
                : 'Already registered? Sign in'}
            </Text>
          </Pressable>
        </View>

        {/* Footer note */}
        <Text style={styles.footer}>
          Admin access requires manual credential entry.{'\n'}No 1-click admin shortcut is provided.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },

  // Header
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  logoSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xs },
  versionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
  },
  versionText: { fontSize: FontSize.xs, color: Colors.emerald, fontWeight: FontWeight.semibold },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },

  // Mode toggle
  modeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  modeBtnActive: { backgroundColor: Colors.surface },
  modeBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  modeBtnTextActive: { color: Colors.text, fontWeight: FontWeight.semibold },

  // Demo
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    backgroundColor: Colors.emeraldBg,
    marginBottom: Spacing.md,
  },
  demoBtnText: { fontSize: FontSize.sm, color: Colors.emeraldLight, fontWeight: FontWeight.semibold },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.xs, color: Colors.textDim },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.roseBg,
    borderWidth: 1,
    borderColor: Colors.roseBorder,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: Colors.rose },

  // Fields
  fieldGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  inputIcon: { marginRight: Spacing.xs },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  inputPassword: { paddingRight: 36 },
  eyeBtn: { padding: Spacing.xs, position: 'absolute', right: Spacing.sm },

  // Submit
  submitBtn: {
    backgroundColor: Colors.emerald,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md - 2,
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.bg },

  // Switch
  switchBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  switchText: { fontSize: FontSize.sm, color: Colors.textMuted },

  // States
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },

  // Footer
  footer: {
    marginTop: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    lineHeight: 18,
  },
});
