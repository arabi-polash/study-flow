import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PrimaryButton, SectionLabel } from '@/components/ui';
import { useApp } from '@/lib/app-store';
import { radius, spacing, useStyles, useTheme, type Theme } from '@/lib/theme';

export default function ManageSubjectsScreen() {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const { subjects, addSubject, removeSubject } = useApp();
  const [draft, setDraft] = useState('');

  const trimmed = draft.trim();
  const add = () => {
    if (!trimmed) return;
    addSubject(trimmed);
    setDraft('');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <SectionLabel>New subject</SectionLabel>
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="e.g. Physics"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={add}
          />
          <View style={styles.addButton}>
            <PrimaryButton label="Add" disabled={trimmed.length === 0} onPress={add} />
          </View>
        </View>
        <Text style={styles.help}>
          Add as many subjects as you like, then pick one when you create a study task.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionLabel>Your subjects</SectionLabel>
        {subjects.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No subjects yet. Add your first one above.</Text>
          </Card>
        ) : (
          <Card style={styles.list}>
            {subjects.map((subject, index) => (
              <View key={subject.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: subject.color }]} />
                  <Text style={styles.name}>{subject.name}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${subject.name}`}
                    hitSlop={8}
                    onPress={() => removeSubject(subject.id)}
                    style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
                    <Text style={styles.removeLabel}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        )}
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
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    input: {
      flex: 1,
      height: 54,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 17,
      color: colors.text,
    },
    help: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 19,
    },
    addButton: {
      width: 92,
    },
    list: {
      paddingVertical: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 56,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: radius.pill,
    },
    name: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    remove: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    removeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.muted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    emptyText: {
      fontSize: 15,
      color: colors.muted,
      lineHeight: 21,
    },
    pressed: {
      opacity: 0.6,
    },
  });
};
