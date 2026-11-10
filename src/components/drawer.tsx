import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronIcon, CloseIcon } from '@/components/icons';
import { Toggle } from '@/components/ui';
import { useApp } from '@/lib/app-store';
import { radius, spacing, useStyles, useTheme, type Theme } from '@/lib/theme';

type DrawerContextValue = {
  open: () => void;
  close: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

const OPEN_MS = 210;
const CLOSE_MS = 170;
const EDGE_WIDTH = 22;
const SWIPE_TRIGGER = 0.32;

export function DrawerProvider({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const styles = useStyles(createStyles);
  const drawerWidth = Math.min(320, Math.round(width * 0.82));

  const [mounted, setMounted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
  }, [drawerWidth, progress]);

  const animateTo = useCallback(
    (to: number) =>
      new Promise<void>((resolve) => {
        Animated.timing(progress, {
          toValue: to,
          duration: to === 1 ? OPEN_MS : CLOSE_MS,
          easing: to === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => resolve());
      }),
    [progress],
  );

  const open = useCallback(() => {
    setMounted(true);
    void animateTo(1);
  }, [animateTo]);

  const close = useCallback(() => {
    void animateTo(0).then(() => setMounted(false));
  }, [animateTo]);

  const settle = useCallback(
    (position: number, velocity: number) => {
      const shouldOpen = velocity > 0.35 || (velocity > -0.35 && position > SWIPE_TRIGGER);
      if (shouldOpen) void animateTo(1);
      else close();
    },
    [animateTo, close],
  );

  const edgeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          gesture.dx > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => setMounted(true),
        onPanResponderMove: (_event, gesture) => {
          progress.setValue(Math.min(1, Math.max(0, gesture.dx / drawerWidth)));
        },
        onPanResponderRelease: (_event, gesture) => settle(gesture.dx / drawerWidth, gesture.vx),
        onPanResponderTerminate: () => close(),
      }),
    [close, drawerWidth, progress, settle],
  );

  const panelResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          gesture.dx < -6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_event, gesture) => {
          progress.setValue(Math.min(1, Math.max(0, 1 + gesture.dx / drawerWidth)));
        },
        onPanResponderRelease: (_event, gesture) =>
          settle(1 + gesture.dx / drawerWidth, gesture.vx),
        onPanResponderTerminate: () => void animateTo(1),
      }),
    [animateTo, drawerWidth, progress, settle],
  );

  const value = useMemo<DrawerContextValue>(() => ({ open, close }), [open, close]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  return (
    <DrawerContext.Provider value={value}>
      {children}
      {mounted ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.scrim,
              { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              style={StyleSheet.absoluteFill}
              onPress={close}
            />
          </Animated.View>
          <Animated.View
            {...panelResponder.panHandlers}
            style={[styles.panel, { width: drawerWidth, transform: [{ translateX }] }]}>
            <DrawerContent onDismiss={close} />
          </Animated.View>
        </View>
      ) : (
        <View style={styles.edge} {...edgeResponder.panHandlers} />
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawer(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used inside DrawerProvider');
  return context;
}

function DrawerContent({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, subjects } = useApp();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const go = (path: '/subjects' | '/goals' | '/notifications') => {
    onDismiss();
    router.push(path);
  };

  return (
    <View style={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.brand}>Study Flow</Text>
          <Text style={styles.tagline}>Plan your day, one topic at a time.</Text>
          <Text style={styles.credit}>By itzAarash</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          hitSlop={6}
          onPress={onDismiss}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
          <CloseIcon color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.group}>
        <View style={styles.groupRow}>
          <View style={styles.groupText}>
            <Text style={styles.groupLabel}>Dark mode</Text>
            <Text style={styles.groupHint}>
              {settings.darkMode ? 'Using the dark theme' : 'Using the light theme'}
            </Text>
          </View>
          <Toggle
            accessibilityLabel="Dark mode"
            value={settings.darkMode}
            onChange={(next) => updateSettings({ darkMode: next })}
          />
        </View>
      </View>

      <View style={styles.group}>
        <DrawerRow
          label="Manage subjects"
          hint={
            subjects.length === 0
              ? 'No subjects yet'
              : `${subjects.length} subject${subjects.length === 1 ? '' : 's'}`
          }
          onPress={() => go('/subjects')}
        />
        <View style={styles.divider} />
        <DrawerRow
          label="Add goals"
          hint="Daily and weekly study targets"
          onPress={() => go('/goals')}
        />
        <View style={styles.divider} />
        <DrawerRow
          label="Notification management"
          hint="Reminders and weekly summary"
          onPress={() => go('/notifications')}
        />
      </View>

      <Text style={styles.footNote}>Swipe from the left edge to open this menu any time.</Text>
    </View>
  );
}

function DrawerRow({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.groupText}>
        <Text style={styles.groupLabel}>{label}</Text>
        <Text style={styles.groupHint}>{hint}</Text>
      </View>
      <ChevronIcon color={colors.muted} />
    </Pressable>
  );
}

const createStyles = (theme: Theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    edge: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: EDGE_WIDTH,
    },
    scrim: {
      backgroundColor: 'rgba(8, 10, 16, 0.45)',
    },
    panel: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.bg,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 18,
      shadowOffset: { width: 6, height: 0 },
      elevation: 12,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.xl,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    headText: {
      flex: 1,
      gap: spacing.xs,
    },
    brand: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    tagline: {
      fontSize: 13,
      color: colors.muted,
    },
    credit: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
      color: colors.primary,
    },
    closeButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    group: {
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
    },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 64,
    },
    groupText: {
      flex: 1,
      gap: spacing.xs,
    },
    groupLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    groupHint: {
      fontSize: 13,
      color: colors.muted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 64,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    footNote: {
      fontSize: 12,
      color: colors.muted,
      lineHeight: 18,
    },
    pressed: {
      opacity: 0.7,
    },
  });
};
