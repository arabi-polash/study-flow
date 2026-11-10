import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar, TopBar } from '@/components/top-bar';
import { ProgressBar } from '@/components/ui';
import { useApp, type Plan } from '@/lib/app-store';
import { radius, spacing, useStyles, type Theme } from '@/lib/theme';
import {
  comparePlans,
  dayKey,
  formatDuration,
  formatLongDate,
  isPlanScheduledOn,
  planMatchesQuery,
  planMinutes,
  repeatLabel,
  scheduleLabel,
} from '@/lib/utils';

type ConfirmFn = (message: string) => boolean;

function askToDelete(title: string, onConfirm: () => void) {
  const message = `Remove "${title}" from your plans?`;
  if (Platform.OS === 'web') {
    const webConfirm = (globalThis as { confirm?: ConfirmFn }).confirm;
    if (!webConfirm || webConfirm(message)) onConfirm();
    return;
  }
  Alert.alert('Delete task', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function TodayScreen() {
  const router = useRouter();
  const styles = useStyles(createStyles);
  const { plans, subjects, removePlan, toggleDone } = useApp();

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const today = new Date();
  const todayKey = dayKey(today);

  const subjectOf = (plan: Plan) => subjects.find((subject) => subject.id === plan.subjectId);

  const todayPlans = useMemo(
    () =>
      plans
        .filter((plan) => isPlanScheduledOn(plan, today))
        .filter((plan) => planMatchesQuery(plan, subjectOf(plan)?.name ?? '', query))
        .sort(comparePlans),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plans, subjects, todayKey, query],
  );

  const allToday = plans.filter((plan) => isPlanScheduledOn(plan, today));
  const finished = allToday.filter((plan) => plan.history[todayKey]).length;
  const plannedMinutes = allToday.reduce((total, plan) => total + planMinutes(plan), 0);

  const closeSearch = () => {
    setSearching(false);
    setQuery('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {searching ? (
        <SearchBar query={query} onChangeQuery={setQuery} onClose={closeSearch} />
      ) : (
        <TopBar title="Today" subtitle={formatLongDate(today)} onSearch={() => setSearching(true)} />
      )}

      <View style={styles.header}>
        {allToday.length > 0 && (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.summary}>
                {searching
                  ? `${todayPlans.length} of ${allToday.length} match`
                  : `Planned for today · ${formatDuration(plannedMinutes)}`}
              </Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>
                  {finished}/{allToday.length} done
                </Text>
              </View>
            </View>
            <ProgressBar value={finished / allToday.length} />
          </>
        )}
      </View>

      <FlatList
        data={todayPlans}
        keyExtractor={(plan) => plan.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {searching ? 'Nothing matched' : 'No study plans yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searching
                ? 'Try another subject, topic or plan name.'
                : 'Tap the + button to add a subject and the topics you want to cover.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          todayPlans.length > 0 ? (
            <Text style={styles.hint}>Tap a plan to mark it done · Hold to delete</Text>
          ) : undefined
        }
        renderItem={({ item }) => {
          const subject = subjectOf(item);
          return (
            <PlanCard
              plan={item}
              date={todayKey}
              subjectName={subject?.name ?? ''}
              subjectColor={subject?.color}
              onPress={() => toggleDone(item.id, todayKey)}
              onLongPress={() => askToDelete(item.title, () => removePlan(item.id))}
            />
          );
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a study task"
        onPress={() => router.push('/add')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function PlanCard({
  plan,
  date,
  subjectName,
  subjectColor,
  onPress,
  onLongPress,
}: {
  plan: Plan;
  date: string;
  subjectName: string;
  subjectColor?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const styles = useStyles(createStyles);
  const done = Boolean(plan.history && plan.history[date]);
  const topics = Array.isArray(plan.topics) ? plan.topics : [];
  const topicText = topics.filter((t) => typeof t === 'string' && t.trim()).join(' · ');

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${plan.title}, ${scheduleLabel(plan)}, ${repeatLabel(plan)}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.check, done && styles.checkDone]}>
        {done && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          {subjectColor ? <View style={[styles.dot, { backgroundColor: subjectColor }]} /> : null}
          <Text style={[styles.cardTitle, done && styles.cardTitleDone]} numberOfLines={2}>
            {plan.title}
          </Text>
        </View>
        <Text style={styles.cardMeta}>
          {subjectName ? `${subjectName} · ` : ''}
          {scheduleLabel(plan)} · {repeatLabel(plan)}
        </Text>
        {topicText.length > 0 ? (
          <Text style={styles.cardTopics} numberOfLines={2}>
            {topicText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (theme: Theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    summary: {
      flex: 1,
      fontSize: 13,
      color: colors.muted,
    },
    pill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      backgroundColor: colors.successSoft,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.success,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl * 3,
      flexGrow: 1,
    },
    separator: {
      height: spacing.md,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardPressed: {
      opacity: 0.9,
    },
    check: {
      width: 26,
      height: 26,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: colors.disabled,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkDone: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    checkMark: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    cardBody: {
      flex: 1,
      gap: spacing.xs,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
    },
    cardTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    cardTitleDone: {
      color: colors.muted,
      textDecorationLine: 'line-through',
    },
    cardMeta: {
      fontSize: 13,
      color: colors.muted,
    },
    cardTopics: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl * 2,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    emptyText: {
      fontSize: 15,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 22,
    },
    hint: {
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    fab: {
      position: 'absolute',
      right: spacing.xl,
      bottom: spacing.xl,
      width: 60,
      height: 60,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    fabPressed: {
      opacity: 0.9,
    },
    fabLabel: {
      color: colors.onPrimary,
      fontSize: 32,
      lineHeight: 36,
      fontWeight: '400',
    },
  });
};
