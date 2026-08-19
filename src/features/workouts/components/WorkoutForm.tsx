import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { DatePickerModal } from '@/features/calendar/components/DatePickerModal';
import { ExercisePickerModal } from '@/features/exercises/components/ExercisePickerModal';
import { formatShortDate, fromISODate, type ISODate } from '@/lib/date';
import { makeStyles, useTheme } from '@/theme';

import type { WorkoutInput, WorkoutItemDraft } from '../types';
import { WorkoutItemRow } from './WorkoutItemRow';

export type WorkoutFormProps = {
  initialValue: WorkoutInput;
  submitLabel?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: WorkoutInput) => void;
};

export function WorkoutForm({
  initialValue,
  submitLabel = 'Save workout',
  submitting = false,
  errorMessage,
  onSubmit,
}: WorkoutFormProps) {
  const styles = useStyles();
  const theme = useTheme();

  const [name, setName] = useState(initialValue.name);
  const [description, setDescription] = useState(initialValue.description ?? '');
  const [scheduledFor, setScheduledFor] = useState<ISODate>(initialValue.scheduledFor);
  const [items, setItems] = useState<WorkoutItemDraft[]>(initialValue.items);
  const [nameError, setNameError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Draft rows need a key that survives reordering but is not the database id.
  const nextKey = useRef(initialValue.items.length);

  function addExercise(exercise: { id: string; name: string }) {
    nextKey.current += 1;
    setItems((current) => [
      ...current,
      {
        key: `draft-${nextKey.current}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: null,
        reps: null,
        notes: null,
      },
    ]);
  }

  function patchItem(key: string, patch: Partial<WorkoutItemDraft>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + direction;
      const a = next[index];
      const b = next[target];
      if (!a || !b) return current;
      next[index] = b;
      next[target] = a;
      return next;
    });
  }

  function handleSubmit() {
    if (!name.trim()) {
      setNameError('Give the workout a name.');
      return;
    }
    setNameError(null);
    onSubmit({ name, description, scheduledFor, items });
  }

  return (
    <View style={styles.form}>
      <Input
        label="Name"
        placeholder="e.g. Full Body"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError) setNameError(null);
        }}
        error={nameError}
        autoCapitalize="words"
      />

      <View style={styles.section}>
        <Text variant="label" color="textSecondary">
          Date
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setDateOpen(true)}
          style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
          <Text variant="body">{formatShortDate(fromISODate(scheduledFor))}</Text>
        </Pressable>
      </View>

      <Input
        label="Description"
        placeholder="Optional"
        value={description ?? ''}
        onChangeText={setDescription}
        multiline
        style={styles.multiline}
      />

      <View style={styles.section}>
        <Text variant="label" color="textSecondary">
          Exercises
        </Text>

        {items.length === 0 ? (
          <Text variant="caption" color="textMuted">
            No exercises yet. Add one from your library.
          </Text>
        ) : (
          <View style={styles.items}>
            {items.map((item, index) => (
              <WorkoutItemRow
                key={item.key}
                item={item}
                index={index}
                onChange={(patch) => patchItem(item.key, patch)}
                onRemove={() => removeItem(item.key)}
                onMoveUp={index > 0 ? () => moveItem(index, -1) : undefined}
                onMoveDown={index < items.length - 1 ? () => moveItem(index, 1) : undefined}
              />
            ))}
          </View>
        )}

        <Button
          label="Add exercise"
          variant="secondary"
          fullWidth
          icon={<Ionicons name="add" size={18} color={theme.colors.text} />}
          onPress={() => setPickerOpen(true)}
        />
      </View>

      {errorMessage ? (
        <Text variant="caption" color="danger">
          {errorMessage}
        </Text>
      ) : null}

      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} fullWidth size="lg" />

      {pickerOpen ? (
        <ExercisePickerModal
          visible
          onClose={() => setPickerOpen(false)}
          onSelect={addExercise}
        />
      ) : null}
      {dateOpen ? (
        <DatePickerModal
          visible
          value={scheduledFor}
          onClose={() => setDateOpen(false)}
          onSelect={setScheduledFor}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  form: { gap: t.spacing.lg },
  section: { gap: t.spacing.sm },
  items: { gap: t.spacing.md },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    minHeight: 48,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  pressed: { opacity: 0.7 },
}));
