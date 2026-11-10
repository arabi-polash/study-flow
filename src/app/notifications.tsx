import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, SectionLabel, SettingRow, Stepper, Toggle } from '@/components/ui';
import { useApp } from '@/lib/app-store';
import { spacing, useStyles, type Theme } from '@/lib/theme';
import { formatClock } from '@/lib/utils';

const TIME_STEP = 15;
const LEAD_OPTIONS = [5, 10, 15, 30];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function NotificationsScreen() {
  const styles = useStyles(createStyles);
  const { settings, updateNotifications } = useApp();
  const { dailyReminder, dailyReminderAt, remindBeforeFixedTime, leadMinutes, weeklySummary } =
    settings.notifications;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <SectionLabel>Daily reminder</SectionLabel>
        <Card>
          <SettingRow
            label="Remind me to study"
            hint="A nudge at the same time every day"
            right={
              <Toggle
                accessibilityLabel="Daily reminder"
                value={dailyReminder}
                onChange={(next) => updateNotifications({ dailyReminder: next })}
              />
            }
          />
          {dailyReminder ? (
            <Stepper
              value={formatClock(dailyReminderAt)}
              accessibilityLabel="reminder time"
              onDecrease={() =>
                updateNotifications({
                  dailyReminderAt: clamp(dailyReminderAt - TIME_STEP, 0, 24 * 60 - TIME_STEP),
                })
              }
              onIncrease={() =>
                updateNotifications({
                  dailyReminderAt: clamp(dailyReminderAt + TIME_STEP, 0, 24 * 60 - TIME_STEP),
                })
              }
            />
          ) : null}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>Fixed-time tasks</SectionLabel>
        <Card>
          <SettingRow
            label="Remind me before a task"
            hint="Only for tasks with a fixed start time"
            right={
              <Toggle
                accessibilityLabel="Remind before fixed time tasks"
                value={remindBeforeFixedTime}
                onChange={(next) => updateNotifications({ remindBeforeFixedTime: next })}
              />
            }
          />
          {remindBeforeFixedTime ? (
            <View style={styles.chipRow}>
              {LEAD_OPTIONS.map((minutes) => (
                <Chip
                  key={minutes}
                  label={`${minutes} min before`}
                  active={leadMinutes === minutes}
                  onPress={() => updateNotifications({ leadMinutes: minutes })}
                />
              ))}
            </View>
          ) : null}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>Weekly summary</SectionLabel>
        <Card>
          <SettingRow
            label="Send a weekly recap"
            hint="How much you studied and what you finished"
            right={
              <Toggle
                accessibilityLabel="Weekly summary"
                value={weeklySummary}
                onChange={(next) => updateNotifications({ weeklySummary: next })}
              />
            }
          />
        </Card>
      </View>

      <Text style={styles.note}>
        These choices are stored with your plans. Scheduling the actual system notifications is not
        wired up in this prototype yet.
      </Text>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.bg,
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
    note: {
      fontSize: 13,
      color: theme.colors.muted,
      lineHeight: 19,
    },
  });
