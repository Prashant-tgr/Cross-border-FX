// ─────────────────────────────────────────────────────────────────
// Screen 4: Suppliers
// Migrated from: TAB 3 in page.tsx
// Key changes: FlatList replaces <ul>/<li>, cards instead of table
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchSuppliers } from '../lib/api';
import type { Supplier } from '../types/fx';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

const STRATEGY_COLORS: Record<string, string> = {
  LOWEST_COST: Colors.emerald,
  FASTEST_DELIVERY: Colors.cyan,
  MAX_RELIABILITY: Colors.purple,
};
const STRATEGY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  LOWEST_COST: 'trending-down-outline',
  FASTEST_DELIVERY: 'flash-outline',
  MAX_RELIABILITY: 'shield-checkmark-outline',
};

function SupplierCard({ item }: { item: Supplier }) {
  const stratColor = STRATEGY_COLORS[item.preferredRoutingStrategy] ?? Colors.textMuted;
  const stratIcon = STRATEGY_ICONS[item.preferredRoutingStrategy] ?? 'help-circle-outline';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.supplierName.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.supplierName} numberOfLines={1}>{item.supplierName}</Text>
          <Text style={styles.country}>
            <Ionicons name="location-outline" size={12} color={Colors.textDim} /> {item.country} · {item.settlementCurrency}
          </Text>
        </View>
        <View style={[styles.stratBadge, { borderColor: stratColor, backgroundColor: `${stratColor}15` }]}>
          <Ionicons name={stratIcon} size={12} color={stratColor} />
        </View>
      </View>

      {/* Bank Details */}
      <View style={styles.row}>
        <Ionicons name="business-outline" size={13} color={Colors.textDim} />
        <Text style={styles.detail}>{item.bankName}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="card-outline" size={13} color={Colors.textDim} />
        <Text style={styles.detail} numberOfLines={1}>{item.accountNumberOrIban}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="code-outline" size={13} color={Colors.textDim} />
        <Text style={styles.detail}>{item.swiftBicOrRouting}</Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.volume}>
          ${(item.totalDisbursedAmount / 1_000_000).toFixed(2)}M disbursed
        </Text>
      </View>
    </View>
  );
}

export default function SuppliersScreen() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers().then((data) => { setSuppliers(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.emerald} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.container}
      data={suppliers}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Commercial Suppliers</Text>
          <Text style={styles.screenSub}>{suppliers.length} registered counterparties</Text>
        </View>
      }
      renderItem={({ item }) => <SupplierCard item={item} />}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={48} color={Colors.textDim} />
          <Text style={styles.emptyText}>No suppliers found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },

  header: { marginBottom: Spacing.md },
  screenTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  screenSub: { fontSize: FontSize.sm, color: Colors.textMuted },

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.emerald },
  cardInfo: { flex: 1 },
  supplierName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  country: { fontSize: FontSize.xs, color: Colors.textDim, marginTop: 2 },
  stratBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  detail: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  categoryChip: {
    backgroundColor: Colors.cyanBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryText: { fontSize: FontSize.xs, color: Colors.cyan, fontWeight: FontWeight.semibold },
  volume: { fontSize: FontSize.xs, color: Colors.textMuted },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSize.base, color: Colors.textDim, marginTop: Spacing.sm },
});
