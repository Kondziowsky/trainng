import type { ISODate } from '@/lib/date';
import type { Exercise } from '@/features/exercises/types';
import type { Tables } from '@/lib/supabase/database.types';

export type Workout = Tables<'workouts'>;
export type WorkoutExercise = Tables<'workout_exercises'>;

/** A planned exercise joined with the library entry it references. */
export type WorkoutItem = {
  id: string;
  orderIndex: number;
  sets: number | null;
  reps: number | null;
  notes: string | null;
  exercise: Pick<Exercise, 'id' | 'name' | 'muscle_group'>;
};

/** Enough to render a card in a list or on the Today screen. */
export type WorkoutSummary = {
  id: string;
  name: string;
  description: string | null;
  scheduledFor: ISODate;
  exerciseCount: number;
  setCount: number;
};

export type WorkoutDetail = WorkoutSummary & {
  items: WorkoutItem[];
};

/** One row of the workout builder before it is saved. */
export type WorkoutItemDraft = {
  /** Stable key while editing; not the database id. */
  key: string;
  exerciseId: string;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  notes: string | null;
};

export type WorkoutInput = {
  name: string;
  description?: string | null;
  scheduledFor: ISODate;
  items: WorkoutItemDraft[];
};
