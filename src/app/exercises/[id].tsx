import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

import { Button, ErrorState, LoadingState, ScreenScroll } from '@/components/ui';
import { ExerciseForm } from '@/features/exercises/components/ExerciseForm';
import { useDeleteExercise, useExercise, useUpdateExercise } from '@/features/exercises/queries';
import { toUserMessage } from '@/lib/supabase/errors';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const query = useExercise(id);
  const updateExercise = useUpdateExercise(id);
  const deleteExercise = useDeleteExercise();

  function confirmDelete() {
    const remove = () =>
      deleteExercise.mutate(id, {
        onSuccess: () => router.back(),
      });

    if (Platform.OS === 'web') {
      remove();
      return;
    }

    Alert.alert(
      'Delete exercise?',
      'It will be removed from your library. Workouts that already use it keep their plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: remove },
      ],
    );
  }

  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return (
      <ScreenScroll edges={['bottom']}>
        <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
      </ScreenScroll>
    );
  }

  const mutationError = updateExercise.isError
    ? toUserMessage(updateExercise.error)
    : deleteExercise.isError
      ? toUserMessage(deleteExercise.error)
      : null;

  return (
    <>
      <Stack.Screen options={{ title: query.data.name }} />
      <ScreenScroll edges={['bottom']}>
        <ExerciseForm
          initialValue={{
            name: query.data.name,
            description: query.data.description,
            muscleGroup: query.data.muscle_group,
          }}
          submitLabel="Save changes"
          submitting={updateExercise.isPending}
          errorMessage={mutationError}
          onSubmit={(input) => updateExercise.mutate(input, { onSuccess: () => router.back() })}
        />
        <Button
          label="Delete exercise"
          variant="ghost"
          fullWidth
          loading={deleteExercise.isPending}
          onPress={confirmDelete}
        />
      </ScreenScroll>
    </>
  );
}
