import { useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenScroll } from '@/components/ui';
import { WorkoutForm } from '@/features/workouts/components/WorkoutForm';
import { useCreateWorkout } from '@/features/workouts/queries';
import { todayISO } from '@/lib/date';
import { toUserMessage } from '@/lib/supabase/errors';

export default function NewWorkoutScreen() {
  // expo-router's params generic does not allow optional properties; the value
  // is still absent when the route is opened without one, hence the fallback.
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const createWorkout = useCreateWorkout();

  return (
    <ScreenScroll edges={['bottom']}>
      <WorkoutForm
        initialValue={{
          name: '',
          description: '',
          scheduledFor: date ?? todayISO(),
          items: [],
        }}
        submitLabel="Create workout"
        submitting={createWorkout.isPending}
        errorMessage={createWorkout.isError ? toUserMessage(createWorkout.error) : null}
        onSubmit={(input) => createWorkout.mutate(input, { onSuccess: () => router.back() })}
      />
    </ScreenScroll>
  );
}
