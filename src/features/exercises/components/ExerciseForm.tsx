import { useState } from 'react';
import { View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { makeStyles } from '@/theme';

import type { ExerciseInput, MuscleGroup } from '../types';
import { MuscleGroupPicker } from './MuscleGroupPicker';

export type ExerciseFormProps = {
  initialValue?: Partial<ExerciseInput>;
  submitLabel?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: ExerciseInput) => void;
};

export function ExerciseForm({
  initialValue,
  submitLabel = 'Save exercise',
  submitting = false,
  errorMessage,
  onSubmit,
}: ExerciseFormProps) {
  const styles = useStyles();
  const [name, setName] = useState(initialValue?.name ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(
    initialValue?.muscleGroup ?? null,
  );
  const [nameError, setNameError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim()) {
      setNameError('Give the exercise a name.');
      return;
    }
    setNameError(null);
    onSubmit({ name, description, muscleGroup });
  }

  return (
    <View style={styles.form}>
      <Input
        label="Name"
        placeholder="e.g. Bench Press"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError) setNameError(null);
        }}
        error={nameError}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <Input
        label="Description"
        placeholder="Optional cues, tempo, setup…"
        value={description ?? ''}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.multiline}
      />

      <View style={styles.section}>
        <Text variant="label" color="textSecondary">
          Muscle group
        </Text>
        <MuscleGroupPicker value={muscleGroup} onChange={setMuscleGroup} />
      </View>

      {errorMessage ? (
        <Text variant="caption" color="danger">
          {errorMessage}
        </Text>
      ) : null}

      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} fullWidth />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  form: { gap: t.spacing.lg },
  section: { gap: t.spacing.sm },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
}));
