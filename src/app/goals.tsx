import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, PrimaryButton, ProgressBar, SectionLabel, Stepper } from '@/components/ui';
import { useApp } from '@/lib/app-store';
import { radius, spacing, useStyles, type Theme } from '@/lib/theme';
import { completedMinutesOn, completedMinutesThisWeek, formatDuration } from '@/lib/utils';

const DAILY_STEP = 15;
const DAILY_MAX = 16 * 60;
const WEEKLY_STEP = 30;
const WEEKLY_MAX = 7 * 16 * 60;
const DAILY_PRESETS = [30, 60, 90, 120];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function GoalsScreen() {
  const router = useRouter();
  const styles = useStyles(createStyles);
  const { settings, updateSettings, plans } = useApp();

  const today = new Date();
  const dailyDone = completedMinutesOn(plans, today);
  const weeklyDone = completedMinutesThisWeek(plans, today);
  const dailyTarget = settings.dailyGoalMin;
  const weeklyTarget = settings.weeklyGoalMin;

  const journal = (
    <View style={styles.journal}>
      <Text style={styles.journalTitle}>Today</Text>
      <ProgressBar value={dailyTarget ? dailyDone / dailyTarget : 0} />
      <Text style={styles.journalText}>
        {formatDuration(dailyDone)}
        {dailyTarget ? ` of ${formatDuration(dailyTarget)}` : ' studied'} ·{' '}
        {dailyTarget && dailyDone >= dailyTarget ? 'daily goal reached 🎉' : 'in progress'}
      </Text>
      <Text style={styles.journalTitle}>This week</Text>
      <ProgressBar value={weeklyTarget ? weeklyDone / weeklyTarget : 0} />
      <Text style={styles.journalText}>
        {formatDuration(weeklyDone)}
        {weeklyTarget ? ` of ${formatDuration(weeklyTarget)}` : ' studied'}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <SectionLabel>Daily goal</SectionLabel>
        <Card>
          <Stepper
            value={dailyTarget ? formatDuration(dailyTarget) : 'No goal'}
            accessibilityLabel="daily goal"
            disabled={dailyTarget === 0}
            onDecrease={() =>
              updateSettings({ dailyGoalMin: clamp(dailyTarget - DAILY_STEP, 0, DAILY_MAX) })
            }
            onIncrease={() =>
              updateSettings({ dailyGoalMin: clamp(dailyTarget + DAILY_STEP, 0, DAILY_MAX) })
            }
          />
          <View style={styles.chipRow}>
            {DAILY_PRESETS.map((minutes) => (
              <Chip
                key={minutes}
                label={formatDuration(minutes)}
                active={dailyTarget === minutes}
                onPress={() => updateSettings({ dailyGoalMin: minutes })}
              />
            ))}
            <Chip
              label="No goal"
              active={dailyTarget === 0}
              onPress={() => updateSettings({ dailyGoalMin: 0 })}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>Weekly goal</SectionLabel>
        <Card>
          <Stepper
            value={weeklyTarget ? formatDuration(weeklyTarget) : 'No goal'}
            accessibilityLabel="weekly goal"
            disabled={weeklyTarget === 0}
            onDecrease={() =>
              updateSettings({ weeklyGoalMin: clamp(weeklyTarget - WEEKLY_STEP, 0, WEEKLY_MAX) })
            }
            onIncrease={() =>
              updateSettings({ weeklyGoalMin: clamp(weeklyTarget + WEEKLY_STEP, 0, WEEKLY_MAX) })
            }
          />
          <Chip
            label="No weekly goal"
            active={weeklyTarget === 0}
            onPress={() => updateSettings({ weeklyGoalMin: 0 })}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>Progress</SectionLabel>
        {journal}
      </View>

      <View style={styles.section}>
        <SectionLabel>Subjects</SectionLabel>
        <Card>
          <Text style={styles.cardText}>
            Give every task a subject so your goals follow the right area of study.
          </Text>
          <PrimaryButton label="Manage subjects" onPress={() => router.push('/subjects')} />
        </Card>
        <Text style={styles.note}>
          Goals count the time from tasks you marked done in this app, on a Monday-to-Sunday week.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    section: {
      gap: spacing.md,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    journal: {
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
    },
    journalTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    journalText: {
      fontSize: 14,
      color: colors.text,
    },
    cardText: {
      fontSize: 15,
      color: colors.muted,
      lineHeight: 21,
    },
    note: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 19,
    },
  });
};
