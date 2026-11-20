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
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { requestPasswordResetApi, resetPasswordApi } from '../lib/api';

const RESEND_CODE_COOLDOWN_SECONDS = 60;

type Mode = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface LoginScreenProps {
  onSuccess?: () => void;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
}

export default function LoginScreen({ onSuccess, onClose, onContinueAsGuest }: LoginScreenProps) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (resendCountdown === 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSubmit = async () => {
    setError(null);
    setNotice(null);

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
      } else if (mode === 'register') {
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

  const handleRequestPasswordReset = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Enter your corporate email to receive a verification code.');
      return;
    }

    setLoading(true);
    try {
      const message = await requestPasswordResetApi(email.trim());
      setMode('reset-password');
      setResendCountdown(RESEND_CODE_COOLDOWN_SECONDS);
      setNotice(message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (loading || isResendingCode || resendCountdown > 0) return;

    setError(null);
    setNotice(null);
    setIsResendingCode(true);
    try {
      const message = await requestPasswordResetApi(email.trim());
      setNotice(message);
      setResendCountdown(RESEND_CODE_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to resend the verification code.');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setNotice(null);
    if (!otp.trim() || !newPassword.trim()) {
      setError('Enter the verification code and your new password.');
      return;
    }

    setLoading(true);
    try {
      const message = await resetPasswordApi(email.trim(), otp.trim(), newPassword);
      setMode('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setShowNewPassword(false);
      setNotice(message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to reset your password.');
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
          {(mode === 'login' || mode === 'register') && (
            <View style={styles.modeRow}>
              <Pressable
                style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
                onPress={() => { setMode('login'); setError(null); setNotice(null); }}
              >
                <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
                onPress={() => { setMode('register'); setError(null); setNotice(null); }}
              >
                <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>
                  Register
                </Text>
              </Pressable>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.rose} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {notice && (
            <View style={styles.noticeBox}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.emeraldLight} />
              <Text style={styles.noticeText}>{notice}</Text>
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
                editable={mode !== 'reset-password'}
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
          {(mode === 'login' || mode === 'register') && (
            <>
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword((visible) => !visible)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>
              {mode === 'login' && (
                <Pressable
                  onPress={() => { setMode('forgot-password'); setError(null); setNotice(null); }}
                  style={styles.forgotBtn}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              )}
            </>
          )}

          {mode === 'reset-password' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email verification code</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="key-outline" size={16} color={Colors.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    placeholderTextColor={Colors.textDim}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
                <Text style={styles.helperText}>
                  If you don’t see the code, check your Spam, Junk, or Promotions folder.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loading || isResendingCode || resendCountdown > 0 }}
                  onPress={handleResendCode}
                  disabled={loading || isResendingCode || resendCountdown > 0}
                  style={({ pressed }) => [
                    styles.resendBtn,
                    pressed && styles.pressed,
                    (loading || isResendingCode || resendCountdown > 0) && styles.disabled,
                  ]}
                >
                  <Text style={styles.resendText}>
                    {isResendingCode
                      ? 'Sending...'
                      : resendCountdown > 0
                        ? `Resend code in ${resendCountdown}s`
                        : 'Resend code'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>New password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={16} color={Colors.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPassword]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Colors.textDim}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showNewPassword ? 'Hide new password' : 'Show new password'}
                    onPress={() => setShowNewPassword((visible) => !visible)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed, loading && styles.disabled]}
            onPress={
              mode === 'forgot-password'
                ? handleRequestPasswordReset
                : mode === 'reset-password'
                  ? handleResetPassword
                  : handleSubmit
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'login'
                  ? 'Sign In to Treasury'
                  : mode === 'register'
                    ? 'Create Account'
                    : mode === 'forgot-password'
                      ? 'Send verification code'
                      : 'Reset password'}
              </Text>
            )}
          </Pressable>

          {/* Switch mode */}
          {(mode === 'login' || mode === 'register') ? (
            <Pressable
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setNotice(null);
              }}
              style={styles.switchBtn}
            >
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? "Don't have an enterprise account? Register"
                  : 'Already registered? Sign in'}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => { setMode('login'); setError(null); setNotice(null); }}
              style={styles.switchBtn}
            >
              <Text style={styles.switchText}>Back to sign in</Text>
            </Pressable>
          )}
        </View>

        {/* Guest access option */}
        {onContinueAsGuest && (mode === 'login' || mode === 'register') && (
          <Pressable
            onPress={onContinueAsGuest}
            style={({ pressed }) => [styles.guestLinkBtn, pressed && styles.pressed]}
          >
            <Text style={styles.guestLinkText}>Preview Dashboard as Guest →</Text>
          </Pressable>
        )}

        {/* Footer note */}
        <Text style={styles.footer}>
          Admin access requires manual credential entry.
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
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noticeText: { flex: 1, fontSize: FontSize.sm, color: Colors.emeraldLight },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -Spacing.sm, marginBottom: Spacing.sm, paddingVertical: Spacing.xs },
  forgotText: { fontSize: FontSize.sm, color: Colors.emeraldLight, fontWeight: FontWeight.semibold },
  helperText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs },
  resendBtn: { alignSelf: 'flex-start', paddingVertical: Spacing.xs, marginTop: Spacing.xs },
  resendText: { fontSize: FontSize.sm, color: Colors.emeraldLight, fontWeight: FontWeight.semibold },

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

  // Guest Link
  guestLinkBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  guestLinkText: {
    fontSize: FontSize.sm,
    color: Colors.emeraldLight,
    fontWeight: FontWeight.semibold,
  },

  // Footer
  footer: {
    marginTop: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    lineHeight: 18,
  },
});
