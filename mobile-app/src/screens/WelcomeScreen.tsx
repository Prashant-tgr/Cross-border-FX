import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const SLIDES = [
  {
    eyebrow: 'SMARTER ROUTING',
    title: 'Every route, side by side.',
    description: 'Compare SWIFT, local and fintech options in one place.',
    icon: 'git-compare-outline' as const,
  },
  {
    eyebrow: 'YOUR PRIORITIES',
    title: 'Choose what matters most.',
    description: 'Balance cost, delivery speed and reliability for each transfer.',
    icon: 'options-outline' as const,
  },
  {
    eyebrow: 'TREASURY CONTROL',
    title: 'From quote to record.',
    description: 'Keep supplier payments and transfer activity easy to follow.',
    icon: 'shield-checkmark-outline' as const,
  },
];

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, SLIDES.length - 1));
    setActiveIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
  };

  const renderIllustration = (index: number) => {
    if (index === 0) {
      return (
        <View style={styles.routeIllustration}>
          <View style={styles.currencyCard}>
            <Text style={styles.currencyCode}>USD</Text>
            <Text style={styles.currencyCaption}>Send</Text>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
            <Ionicons name="arrow-forward" size={18} color={Colors.emeraldLight} />
          </View>
          <View style={styles.currencyCard}>
            <Text style={styles.currencyCode}>EUR</Text>
            <Text style={styles.currencyCaption}>Deliver</Text>
          </View>
        </View>
      );
    }

    if (index === 1) {
      return (
        <View style={styles.optionsIllustration}>
          {[
            { icon: 'trending-down-outline' as const, label: 'Lowest cost' },
            { icon: 'time-outline' as const, label: 'Fast delivery' },
            { icon: 'shield-checkmark-outline' as const, label: 'More reliable' },
          ].map((option, optionIndex) => (
            <View
              key={option.label}
              style={[styles.optionRow, optionIndex === 0 && styles.optionRowSelected]}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={optionIndex === 0 ? Colors.emeraldLight : Colors.textMuted}
              />
              <Text style={[styles.optionLabel, optionIndex === 0 && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              {optionIndex === 0 && (
                <Ionicons name="checkmark-circle" size={17} color={Colors.emeraldLight} />
              )}
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.controlIllustration}>
        <View style={styles.shieldCircle}>
          <Ionicons name="shield-checkmark" size={52} color={Colors.emeraldLight} />
        </View>
        <View style={styles.recordPills}>
          <View style={styles.recordPill}>
            <Ionicons name="checkmark" size={13} color={Colors.emeraldLight} />
            <Text style={styles.recordText}>Quote</Text>
          </View>
          <View style={styles.recordPill}>
            <Ionicons name="checkmark" size={13} color={Colors.emeraldLight} />
            <Text style={styles.recordText}>Route</Text>
          </View>
          <View style={styles.recordPill}>
            <Ionicons name="checkmark" size={13} color={Colors.emeraldLight} />
            <Text style={styles.recordText}>Record</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Ionicons name="swap-horizontal" size={21} color={Colors.emeraldLight} />
          </View>
          <Text style={styles.brandName}>Cross-Border FX</Text>
        </View>
        <Text style={styles.stepCount}>{`0${activeIndex + 1} / 0${SLIDES.length}`}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={styles.deck}
        contentContainerStyle={styles.deckContent}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(Math.max(0, Math.min(index, SLIDES.length - 1)));
        }}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.eyebrow} style={[styles.slide, { width }]}>
            <View style={[styles.artboard, { height: height < 700 ? 210 : 250 }]}>
              <View style={styles.artGlow} />
              <View style={styles.artIcon}>
                <Ionicons name={slide.icon} size={23} color={Colors.emeraldLight} />
              </View>
              {renderIllustration(index)}
            </View>
            <View style={styles.copy}>
              <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
              <Text style={[styles.title, height < 700 && styles.titleCompact]}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((slide, index) => (
            <Pressable
              key={slide.eyebrow}
              onPress={() => goToSlide(index)}
              hitSlop={10}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${index + 1}`}
            />
          ))}
        </View>

        <View style={styles.navigation}>
          <Pressable
            onPress={() => goToSlide(activeIndex - 1)}
            disabled={activeIndex === 0}
            style={({ pressed }) => [
              styles.backButton,
              activeIndex === 0 && styles.backButtonDisabled,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </Pressable>

          {activeIndex === SLIDES.length - 1 ? (
            <Pressable
              onPress={onContinue}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Continue to sign in"
            >
              <Text style={styles.startButtonText}>Get started</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => goToSlide(activeIndex + 1)}
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Next slide"
            >
              <Ionicons name="arrow-forward" size={20} color={Colors.bg} />
            </Pressable>
          )}
        </View>
        <Text style={styles.footerNote}>
          {activeIndex === SLIDES.length - 1
            ? 'Sign in or create your treasury account'
            : 'Swipe or tap the arrow to continue'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.emeraldBg,
    borderWidth: 1,
    borderColor: Colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  stepCount: { color: Colors.textDim, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  deck: { flex: 1 },
  deckContent: { flexGrow: 1 },
  slide: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  artboard: {
    height: 270,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  artGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldBg,
  },
  artIcon: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeIllustration: { flexDirection: 'row', alignItems: 'center' },
  currencyCard: {
    width: 92,
    height: 92,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyCode: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  currencyCaption: { color: Colors.textDim, fontSize: FontSize.xs, marginTop: Spacing.xs },
  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    marginHorizontal: Spacing.sm,
  },
  routeLine: { flex: 1, height: 1, backgroundColor: Colors.emeraldBorder },
  optionsIllustration: {
    width: '78%',
    gap: Spacing.sm,
  },
  optionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMid,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: { borderColor: Colors.emeraldBorder, backgroundColor: Colors.emeraldBg },
  optionLabel: { flex: 1, color: Colors.textMuted, fontSize: FontSize.sm },
  optionLabelSelected: { color: Colors.text, fontWeight: FontWeight.semibold },
  controlIllustration: { alignItems: 'center' },
  shieldCircle: {
    width: 112,
    height: 112,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  recordPills: { flexDirection: 'row', gap: Spacing.xs },
  recordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.emeraldBg,
  },
  recordText: { color: Colors.emeraldLight, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  copy: { alignItems: 'center', paddingHorizontal: Spacing.sm },
  eyebrow: {
    color: Colors.emeraldLight,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  title: {
    maxWidth: 340,
    color: Colors.text,
    fontSize: 30,
    lineHeight: 37,
    textAlign: 'center',
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  titleCompact: { fontSize: 27, lineHeight: 33 },
  description: {
    maxWidth: 320,
    color: Colors.textMuted,
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, alignItems: 'center' },
  pagination: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  dot: { width: 7, height: 7, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  dotActive: { width: 22, backgroundColor: Colors.emerald },
  navigation: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonDisabled: { opacity: 0.35 },
  nextButton: {
    width: 52,
    height: 52,
    marginLeft: 'auto',
    borderRadius: Radius.md,
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.emerald,
  },
  startButtonText: { color: Colors.bg, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  footerNote: { color: Colors.textDim, fontSize: FontSize.xs, marginTop: Spacing.sm },
  pressed: { opacity: 0.75 },
});
