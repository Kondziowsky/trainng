import { useRouter } from 'expo-router';

import { ScreenScroll } from '@/components/ui';
import { ExerciseForm } from '@/features/exercises/components/ExerciseForm';
import { useCreateExercise } from '@/features/exercises/queries';
import { toUserMessage } from '@/lib/supabase/errors';

export default function NewExerciseScreen() {
  const router = useRouter();
  const createExercise = useCreateExercise();

  return (
    <ScreenScroll edges={['bottom']}>
      <ExerciseForm
        submitLabel="Create exercise"
        submitting={createExercise.isPending}
        errorMessage={createExercise.isError ? toUserMessage(createExercise.error) : null}
        onSubmit={(input) => {
          createExercise.mutate(input, { onSuccess: () => router.back() });
        }}
      />
    </ScreenScroll>
  );
}
