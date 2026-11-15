// ─────────────────────────────────────────────────────────────────
// Reusable: StatCard component
// Used across Analytics, Admin Overview, and Router screen
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accentColor?: string;
}

export function StatCard({ label, value, sub, accentColor = Colors.emerald }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  sub: {
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },
});
