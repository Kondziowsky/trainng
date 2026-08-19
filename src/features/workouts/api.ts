import type { ISODate } from '@/lib/date';
import { supabase } from '@/lib/supabase/client';
import type { MuscleGroup } from '@/lib/supabase/database.types';
import { unwrap } from '@/lib/supabase/errors';

import type { WorkoutDetail, WorkoutInput, WorkoutItemDraft, WorkoutSummary } from './types';

// -- Row shapes returned by the nested selects below -------------------------

type WorkoutBaseRow = {
  id: string;
  name: string;
  description: string | null;
  scheduled_for: string;
};

type SummaryItemRow = { id: string; sets: number | null };

type DetailItemRow = {
  id: string;
  order_index: number;
  sets: number | null;
  reps: number | null;
  notes: string | null;
  exercises: { id: string; name: string; muscle_group: MuscleGroup | null } | null;
};

type SummaryRow = WorkoutBaseRow & { workout_exercises: SummaryItemRow[] };
type DetailRow = WorkoutBaseRow & { workout_exercises: DetailItemRow[] };

const SUMMARY_SELECT = 'id, name, description, scheduled_for, workout_exercises(id, sets)';

const DETAIL_SELECT =
  'id, name, description, scheduled_for, workout_exercises(id, order_index, sets, reps, notes, exercises(id, name, muscle_group))';

// -- Mapping -----------------------------------------------------------------

function toSummary(
  row: WorkoutBaseRow & { workout_exercises: Pick<SummaryItemRow, 'sets'>[] },
): WorkoutSummary {
  const items = row.workout_exercises ?? [];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    scheduledFor: row.scheduled_for,
    exerciseCount: items.length,
    setCount: items.reduce((total, item) => total + (item.sets ?? 0), 0),
  };
}

function toDetail(row: DetailRow): WorkoutDetail {
  const items = (row.workout_exercises ?? [])
    .filter((item) => item.exercises !== null)
    .sort((a, b) => a.order_index - b.order_index)
    .map((item) => ({
      id: item.id,
      orderIndex: item.order_index,
      sets: item.sets,
      reps: item.reps,
      notes: item.notes,
      // Non-null: filtered above. The FK is `on delete restrict`, so a
      // referenced exercise cannot disappear from under a plan.
      exercise: item.exercises!,
    }));

  return {
    ...toSummary(row),
    items,
  };
}

// -- Queries -----------------------------------------------------------------

/** Workouts scheduled between two calendar dates, inclusive. Drives the calendar. */
export async function listWorkoutsInRange(from: ISODate, to: ISODate): Promise<WorkoutSummary[]> {
  const rows = unwrap(
    await supabase
      .from('workouts')
      .select(SUMMARY_SELECT)
      .gte('scheduled_for', from)
      .lte('scheduled_for', to)
      .order('scheduled_for', { ascending: true })
      .returns<SummaryRow[]>(),
  );
  return rows.map(toSummary);
}

/** Workouts planned for a single day. Drives the Today screen. */
export async function listWorkoutsOnDate(date: ISODate): Promise<WorkoutSummary[]> {
  const rows = unwrap(
    await supabase
      .from('workouts')
      .select(SUMMARY_SELECT)
      .eq('scheduled_for', date)
      .order('created_at', { ascending: true })
      .returns<SummaryRow[]>(),
  );
  return rows.map(toSummary);
}

export async function getWorkout(id: string): Promise<WorkoutDetail> {
  const row = unwrap(
    await supabase
      .from('workouts')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .returns<DetailRow[]>()
      .single(),
  );
  return toDetail(row);
}

// -- Mutations ---------------------------------------------------------------

function toItemRows(workoutId: string, items: WorkoutItemDraft[]) {
  return items.map((item, index) => ({
    workout_id: workoutId,
    exercise_id: item.exerciseId,
    order_index: index,
    sets: item.sets,
    reps: item.reps,
    notes: item.notes?.trim() || null,
  }));
}

/**
 * NOTE: the workout row and its exercises are written in two statements, so
 * this is not atomic. On failure we delete the just-created parent to avoid
 * leaving an empty workout behind. If this ever needs to be transactional,
 * move it into a Postgres function and call it via `supabase.rpc()`.
 */
export async function createWorkout(
  userId: string,
  input: WorkoutInput,
): Promise<{ id: string }> {
  const workout = unwrap(
    await supabase
      .from('workouts')
      .insert({
        athlete_id: userId,
        created_by: userId,
        scheduled_for: input.scheduledFor,
        name: input.name.trim(),
        description: input.description?.trim() || null,
      })
      .select('id')
      .single(),
  );

  if (input.items.length > 0) {
    const { error } = await supabase
      .from('workout_exercises')
      .insert(toItemRows(workout.id, input.items));

    if (error) {
      await supabase.from('workouts').delete().eq('id', workout.id);
      throw error;
    }
  }

  return workout;
}

export async function updateWorkout(id: string, input: WorkoutInput): Promise<void> {
  const { error: updateError } = await supabase
    .from('workouts')
    .update({
      scheduled_for: input.scheduledFor,
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
    .eq('id', id);
  if (updateError) throw updateError;

  // The item list is small and fully owned by this screen, so replacing it is
  // simpler and less error-prone than diffing.
  const { error: deleteError } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', id);
  if (deleteError) throw deleteError;

  if (input.items.length > 0) {
    const { error } = await supabase.from('workout_exercises').insert(toItemRows(id, input.items));
    if (error) throw error;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  if (error) throw error;
}
