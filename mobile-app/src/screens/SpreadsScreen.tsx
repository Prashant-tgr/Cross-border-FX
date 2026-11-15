// ─────────────────────────────────────────────────────────────────
// Screen 3: Spread Matrix
// Migrated from: TAB 2 in page.tsx
// Key changes:
//   - <table> → FlatList with custom header+row components
//   - <select> → bottom-sheet modal picker
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCorridors } from '../lib/api';
import type { RateFeedCorridor, RailOption } from '../types/fx';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

const RAIL_COLORS: Record<string, string> = {
  SWIFT: Colors.amber,
  LOCAL_RAILS: Colors.emerald,
  FINTECH_PARTNER: Colors.cyan,
};

function RailRow({ rail }: { rail: RailOption }) {
  const accent = RAIL_COLORS[rail.railType] ?? Colors.textMuted;
  return (
    <View style={styles.railRow}>
      <View style={styles.railRowLeft}>
        <View style={[styles.typeDot, { backgroundColor: accent }]} />
        <View>
          <Text style={styles.railName} numberOfLines={1}>{rail.name}</Text>
          <Text style={[styles.railTypeBadge, { color: accent }]}>
            {rail.railType.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <View style={styles.railRowRight}>
        <View style={styles.metric}>
          <Text style={styles.mLabel}>Spread</Text>
          <Text style={[styles.mVal, { color: Colors.emerald }]}>{rail.spreadBps} bps</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.mLabel}>Fee</Text>
          <Text style={styles.mVal}>${rail.fixedFee}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.mLabel}>SLA</Text>
          <Text style={styles.mVal}>{rail.estimatedHours}h</Text>
        </View>
        <View style={[styles.activeBadge, { backgroundColor: rail.isActive ? Colors.emeraldBg : Colors.roseBg, borderColor: rail.isActive ? Colors.emeraldBorder : Colors.roseBorder }]}>
          <Text style={[styles.activeText, { color: rail.isActive ? Colors.emerald : Colors.rose }]}>
            {rail.isActive ? 'Live' : 'Off'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function SpreadsScreen() {
  const [corridors, setCorridors] = useState<RateFeedCorridor[]>([]);
  const [selected, setSelected] = useState<string>('USD-EUR');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCorridors().then((data) => {
      setCorridors(data);
      if (data.length > 0) setSelected(data[0].corridor);
      setLoading(false);
    });
  }, []);

  const corridor = corridors.find((c) => c.corridor === selected);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.emerald} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Multi-Rail Spread Matrix</Text>
      <Text style={styles.screenSub}>Live pricing across all payment rails</Text>

      {/* Corridor Selector */}
      <Pressable style={styles.corridorBtn} onPress={() => setModalVisible(true)}>
        <View>
          <Text style={styles.corridorLabel}>Active Corridor</Text>
          <Text style={styles.corridorValue}>{selected}</Text>
        </View>
        <View style={styles.corridorRight}>
          {corridor && (
            <Text style={styles.midRate}>
              Mid: {corridor.midMarketRate.toFixed(4)}
            </Text>
          )}
          <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
        </View>
      </Pressable>

      {/* Corridor Stats */}
      {corridor && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rails Available</Text>
            <Text style={styles.statValue}>{corridor.rails.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Best Spread</Text>
            <Text style={[styles.statValue, { color: Colors.emerald }]}>
              {Math.min(...corridor.rails.map((r) => r.spreadBps))} bps
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fastest SLA</Text>
            <Text style={[styles.statValue, { color: Colors.cyan }]}>
              {Math.min(...corridor.rails.map((r) => r.estimatedHours))}h
            </Text>
          </View>
        </View>
      )}

      {/* Rail Rows */}
      {corridor && (
        <View style={styles.railsCard}>
          <Text style={styles.cardTitle}>Rail Comparison</Text>
          {corridor.rails.map((rail) => (
            <RailRow key={rail.railId} rail={rail} />
          ))}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(RAIL_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{type.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>

      {/* Corridor Picker Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select Corridor</Text>
            <FlatList
              data={corridors}
              keyExtractor={(c) => c.corridor}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}
                  onPress={() => { setSelected(item.corridor); setModalVisible(false); }}
                >
                  <Text style={styles.sheetOptionText}>{item.corridor}</Text>
                  <Text style={styles.sheetOptionSub}>Mid: {item.midMarketRate.toFixed(4)}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },

  screenTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  screenSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },

  corridorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  corridorLabel: { fontSize: FontSize.xs, color: Colors.textDim, marginBottom: 2 },
  corridorValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  corridorRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  midRate: { fontSize: FontSize.sm, color: Colors.cyan },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textDim, marginBottom: 2 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },

  railsCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.md },

  railRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  railRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  railName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, maxWidth: 140 },
  railTypeBadge: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  railRowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metric: { alignItems: 'center', minWidth: 42 },
  mLabel: { fontSize: 9, color: Colors.textDim },
  mVal: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  activeText: { fontSize: 9, fontWeight: FontWeight.bold },

  legend: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textMuted },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  sheetOption: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetOptionText: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.semibold },
  sheetOptionSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  pressed: { opacity: 0.75 },
});
