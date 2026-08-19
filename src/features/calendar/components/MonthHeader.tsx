import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatMonthYear } from '@/lib/date';
import { makeStyles, useTheme } from '@/theme';

export type MonthHeaderProps = {
  month: Date;
  onPrevious: () => void;
  onNext: () => void;
};

export function MonthHeader({ month, onPrevious, onNext }: MonthHeaderProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        onPress={onPrevious}
        hitSlop={12}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Ionicons name="chevron-back" size={22} color={theme.colors.textSecondary} />
      </Pressable>

      <Text variant="heading">{formatMonthYear(month)}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next month"
        onPress={onNext}
        hitSlop={12}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.sm,
    paddingBottom: t.spacing.sm,
  },
  pressed: { opacity: 0.6 },
}));
