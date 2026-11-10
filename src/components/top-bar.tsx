import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ChevronIcon, CloseIcon, MenuIcon, SearchIcon } from '@/components/icons';
import { IconButton } from '@/components/ui';
import { useDrawer } from '@/components/drawer';
import { radius, spacing, useStyles, useTheme, type Theme } from '@/lib/theme';

export function TopBar({
  title,
  subtitle,
  onSearch,
}: {
  title: string;
  subtitle?: string;
  onSearch?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const drawer = useDrawer();

  return (
    <View style={styles.bar}>
      <IconButton accessibilityLabel="Open menu" onPress={drawer.open}>
        <MenuIcon color={colors.text} />
      </IconButton>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onSearch ? (
        <IconButton accessibilityLabel="Search plans" onPress={onSearch}>
          <SearchIcon color={colors.text} />
        </IconButton>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

export function SearchBar({
  query,
  onChangeQuery,
  onClose,
}: {
  query: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.bar}>
      <IconButton accessibilityLabel="Close search" onPress={onClose}>
        <ChevronIcon color={colors.text} direction="left" />
      </IconButton>
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search plans, subjects, topics"
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoFocus
        returnKeyType="search"
      />
      {query.length > 0 ? (
        <IconButton accessibilityLabel="Clear search" onPress={() => onChangeQuery('')}>
          <CloseIcon color={colors.muted} />
        </IconButton>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 60,
    },
    titleBlock: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.muted,
    },
    input: {
      flex: 1,
      height: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
    },
    spacer: {
      width: 44,
    },
  });
};
