import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui';
import { makeStyles } from '@/theme';

import { MUSCLE_GROUPS, muscleGroupLabel, type MuscleGroup } from '../types';

export type MuscleGroupPickerProps = {
  value: MuscleGroup | null;
  onChange: (value: MuscleGroup | null) => void;
};

/** Horizontal chip row. Tapping the selected chip clears it. */
export function MuscleGroupPicker({ value, onChange }: MuscleGroupPickerProps) {
  const styles = useStyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {MUSCLE_GROUPS.map((group) => {
        const selected = value === group;
        return (
          <Pressable
            key={group}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? null : group)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text variant="caption" color={selected ? 'primary' : 'textSecondary'}>
              {muscleGroupLabel(group)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  content: { gap: t.spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  chipSelected: {
    borderColor: t.colors.primary,
    backgroundColor: t.colors.primarySoft,
  },
  pressed: { opacity: 0.7 },
}));
