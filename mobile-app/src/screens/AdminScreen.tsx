// ─────────────────────────────────────────────────────────────────
// Screen 6: Admin Control Center
// Migrated from: TAB 5 in page.tsx
// Security: role check enforced BEFORE any data fetch
// Non-admin users see a 403 barrier — same as web version
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchAdminOverview, fetchAdminUsers, updateAdminUserPlan } from '../lib/api';
import type { AdminOverview, AdminUser } from '../types/fx';
import { StatCard } from '../components/StatCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

function AccessDeniedScreen() {
  return (
    <View style={styles.deniedContainer}>
      <View style={styles.deniedIcon}>
        <Ionicons name="shield-outline" size={40} color={Colors.rose} />
      </View>
      <Text style={styles.deniedTitle}>403 Forbidden · Access Denied</Text>
      <Text style={styles.deniedDesc}>
        The Admin Control Center is restricted to authorized platform operators with role{' '}
        <Text style={styles.deniedCode}>admin</Text>. Please sign in with administrator credentials.
      </Text>
    </View>
  );
}

function UserRow({ user, onToggle }: { user: AdminUser; onToggle: () => void }) {
  const roleColor = user.role === 'admin' ? Colors.purple : Colors.emerald;
  return (
    <View style={styles.userRow}>
      <View style={styles.userAvatar}>
        <Text style={[styles.userAvatarText, { color: roleColor }]}>
          {user.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        <Text style={[styles.userRole, { color: roleColor }]}>
          {user.role.replace('_', ' ')} · {user.pricingPlan.replace('_', ' ')}
        </Text>
      </View>
      <Pressable
        style={[styles.toggleBtn, { borderColor: user.isActive ? Colors.emeraldBorder : Colors.roseBorder, backgroundColor: user.isActive ? Colors.emeraldBg : Colors.roseBg }]}
        onPress={onToggle}
      >
        <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: user.isActive ? Colors.emerald : Colors.rose }}>
          {user.isActive ? 'Active' : 'Paused'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function AdminScreen() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role gate — load data only if admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    Promise.all([fetchAdminOverview(), fetchAdminUsers()])
      .then(([ov, us]) => { setOverview(ov); setUsers(us); })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Hard guard — no admin, no view
  if (user?.role !== 'admin') {
    return <AccessDeniedScreen />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.purple} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.rose} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleToggleUser = (u: AdminUser) => {
    Alert.alert(
      u.isActive ? 'Pause Account' : 'Activate Account',
      `${u.isActive ? 'Pause' : 'Activate'} account for ${u.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const updated = await updateAdminUserPlan(u._id, { isActive: !u.isActive });
              setUsers((prev) => prev.map((x) => (x._id === u._id ? updated : x)));
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Update failed');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Header Badge */}
      <View style={styles.adminBanner}>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.purple} />
          <Text style={styles.adminBadgeText}>SYSTEM ADMINISTRATOR PANEL</Text>
        </View>
        <Text style={styles.adminTitle}>Platform Control</Text>
        <Text style={styles.adminSub}>Signed in as {user?.name} · {user?.email}</Text>
      </View>

      {/* Platform Overview */}
      {overview && (
        <>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <StatCard
                label="Total Revenue"
                value={`$${overview.totalPlatformRevenueUSD.toLocaleString()}`}
                sub={`$${overview.monthlyRetainerRunRate.toLocaleString()} retainers`}
                accentColor={Colors.purple}
              />
              <StatCard
                label="Total Volume"
                value={`$${(overview.totalVolumeUSD / 1_000_000).toFixed(2)}M`}
                sub={`${overview.totalTransfers} transfers`}
                accentColor={Colors.emerald}
              />
            </View>
            <View style={styles.gridRow}>
              <StatCard
                label="Enterprise Accounts"
                value={`${overview.totalUsers}`}
                sub={`${overview.retainerClientsCount} retainer · ${overview.bpsClientsCount} BPS`}
                accentColor={Colors.cyan}
              />
              <StatCard
                label="Active Corridors"
                value={`${overview.activeCorridorsCount}`}
                sub={`System: ${overview.systemHealth.status}`}
                accentColor={Colors.amber}
              />
            </View>
          </View>

          {/* System Health */}
          <View style={styles.healthCard}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="server-outline" size={14} color={Colors.emerald} />
              <Text style={styles.cardTitle}>System Health</Text>
              <View style={styles.healthDot} />
              <Text style={styles.healthStatus}>{overview.systemHealth.status}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>RAM Usage</Text>
              <Text style={styles.healthValue}>{overview.systemHealth.memoryRssMb} MB</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Uptime</Text>
              <Text style={styles.healthValue}>
                {Math.floor(overview.systemHealth.uptimeSeconds / 3600)}h {Math.floor((overview.systemHealth.uptimeSeconds % 3600) / 60)}m
              </Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Node.js</Text>
              <Text style={styles.healthValue}>{overview.systemHealth.nodeVersion}</Text>
            </View>
          </View>
        </>
      )}

      {/* User Management */}
      {users.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>User Management</Text>
          <View style={styles.usersCard}>
            {users.map((u) => (
              <UserRow key={u._id} user={u} onToggle={() => handleToggleUser(u)} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, gap: Spacing.sm },
  errorText: { fontSize: FontSize.base, color: Colors.rose, textAlign: 'center' },

  // 403 barrier
  deniedContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  deniedIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: Colors.roseBg,
    borderWidth: 1,
    borderColor: Colors.roseBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  deniedTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  deniedDesc: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  deniedCode: { fontFamily: 'monospace', color: Colors.rose },

  // Admin banner
  adminBanner: {
    backgroundColor: Colors.purpleBg,
    borderWidth: 1,
    borderColor: Colors.purpleBorder,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  adminBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.purple },
  adminTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  adminSub: { fontSize: FontSize.xs, color: Colors.textDim, marginTop: 2 },

  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textMuted, marginBottom: Spacing.sm },
  grid: { gap: Spacing.sm, marginBottom: Spacing.md },
  gridRow: { flexDirection: 'row', gap: Spacing.sm },

  healthCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1 },
  healthDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.emerald },
  healthStatus: { fontSize: FontSize.xs, color: Colors.emerald, fontWeight: FontWeight.semibold },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  healthLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  healthValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },

  usersCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  userAvatarText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  userEmail: { fontSize: FontSize.xs, color: Colors.textDim },
  userRole: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginTop: 2 },
  toggleBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
