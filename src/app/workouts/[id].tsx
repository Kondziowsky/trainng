import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';

import { Badge, Button, Card, ErrorState, LoadingState, ScreenScroll, Text } from '@/components/ui';
import { WorkoutForm } from '@/features/workouts/components/WorkoutForm';
import { useDeleteWorkout, useUpdateWorkout, useWorkout } from '@/features/workouts/queries';
import type { WorkoutDetail } from '@/features/workouts/types';
import { formatShortDate, fromISODate } from '@/lib/date';
import { toUserMessage } from '@/lib/supabase/errors';
import { makeStyles } from '@/theme';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const query = useWorkout(id);
  const updateWorkout = useUpdateWorkout(id);
  const deleteWorkout = useDeleteWorkout();

  function confirmDelete() {
    const remove = () => deleteWorkout.mutate(id, { onSuccess: () => router.back() });

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert('Delete workout?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  }

  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return (
      <ScreenScroll edges={['bottom']}>
        <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
      </ScreenScroll>
    );
  }

  const workout = query.data;

  if (editing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit workout' }} />
        <ScreenScroll edges={['bottom']}>
          <WorkoutForm
            initialValue={{
              name: workout.name,
              description: workout.description,
              scheduledFor: workout.scheduledFor,
              items: workout.items.map((item) => ({
                key: item.id,
                exerciseId: item.exercise.id,
                exerciseName: item.exercise.name,
                sets: item.sets,
                reps: item.reps,
                notes: item.notes,
              })),
            }}
            submitLabel="Save changes"
            submitting={updateWorkout.isPending}
            errorMessage={updateWorkout.isError ? toUserMessage(updateWorkout.error) : null}
            onSubmit={(input) =>
              updateWorkout.mutate(input, { onSuccess: () => setEditing(false) })
            }
          />
          <Button label="Cancel" variant="ghost" fullWidth onPress={() => setEditing(false)} />
        </ScreenScroll>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: workout.name }} />
      <ScreenScroll edges={['bottom']}>
        <View style={styles.intro}>
          <Badge label={formatShortDate(fromISODate(workout.scheduledFor))} tone="primary" />
          <Text variant="display">{workout.name}</Text>
          {workout.description ? (
            <Text variant="body" color="textSecondary">
              {workout.description}
            </Text>
          ) : null}
        </View>

        <ExerciseList workout={workout} />

        <View style={styles.actions}>
          <Button label="Edit workout" variant="secondary" fullWidth onPress={() => setEditing(true)} />
          <Button
            label="Delete workout"
            variant="ghost"
            fullWidth
            loading={deleteWorkout.isPending}
            onPress={confirmDelete}
          />
          {deleteWorkout.isError ? (
            <Text variant="caption" color="danger">
              {toUserMessage(deleteWorkout.error)}
            </Text>
          ) : null}
        </View>
      </ScreenScroll>
    </>
  );
}

function ExerciseList({ workout }: { workout: WorkoutDetail }) {
  const styles = useStyles();

  if (workout.items.length === 0) {
    return (
      <Card>
        <Text variant="body" color="textMuted">
          No exercises in this workout yet.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.items}>
      {workout.items.map((item, index) => {
        const prescription = [
          item.sets ? `${item.sets} sets` : null,
          item.reps ? `${item.reps} reps` : null,
        ]
          .filter(Boolean)
          .join(' × ');

        return (
          <Card key={item.id}>
            <View style={styles.itemRow}>
              <Text variant="caption" color="textMuted">
                {index + 1}
              </Text>
              <View style={styles.itemMain}>
                <Text variant="bodyStrong">{item.exercise.name}</Text>
                {prescription ? (
                  <Text variant="caption" color="textSecondary">
                    {prescription}
                  </Text>
                ) : null}
                {item.notes ? (
                  <Text variant="caption" color="textMuted">
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  intro: { gap: t.spacing.sm },
  items: { gap: t.spacing.sm },
  itemRow: { flexDirection: 'row', gap: t.spacing.md, alignItems: 'flex-start' },
  itemMain: { flex: 1, gap: 2 },
  actions: { gap: t.spacing.sm, paddingTop: t.spacing.md },
}));
