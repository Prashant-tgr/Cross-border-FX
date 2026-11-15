// ─────────────────────────────────────────────────────────────────
// Screen 5: Analytics
// Migrated from: TAB 4 in page.tsx
// Key changes: stats grid uses StatCard, rail breakdown as bar chart
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAnalytics } from '../lib/api';
import type { AnalyticsSummary } from '../types/fx';
import { StatCard } from '../components/StatCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

function RailBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barCount}>{count} transfers ({pct}%)</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then((data) => { setAnalytics(data); setLoading(false); });
  }, []);

  if (loading || !analytics) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.emerald} />
      </View>
    );
  }

  const totalRails = analytics.railBreakdown.SWIFT + analytics.railBreakdown.LOCAL_RAILS + analytics.railBreakdown.FINTECH_PARTNER;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Savings & Profit Audit</Text>
      <Text style={styles.screenSub}>Cross-border remittance performance</Text>

      {/* KPI Grid */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <StatCard
            label="Total Volume Routed"
            value={`$${(analytics.totalVolumeUSD / 1_000_000).toFixed(2)}M`}
            sub={`${analytics.totalTransfers} transfers`}
            accentColor={Colors.emerald}
          />
          <StatCard
            label="Total Client Savings"
            value={`$${analytics.totalClientSavings.toLocaleString()}`}
            sub={`vs benchmark bank cost`}
            accentColor={Colors.cyan}
          />
        </View>
        <View style={styles.gridRow}>
          <StatCard
            label="Avg. Savings Rate"
            value={`${analytics.averageSavingsPercentage.toFixed(1)}%`}
            sub="vs high-street bank"
            accentColor={Colors.purple}
          />
          <StatCard
            label="Direct Fees Paid"
            value={`$${analytics.totalDirectFeesPaid.toLocaleString()}`}
            sub="wire + % fees combined"
            accentColor={Colors.amber}
          />
        </View>
      </View>

      {/* Monetization */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="wallet-outline" size={16} color={Colors.purple} />
          <Text style={styles.cardTitle}>Platform Monetization</Text>
        </View>
        <View style={styles.monRow}>
          <View style={styles.monItem}>
            <Text style={styles.monLabel}>Current Plan</Text>
            <Text style={styles.monValue}>
              {analytics.monetization.currentPlan.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.monItem}>
            <Text style={styles.monLabel}>Monthly Retainer</Text>
            <Text style={[styles.monValue, { color: Colors.purple }]}>
              ${analytics.monetization.retainerMonthly.toLocaleString()}
            </Text>
          </View>
          <View style={styles.monItem}>
            <Text style={styles.monLabel}>Profit Split Earned</Text>
            <Text style={[styles.monValue, { color: Colors.emerald }]}>
              ${analytics.monetization.totalProfitSplitEarned.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Rail Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="git-branch-outline" size={16} color={Colors.cyan} />
          <Text style={styles.cardTitle}>Rail Usage Breakdown</Text>
        </View>
        <RailBar label="Fintech Partner" count={analytics.railBreakdown.FINTECH_PARTNER} total={totalRails} color={Colors.cyan} />
        <RailBar label="Local Rails" count={analytics.railBreakdown.LOCAL_RAILS} total={totalRails} color={Colors.emerald} />
        <RailBar label="SWIFT Network" count={analytics.railBreakdown.SWIFT} total={totalRails} color={Colors.amber} />
      </View>

      {/* Benchmark Comparison */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="stats-chart-outline" size={16} color={Colors.emerald} />
          <Text style={styles.cardTitle}>vs. High-Street Bank Benchmark</Text>
        </View>
        <View style={styles.benchRow}>
          <View style={styles.benchItem}>
            <Text style={styles.benchLabel}>Benchmark Cost</Text>
            <Text style={[styles.benchValue, { color: Colors.rose }]}>
              ${analytics.totalBenchmarkCost.toLocaleString()}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={Colors.textDim} />
          <View style={styles.benchItem}>
            <Text style={styles.benchLabel}>Actual Cost</Text>
            <Text style={[styles.benchValue, { color: Colors.emerald }]}>
              ${analytics.totalDirectFeesPaid.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.savingsHighlight}>
          <Ionicons name="trending-down" size={18} color={Colors.emerald} />
          <Text style={styles.savingsHighlightText}>
            ${analytics.totalClientSavings.toLocaleString()} saved ({analytics.averageSavingsPercentage.toFixed(1)}% vs benchmark)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },

  screenTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  screenSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },

  grid: { gap: Spacing.sm, marginBottom: Spacing.md },
  gridRow: { flexDirection: 'row', gap: Spacing.sm },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },

  monRow: { flexDirection: 'row', gap: Spacing.sm },
  monItem: { flex: 1, alignItems: 'center' },
  monLabel: { fontSize: FontSize.xs, color: Colors.textDim, marginBottom: 4, textAlign: 'center' },
  monValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },

  barRow: { marginBottom: Spacing.sm },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  barCount: { fontSize: FontSize.xs, color: Colors.textDim },
  barTrack: { height: 6, backgroundColor: Colors.surfaceMid, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },

  benchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: Spacing.md },
  benchItem: { alignItems: 'center' },
  benchLabel: { fontSize: FontSize.xs, color: Colors.textDim, marginBottom: 4 },
  benchValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },

  savingsHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emeraldBg,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
  },
  savingsHighlightText: { fontSize: FontSize.sm, color: Colors.emerald, fontWeight: FontWeight.semibold },
});
