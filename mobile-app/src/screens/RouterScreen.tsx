// ─────────────────────────────────────────────────────────────────
// Screen 2: Remittance Router
// Migrated from: TAB 1 in page.tsx
// Key changes:
//   - HTML form + select → TextInput + modal pickers
//   - Tailwind → StyleSheet
//   - Quote rendered as FlatList of RouteCards
//   - Execute transfer triggers server API
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchRoutingQuote, fetchSuppliers, executeTransferApi } from '../lib/api';
import type { RoutingQuoteResponse, EvaluatedRoute, Supplier } from '../types/fx';
import { RouteCard } from '../components/RouteCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

type Strategy = 'LOWEST_COST' | 'FASTEST_DELIVERY' | 'MAX_RELIABILITY' | 'BALANCED';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD', 'HKD', 'AED'];
const STRATEGIES: Strategy[] = ['LOWEST_COST', 'FASTEST_DELIVERY', 'MAX_RELIABILITY', 'BALANCED'];

function StrategyLabel(s: Strategy) {
  const map: Record<Strategy, string> = {
    LOWEST_COST: '💰 Lowest Cost',
    FASTEST_DELIVERY: '⚡ Fastest',
    MAX_RELIABILITY: '🛡️ Max Reliability',
    BALANCED: '⚖️ Balanced',
  };
  return map[s];
}

export default function RouterScreen() {
  const { user, isAuthenticated } = useAuth();

  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100000');
  const [strategy, setStrategy] = useState<Strategy>('LOWEST_COST');
  const [quote, setQuote] = useState<RoutingQuoteResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<EvaluatedRoute | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-904');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quoteRefreshNotice, setQuoteRefreshNotice] = useState<string | null>(null);
  const [quoteCountdown, setQuoteCountdown] = useState<number>(120);

  // Quote countdown ticker
  useEffect(() => {
    if (quoteCountdown <= 0) return;
    const timer = setInterval(() => {
      setQuoteCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quoteCountdown]);

  // Picker modal state
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (v: string) => void;
  }>({ visible: false, title: '', options: [], onSelect: () => {} });

  const openPicker = (title: string, options: string[], onSelect: (v: string) => void) => {
    setPickerModal({ visible: true, title, options, onSelect });
  };
  const closePicker = () => setPickerModal((p) => ({ ...p, visible: false }));

  // Load suppliers
  useEffect(() => {
    fetchSuppliers().then((data) => {
      setSuppliers(data);
      if (data.length > 0) setSelectedSupplier(data[0]);
    });
  }, []);

  const getQuote = useCallback(async (isManual: boolean = false) => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || amt <= 0) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const q = await fetchRoutingQuote(sourceCurrency, targetCurrency, amt, strategy);
      setQuote(q);
      const recommended = q.routes.find((r) => r.isRecommended) ?? q.routes[0];
      if (recommended) setSelectedRoute(recommended);
      setQuoteCountdown(120);
      if (isManual) {
        setQuoteRefreshNotice(`Live rates locked at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
      }
    } finally {
      setLoading(false);
    }
  }, [sourceCurrency, targetCurrency, amount, strategy]);

  // Auto-fetch on currency/strategy change
  useEffect(() => {
    getQuote();
  }, [sourceCurrency, targetCurrency, strategy]);

  const handleExecute = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to execute a transfer.');
      return;
    }
    if (!selectedRoute || !selectedSupplier) {
      Alert.alert('Select Route', 'Please select a routing option first.');
      return;
    }

    setExecuting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await executeTransferApi({
        supplierId: selectedSupplier._id,
        invoiceNumber,
        sourceCurrency,
        sourceAmount: parseFloat(amount),
        targetCurrency,
        netLandingAmount: selectedRoute.netLandingAmount,
        routingDecision: {
          strategy,
          selectedRailId: selectedRoute.railId,
          selectedRailName: selectedRoute.name,
          selectedRailType: selectedRoute.railType,
        },
        pricingBreakdown: {
          midMarketRate: quote?.midMarketRate ?? 1.0,
          effectiveRate: selectedRoute.exchangeRate,
          spreadBps: selectedRoute.spreadBps,
          fixedFee: selectedRoute.fixedFee,
          percentageFeeAmount: selectedRoute.percentageFeeAmount,
          totalFeeSourceCurrency: selectedRoute.totalFees,
          benchmarkBankCost: selectedRoute.benchmarkBankCost,
          savedAmountSourceCurrency: selectedRoute.savingsAmount,
          profitSplitTake: selectedRoute.platformProfitSplit,
        },
        deliveryEstimateHours: selectedRoute.estimatedHours,
      });
      setSuccessMsg(
        `Dispatched ${sourceCurrency} ${parseFloat(amount).toLocaleString()} via ${selectedRoute.name}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transfer failed.';
      setErrorMsg(msg);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Remittance Router</Text>
      <Text style={styles.screenSub}>Real-time multi-rail routing optimization</Text>

      {/* Currency & Amount Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configure Transfer</Text>

        <View style={styles.row}>
          {/* From */}
          <View style={styles.halfField}>
            <Text style={styles.label}>From</Text>
            <Pressable
              style={styles.pickerBtn}
              onPress={() => openPicker('Source Currency', CURRENCIES, setSourceCurrency)}
            >
              <Text style={styles.pickerBtnText}>{sourceCurrency}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            style={styles.swapBtn}
            onPress={() => {
              const tmp = sourceCurrency;
              setSourceCurrency(targetCurrency);
              setTargetCurrency(tmp);
            }}
          >
            <Ionicons name="swap-horizontal" size={18} color={Colors.emerald} />
          </Pressable>

          {/* To */}
          <View style={styles.halfField}>
            <Text style={styles.label}>To</Text>
            <Pressable
              style={styles.pickerBtn}
              onPress={() => openPicker('Target Currency', CURRENCIES, setTargetCurrency)}
            >
              <Text style={styles.pickerBtnText}>{targetCurrency}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Amount ({sourceCurrency})</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.currencyPrefix}>{sourceCurrency}</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={() => getQuote(true)}
              placeholder="100000"
              placeholderTextColor={Colors.textDim}
            />
          </View>
        </View>

        {/* Strategy */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Routing Strategy</Text>
          <Pressable
            style={styles.pickerBtn}
            onPress={() =>
              openPicker('Strategy', STRATEGIES, (v) => setStrategy(v as Strategy))
            }
          >
            <Text style={styles.pickerBtnText}>{StrategyLabel(strategy)}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Get Quote Button */}
        <Pressable
          style={({ pressed }) => [styles.quoteBtn, pressed && styles.pressed, loading && styles.disabled]}
          onPress={() => getQuote(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.bg} size="small" />
          ) : (
            <>
              <Ionicons name="refresh" size={16} color={Colors.bg} />
              <Text style={styles.quoteBtnText}>Get Live Quotes</Text>
            </>
          )}
        </Pressable>

        {quoteRefreshNotice && (
          <View style={styles.noticeBox}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.emerald} />
            <Text style={styles.noticeText}>{quoteRefreshNotice}</Text>
          </View>
        )}
      </View>

      {/* Mid-market rate banner */}
      {quote && (
        <View style={styles.midBanner}>
          <View>
            <Text style={styles.midLabel}>Mid-Market Rate</Text>
            <Text style={styles.midValue}>
              1 {sourceCurrency} = {quote.midMarketRate.toFixed(4)} {targetCurrency}
            </Text>
          </View>
          <View style={styles.lockBadge}>
            <Ionicons name="time-outline" size={12} color={Colors.cyan} />
            <Text style={styles.lockText}>Locks in {quoteCountdown}s</Text>
          </View>
        </View>
      )}

      {/* Route Options */}
      {quote && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rails ({quote.routes.length})</Text>
          {quote.routes.map((r) => (
            <RouteCard
              key={r.railId}
              route={r}
              selected={selectedRoute?.railId === r.railId}
              onSelect={() => setSelectedRoute(r)}
            />
          ))}
        </View>
      )}

      {/* Execute Section */}
      {selectedRoute && isAuthenticated && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Execute Transfer</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Invoice Number</Text>
            <TextInput
              style={[styles.inputWrap, styles.input, { paddingHorizontal: Spacing.sm }]}
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
              placeholder="INV-2026-001"
              placeholderTextColor={Colors.textDim}
              autoCapitalize="characters"
            />
          </View>

          {suppliers.length > 0 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Recipient Supplier</Text>
              <Pressable
                style={styles.pickerBtn}
                onPress={() =>
                  openPicker(
                    'Select Supplier',
                    suppliers.map((s) => s.supplierName),
                    (name) => {
                      const found = suppliers.find((s) => s.supplierName === name);
                      if (found) setSelectedSupplier(found);
                    }
                  )
                }
              >
                <Text style={styles.pickerBtnText} numberOfLines={1}>
                  {selectedSupplier?.supplierName ?? 'Select...'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
              </Pressable>
            </View>
          )}

          {/* Success / Error */}
          {successMsg && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.emerald} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.rose} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.executeBtn, pressed && styles.pressed, executing && styles.disabled]}
            onPress={handleExecute}
            disabled={executing}
          >
            {executing ? (
              <ActivityIndicator color={Colors.text} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color={Colors.text} />
                <Text style={styles.executeBtnText}>Dispatch Remittance</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Guest prompt */}
      {selectedRoute && !isAuthenticated && (
        <View style={styles.guestBox}>
          <Ionicons name="lock-closed" size={20} color={Colors.amber} />
          <Text style={styles.guestText}>Sign in to dispatch and record transfers</Text>
        </View>
      )}

      {/* Generic Picker Modal */}
      <Modal
        visible={pickerModal.visible}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <Pressable style={styles.modalOverlay} onPress={closePicker}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{pickerModal.title}</Text>
            <FlatList
              data={pickerModal.options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
                  onPress={() => {
                    pickerModal.onSelect(item);
                    closePicker();
                  }}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
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

  screenTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  screenSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.md },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.md },

  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.md },
  halfField: { flex: 1 },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.xs, fontWeight: FontWeight.medium },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  currencyPrefix: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
    marginRight: Spacing.xs,
    fontWeight: FontWeight.semibold,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceMid,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
  },
  pickerBtnText: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium, flex: 1 },

  quoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emerald,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 2,
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  quoteBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.bg },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emeraldBg,
    borderRadius: Radius.md,
    padding: Spacing.xs + 2,
    marginTop: Spacing.sm,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
  },
  noticeText: { fontSize: FontSize.xs, color: Colors.emeraldLight, fontWeight: FontWeight.medium },

  midBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  midLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  midValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.cyan },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceMid,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  lockText: { fontSize: FontSize.xs - 1, color: Colors.cyan, fontWeight: FontWeight.semibold },

  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textMuted, marginBottom: Spacing.sm },

  executeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.purple,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 2,
  },
  executeBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  successText: { flex: 1, fontSize: FontSize.sm, color: Colors.emerald },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.roseBg,
    borderWidth: 1,
    borderColor: Colors.roseBorder,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: Colors.rose },

  guestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.amberBg,
    borderWidth: 1,
    borderColor: Colors.amberBorder,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  guestText: { fontSize: FontSize.sm, color: Colors.amber },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalOption: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  modalOptionText: { fontSize: FontSize.base, color: Colors.text },

  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
});
