import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useStyles, type Theme } from '@/lib/theme';

export function SectionLabel({ children }: { children: string }) {
  const styles = useStyles(createStyles);
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles(createStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({
  value,
  onDecrease,
  onIncrease,
  disabled,
  accessibilityLabel,
}: {
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ? `Less ${accessibilityLabel}` : 'Less'}
        hitSlop={4}
        onPress={onDecrease}
        style={[styles.stepButton, disabled && styles.stepButtonDisabled]}>
        <Text style={styles.stepSymbol}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ? `More ${accessibilityLabel}` : 'More'}
        hitSlop={4}
        onPress={onIncrease}
        style={styles.stepButton}>
        <Text style={styles.stepSymbol}>+</Text>
      </Pressable>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const styles = useStyles(createStyles);
  const width = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` as const;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

export function PrimaryButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

export function Toggle({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel: string;
}) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
    </Pressable>
  );
}

export function SettingRow({
  label,
  hint,
  right,
}: {
  label: string;
  hint?: string;
  right?: ReactNode;
}) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {hint ? <Text style={styles.settingHint}>{hint}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const createStyles = (theme: Theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.pill,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 15,
      color: colors.muted,
      fontWeight: '500',
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    stepButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepButtonDisabled: {
      backgroundColor: colors.border,
    },
    stepSymbol: {
      fontSize: 22,
      lineHeight: 26,
      color: colors.primary,
      fontWeight: '600',
    },
    stepValue: {
      flex: 1,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    track: {
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radius.pill,
      backgroundColor: colors.success,
    },
    primaryButton: {
      height: 54,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontSize: 17,
      fontWeight: '600',
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      minHeight: 44,
    },
    settingText: {
      flex: 1,
      gap: spacing.xs,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    settingHint: {
      fontSize: 13,
      color: colors.muted,
    },
    toggle: {
      width: 52,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: colors.border,
      padding: 3,
      justifyContent: 'center',
    },
    toggleOn: {
      backgroundColor: colors.primary,
    },
    toggleKnob: {
      width: 26,
      height: 26,
      borderRadius: radius.pill,
      backgroundColor: colors.card,
    },
    toggleKnobOn: {
      backgroundColor: '#FFFFFF',
      transform: [{ translateX: 20 }],
    },
    pressed: {
      opacity: 0.7,
    },
  });
};
