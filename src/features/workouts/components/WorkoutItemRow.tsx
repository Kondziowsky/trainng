import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Input, Text } from '@/components/ui';
import { makeStyles, useTheme } from '@/theme';

import type { WorkoutItemDraft } from '../types';

export type WorkoutItemRowProps = {
  item: WorkoutItemDraft;
  index: number;
  onChange: (patch: Partial<WorkoutItemDraft>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

/** Parses a numeric text field, treating empty input as "not specified". */
function parseCount(text: string): number | null {
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return Number(digits);
}

export function WorkoutItemRow({
  item,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WorkoutItemRowProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text variant="caption" color="textMuted">
          {index + 1}
        </Text>
        <Text variant="bodyStrong" style={styles.name} numberOfLines={1}>
          {item.exerciseName}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Move up"
          disabled={!onMoveUp}
          onPress={onMoveUp}
          hitSlop={8}
        >
          <Ionicons
            name="chevron-up"
            size={18}
            color={onMoveUp ? theme.colors.textSecondary : theme.colors.border}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Move down"
          disabled={!onMoveDown}
          onPress={onMoveDown}
          hitSlop={8}
        >
          <Ionicons
            name="chevron-down"
            size={18}
            color={onMoveDown ? theme.colors.textSecondary : theme.colors.border}
          />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Remove" onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </Pressable>
      </View>

      <View style={styles.fields}>
        <View style={styles.field}>
          <Input
            label="Sets"
            keyboardType="number-pad"
            placeholder="3"
            value={item.sets?.toString() ?? ''}
            onChangeText={(text) => onChange({ sets: parseCount(text) })}
          />
        </View>
        <View style={styles.field}>
          <Input
            label="Reps"
            keyboardType="number-pad"
            placeholder="8"
            value={item.reps?.toString() ?? ''}
            onChangeText={(text) => onChange({ reps: parseCount(text) })}
          />
        </View>
      </View>

      <Input
        label="Notes"
        placeholder="Optional"
        value={item.notes ?? ''}
        onChangeText={(text) => onChange({ notes: text })}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  name: { flex: 1 },
  fields: { flexDirection: 'row', gap: t.spacing.md },
  field: { flex: 1 },
}));
