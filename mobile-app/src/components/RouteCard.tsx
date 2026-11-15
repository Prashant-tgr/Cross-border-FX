// ─────────────────────────────────────────────────────────────────
// Reusable: RouteCard component
// Displays one evaluated routing option (rail)
// Migrated from inline JSX in page.tsx routing tab
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EvaluatedRoute } from '../types/fx';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface RouteCardProps {
  route: EvaluatedRoute;
  selected: boolean;
  onSelect: () => void;
}

const RAIL_COLORS: Record<string, string> = {
  SWIFT: Colors.amber,
  LOCAL_RAILS: Colors.emerald,
  FINTECH_PARTNER: Colors.cyan,
};

const RAIL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  SWIFT: 'globe-outline',
  LOCAL_RAILS: 'train-outline',
  FINTECH_PARTNER: 'flash-outline',
};

export function RouteCard({ route, selected, onSelect }: RouteCardProps) {
  const accent = RAIL_COLORS[route.railType] ?? Colors.textMuted;
  const icon = RAIL_ICONS[route.railType] ?? 'swap-horizontal-outline';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={onSelect}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={[styles.railBadge, { backgroundColor: `${accent}20`, borderColor: `${accent}50` }]}>
          <Ionicons name={icon} size={12} color={accent} />
          <Text style={[styles.railType, { color: accent }]}>{route.railType.replace('_', ' ')}</Text>
        </View>
        {route.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={10} color={Colors.emerald} />
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}
        {selected && (
          <View style={styles.selectedDot}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.emerald} />
          </View>
        )}
      </View>

      {/* Rail Name */}
      <Text style={styles.railName}>{route.name}</Text>

      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Rate</Text>
          <Text style={styles.metricValue}>{route.exchangeRate.toFixed(4)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Spread</Text>
          <Text style={[styles.metricValue, { color: Colors.emerald }]}>{route.spreadBps} bps</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>SLA</Text>
          <Text style={styles.metricValue}>{route.estimatedHours}h</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Reliability</Text>
          <Text style={styles.metricValue}>{route.reliabilityScore}%</Text>
        </View>
      </View>

      {/* Net Landing */}
      <View style={styles.landingRow}>
        <Text style={styles.landingLabel}>Net Landing Amount</Text>
        <Text style={styles.landingValue}>
          {route.netLandingAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Savings */}
      {route.savingsAmount > 0 && (
        <View style={styles.savingsRow}>
          <Ionicons name="trending-down" size={12} color={Colors.emerald} />
          <Text style={styles.savingsText}>
            Saves ${route.savingsAmount.toLocaleString()} vs benchmark ({route.savingsPercentage}%)
          </Text>
        </View>
      )}

      {/* Badges */}
      {route.badges.length > 0 && (
        <View style={styles.badgesRow}>
          {route.badges.map((b) => (
            <View key={b} style={styles.badge}>
              <Text style={styles.badgeText}>{b.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardSelected: {
    borderColor: Colors.emeraldBorder,
    backgroundColor: 'rgba(16,185,129,0.04)',
  },
  pressed: { opacity: 0.85 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  railBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  railType: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  recommendedText: { fontSize: FontSize.xs, color: Colors.emerald, fontWeight: FontWeight.bold },
  selectedDot: { marginLeft: 'auto' },

  railName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  metricsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textDim, marginBottom: 2 },
  metricValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },

  landingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.xs,
  },
  landingLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  landingValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },

  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  savingsText: { fontSize: FontSize.xs, color: Colors.emerald },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: 2 },
  badge: {
    backgroundColor: Colors.emeraldBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.emeraldLight, fontWeight: FontWeight.bold },
});
