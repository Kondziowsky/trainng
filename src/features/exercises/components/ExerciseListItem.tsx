import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Badge, Text } from '@/components/ui';
import { makeStyles, useTheme } from '@/theme';

import { muscleGroupLabel } from '../types';
import type { Exercise } from '../types';

export type ExerciseListItemProps = {
  exercise: Pick<Exercise, 'id' | 'name' | 'description' | 'muscle_group'>;
  onPress?: () => void;
  /** Shows a trailing "add" affordance instead of a chevron. */
  mode?: 'navigate' | 'select';
};

export function ExerciseListItem({ exercise, onPress, mode = 'navigate' }: ExerciseListItemProps) {
  const styles = useStyles();
  const theme = useTheme();
  const group = muscleGroupLabel(exercise.muscle_group);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.main}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {exercise.name}
        </Text>
        {exercise.description ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {exercise.description}
          </Text>
        ) : null}
      </View>
      {group ? <Badge label={group} /> : null}
      <Ionicons
        name={mode === 'select' ? 'add-circle-outline' : 'chevron-forward'}
        size={mode === 'select' ? 22 : 18}
        color={mode === 'select' ? theme.colors.primary : theme.colors.textMuted}
      />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pressed: { opacity: 0.7 },
  main: { flex: 1, gap: 2 },
}));
