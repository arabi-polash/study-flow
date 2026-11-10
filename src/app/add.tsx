import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronIcon, CloseIcon } from '@/components/icons';
import { Chip, PrimaryButton, SectionLabel, Stepper } from '@/components/ui';
import { useApp, type RepeatMode, type ScheduleMode } from '@/lib/app-store';
import { radius, spacing, useStyles, useTheme, type Theme } from '@/lib/theme';
import { DAY_LETTERS, DAY_NAMES, dayKey, formatClock, formatDays, formatDuration } from '@/lib/utils';

const DURATION_PRESETS = [30, 60, 90, 120];
const DURATION_STEP = 15;
const MIN_DURATION = 15;
const MAX_DURATION = 720;
const TIME_STEP = 15;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function AddPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const { addPlan, subjects, addSubject } = useApp();

  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const [topics, setTopics] = useState<string[]>([]);
  const [topicDraft, setTopicDraft] = useState('');

  const [repeat, setRepeat] = useState<RepeatMode>('once');
  const [days, setDays] = useState<number[]>([]);
  const [mode, setMode] = useState<ScheduleMode>('duration');
  const [durationMin, setDurationMin] = useState(60);
  const [startMin, setStartMin] = useState(17 * 60);
  const [endMin, setEndMin] = useState(18 * 60);

  const subject = subjects.find((item) => item.id === subjectId);
  const canSave = true; // Always allow saving, will use default title if needed

  const toggleDay = (day: number) =>
    setDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));

  const createSubject = () => {
    const name = newSubject.trim();
    if (!name) return;
    const id = addSubject(name);
    setNewSubject('');
    setSubjectId(id);
    setSubjectOpen(false);
  };

  const addTopic = () => {
    const value = topicDraft.trim();
    if (!value) return;
    setTopics((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setTopicDraft('');
  };

  const shiftStart = (delta: number) => {
    const next = clamp(startMin + delta, 0, 24 * 60 - TIME_STEP);
    setStartMin(next);
    if (endMin <= next) setEndMin(Math.min(24 * 60, next + 60));
  };

  const shiftEnd = (delta: number) => setEndMin(clamp(endMin + delta, startMin + TIME_STEP, 24 * 60));

  const scheduleText =
    mode === 'duration'
      ? formatDuration(durationMin)
      : `${formatClock(startMin)} – ${formatClock(endMin)}`;

  const repeatText =
    repeat === 'once'
      ? 'Today only'
      : repeat === 'daily'
        ? 'Every day'
        : formatDays(days) || 'Pick days';

  const save = () => {
    if (!canSave) return;
    addPlan({
      title: subject?.name ?? topics[0] ?? 'Study Session',
      subjectId: subjectId ?? undefined,
      topics,
      mode,
      durationMin: mode === 'duration' ? durationMin : undefined,
      startMin: mode === 'time' ? startMin : undefined,
      endMin: mode === 'time' ? endMin : undefined,
      repeat,
      days: repeat === 'days' ? days : [],
      dateKey: dayKey(new Date()),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionLabel>Subject</SectionLabel>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose a subject"
            onPress={() => setSubjectOpen((prev) => !prev)}
            style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
            {subject ? <View style={[styles.dot, { backgroundColor: subject.color }]} /> : null}
            <Text style={[styles.selectLabel, !subject && styles.selectPlaceholder]}>
              {subject ? subject.name : 'What subject do you want to learn?'}
            </Text>
            <ChevronIcon color={colors.muted} direction={subjectOpen ? 'down' : 'right'} />
          </Pressable>

          {subjectOpen ? (
            <View style={styles.panel}>
              {subjects.length === 0 ? (
                <Text style={styles.panelHint}>
                  No subjects yet — type one below and tap Add.
                </Text>
              ) : (
                <View style={styles.subjectList}>
                  {subjects.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      onPress={() => {
                        setSubjectId(item.id);
                        setSubjectOpen(false);
                      }}
                      style={({ pressed }) => [styles.subjectRow, pressed && styles.pressed]}>
                      <View style={[styles.dot, { backgroundColor: item.color }]} />
                      <Text style={styles.subjectName}>{item.name}</Text>
                      {subjectId === item.id ? <Text style={styles.tick}>✓</Text> : null}
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.newSubjectRow}>
                <TextInput
                  value={newSubject}
                  onChangeText={setNewSubject}
                  placeholder="Add a new subject"
                  placeholderTextColor={colors.muted}
                  style={styles.newSubjectInput}
                  maxLength={40}
                  returnKeyType="done"
                  onSubmitEditing={createSubject}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add subject"
                  onPress={createSubject}
                  style={({ pressed }) => [
                    styles.addSubject,
                    newSubject.trim().length === 0 && styles.addSubjectDisabled,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.addSubjectLabel}>Add</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionLabel>Topics or chapters to cover</SectionLabel>
          <View style={styles.topicRow}>
            <TextInput
              value={topicDraft}
              onChangeText={setTopicDraft}
              placeholder="e.g. Chapter 3 — Kinematics"
              placeholderTextColor={colors.muted}
              style={styles.topicInput}
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={addTopic}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add topic"
              onPress={addTopic}
              style={({ pressed }) => [
                styles.addTopic,
                topicDraft.trim().length === 0 && styles.addSubjectDisabled,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.addTopicLabel}>+</Text>
            </Pressable>
          </View>

          {topics.length === 0 ? (
            <Text style={styles.panelHint}>
              Add as many topics as you plan to cover. Press return after each one.
            </Text>
          ) : (
            <View style={styles.topicList}>
              {topics.map((topic, index) => (
                <View key={topic} style={styles.topicItem}>
                  <View style={styles.topicIndex}>
                    <Text style={styles.topicIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.topicText}>{topic}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${topic}`}
                    hitSlop={8}
                    onPress={() => setTopics((prev) => prev.filter((item) => item !== topic))}
                    style={({ pressed }) => [styles.topicRemove, pressed && styles.pressed]}>
                    <CloseIcon color={colors.muted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionLabel>Repeat</SectionLabel>
          <View style={styles.chipRow}>
            <Chip label="Today only" active={repeat === 'once'} onPress={() => setRepeat('once')} />
            <Chip label="Every day" active={repeat === 'daily'} onPress={() => setRepeat('daily')} />
            <Chip label="Pick days" active={repeat === 'days'} onPress={() => setRepeat('days')} />
          </View>

          {repeat === 'days' && (
            <View style={styles.chipRow}>
              {DAY_LETTERS.map((letter, index) => (
                <Chip
                  key={DAY_NAMES[index]}
                  label={letter}
                  active={days.includes(index)}
                  onPress={() => toggleDay(index)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionLabel>How should it be scheduled?</SectionLabel>
          <View style={styles.chipRow}>
            <Chip
              label="Hours to spend"
              active={mode === 'duration'}
              onPress={() => setMode('duration')}
            />
            <Chip label="Fixed time" active={mode === 'time'} onPress={() => setMode('time')} />
          </View>

          {mode === 'duration' ? (
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Time you want to spend</Text>
              <Stepper
                value={formatDuration(durationMin)}
                accessibilityLabel="study time"
                disabled={durationMin <= MIN_DURATION}
                onDecrease={() =>
                  setDurationMin((prev) => clamp(prev - DURATION_STEP, MIN_DURATION, MAX_DURATION))
                }
                onIncrease={() =>
                  setDurationMin((prev) => clamp(prev + DURATION_STEP, MIN_DURATION, MAX_DURATION))
                }
              />
              <View style={styles.chipRow}>
                {DURATION_PRESETS.map((minutes) => (
                  <Chip
                    key={minutes}
                    label={formatDuration(minutes)}
                    active={durationMin === minutes}
                    onPress={() => setDurationMin(minutes)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>From</Text>
              <Stepper
                value={formatClock(startMin)}
                accessibilityLabel="start time"
                onDecrease={() => shiftStart(-TIME_STEP)}
                onIncrease={() => shiftStart(TIME_STEP)}
              />
              <Text style={styles.panelLabel}>Until</Text>
              <Stepper
                value={formatClock(endMin)}
                accessibilityLabel="end time"
                disabled={endMin <= startMin + TIME_STEP}
                onDecrease={() => shiftEnd(-TIME_STEP)}
                onIncrease={() => shiftEnd(TIME_STEP)}
              />
            </View>
          )}
        </View>

        {canSave ? (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Your plan</Text>
            <Text style={styles.previewText}>
              {subject ? `${subject.name} · ` : ''}
              {scheduleText} · {repeatText}
            </Text>
            {topics.length > 0 ? (
              <Text style={styles.previewTopics}>
                {topics.length} topic{topics.length === 1 ? '' : 's'}:{' '}
                {topics.filter((t) => typeof t === 'string' && t.trim()).join(' · ')}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PrimaryButton label="Add to my plan" onPress={save} />
      </View>
    </KeyboardAvoidingView>
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
    select: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      height: 56,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectLabel: {
      flex: 1,
      fontSize: 17,
      fontWeight: '500',
      color: colors.text,
    },
    selectPlaceholder: {
      fontWeight: '400',
      color: colors.muted,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: radius.pill,
    },
    panel: {
      gap: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    panelLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.muted,
    },
    panelHint: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 19,
    },
    subjectList: {
      gap: spacing.xs,
    },
    subjectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 46,
    },
    subjectName: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    tick: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    newSubjectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    newSubjectInput: {
      flex: 1,
      height: 46,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 15,
      color: colors.text,
    },
    addSubject: {
      height: 46,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addSubjectDisabled: {
      opacity: 0.5,
    },
    addSubjectLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    topicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    topicInput: {
      flex: 1,
      height: 56,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
    },
    addTopic: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addTopicLabel: {
      fontSize: 26,
      lineHeight: 30,
      fontWeight: '500',
      color: colors.primary,
    },
    topicList: {
      gap: spacing.sm,
    },
    topicItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topicIndex: {
      width: 24,
      height: 24,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topicIndexText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    topicText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    topicRemove: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    preview: {
      gap: spacing.xs,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
    },
    previewLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    previewText: {
      fontSize: 15,
      color: colors.text,
    },
    previewTopics: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 19,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerHint: {
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.7,
    },
  });
};
