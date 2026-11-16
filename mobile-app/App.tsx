// ─────────────────────────────────────────────────────────────────
// Cross-Border FX — Main Mobile Application Shell
// Unifies Navigation, Auth Context, Role Gating, Header & Tabs
// ─────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors, Spacing, Radius, FontSize, FontWeight } from './src/constants/theme';

import RouterScreen from './src/screens/RouterScreen';
import SpreadsScreen from './src/screens/SpreadsScreen';
import SuppliersScreen from './src/screens/SuppliersScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import AdminScreen from './src/screens/AdminScreen';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

type TabType = 'router' | 'spreads' | 'suppliers' | 'analytics' | 'admin';

interface TabConfig {
  id: TabType;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
  isSpecial?: boolean;
}

const BASE_TABS: TabConfig[] = [
  {
    id: 'router',
    label: 'Router',
    iconActive: 'swap-horizontal',
    iconInactive: 'swap-horizontal-outline',
  },
  {
    id: 'spreads',
    label: 'Spreads',
    iconActive: 'trending-down',
    iconInactive: 'trending-down-outline',
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    iconActive: 'business',
    iconInactive: 'business-outline',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    iconActive: 'stats-chart',
    iconInactive: 'stats-chart-outline',
  },
];

const ADMIN_TAB: TabConfig = {
  id: 'admin',
  label: 'Admin',
  iconActive: 'shield-checkmark',
  iconInactive: 'shield-checkmark-outline',
  isSpecial: true,
};

interface MainAppProps {
  onRequireLogin: () => void;
}

function MainApp({ onRequireLogin }: MainAppProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('router');

  // Tabs list: Admin tab is STRICTLY CONDITIONAL based on user role
  const availableTabs: TabConfig[] = [
    ...BASE_TABS,
    ...(user?.role === 'admin' ? [ADMIN_TAB] : []),
  ];

  const handleLogout = async () => {
    await logout();
    if (activeTab === 'admin') {
      setActiveTab('router');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Application Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <Ionicons name="swap-horizontal" size={20} color={Colors.text} />
          </View>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandName}>Cross-Border FX</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v2.4</Text>
              </View>
              {user?.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerTagline}>Spread Tracking & Remittance Engine</Text>
          </View>
        </View>

        {/* Auth / Profile Actions */}
        <View style={styles.headerRight}>
          {isAuthenticated ? (
            <View style={styles.userRow}>
              <View style={[styles.userAvatar, user?.role === 'admin' && styles.adminAvatar]}>
                <Ionicons
                  name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
                  size={14}
                  color={user?.role === 'admin' ? Colors.purpleLight : Colors.emeraldLight}
                />
              </View>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
                hitSlop={8}
                accessibilityLabel="Sign Out"
              >
                <Ionicons name="log-out-outline" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onRequireLogin}
              style={({ pressed }) => [styles.signInBtn, pressed && styles.pressed]}
            >
              <Ionicons name="log-in-outline" size={14} color={Colors.bg} />
              <Text style={styles.signInBtnText}>Sign In</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Screen Body */}
      <View style={styles.body}>
        {activeTab === 'router' && <RouterScreen />}
        {activeTab === 'spreads' && <SpreadsScreen />}
        {activeTab === 'suppliers' && <SuppliersScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'admin' && <AdminScreen />}
      </View>

      {/* Bottom Tab Navigation Bar */}
      <View style={styles.tabBar}>
        {availableTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = tab.isSpecial ? Colors.purpleLight : Colors.emerald;
          const inactiveColor = Colors.textDim;
          const iconName = isActive ? tab.iconActive : tab.iconInactive;

          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={({ pressed }) => [
                styles.tabItem,
                isActive && styles.tabItemActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={iconName} size={20} color={isActive ? activeColor : inactiveColor} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? activeColor : inactiveColor },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {tab.isSpecial && (
                <View style={styles.specialDot} />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [hasStartedOnboarding, setHasStartedOnboarding] = useState(false);

  // 1. Session restoration loader
  if (isLoading) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashLogo}>
          <Ionicons name="swap-horizontal" size={36} color={Colors.emerald} />
        </View>
        <ActivityIndicator size="large" color={Colors.emerald} style={{ marginTop: 24 }} />
        <Text style={styles.splashTitle}>Cross-Border FX</Text>
        <Text style={styles.splashSub}>Verifying Encrypted Session...</Text>
      </SafeAreaView>
    );
  }

  // 2. Unauthenticated users see the welcome screen before login.
  if (!isAuthenticated && !isGuestMode) {
    if (!hasStartedOnboarding) {
      return (
        <SafeAreaView style={styles.authSafeArea}>
          <StatusBar style="light" />
          <WelcomeScreen onContinue={() => setHasStartedOnboarding(true)} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.authSafeArea}>
        <StatusBar style="light" />
        <LoginScreen
          onSuccess={() => setIsGuestMode(false)}
          onClose={() => setHasStartedOnboarding(false)}
          onContinueAsGuest={() => setIsGuestMode(true)}
        />
      </SafeAreaView>
    );
  }

  // 3. User is signed in (or previewing as guest) -> Render Main Dashboard
  return <MainApp onRequireLogin={() => setIsGuestMode(false)} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  splashLogo: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  splashSub: {
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: 4,
  },
  authSafeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  versionBadge: {
    backgroundColor: Colors.emeraldBg,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
  },
  versionText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.emerald,
  },
  adminBadge: {
    backgroundColor: Colors.purpleBg,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.purpleBorder,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.purpleLight,
  },
  headerTagline: {
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatar: {
    backgroundColor: Colors.purpleBg,
    borderColor: Colors.purpleBorder,
  },
  logoutBtn: {
    padding: Spacing.xs,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emerald,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
  },
  signInBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.bg,
  },
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xs + 2,
    paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs + 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    position: 'relative',
  },
  tabItemActive: {
    // optional indicator
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  tabLabelActive: {
    fontWeight: FontWeight.bold,
  },
  specialDot: {
    position: 'absolute',
    top: 4,
    right: '25%',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.purpleLight,
  },
  pressed: {
    opacity: 0.7,
  },
});
