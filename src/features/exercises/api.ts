import { supabase } from '@/lib/supabase/client';
import { unwrap } from '@/lib/supabase/errors';

import type { Exercise, ExerciseInput } from './types';

const COLUMNS = 'id, owner_id, name, description, muscle_group, created_at, updated_at';

/**
 * Data access for the exercise library. Screens never touch `supabase`
 * directly — swapping in a REST backend later means rewriting this file only.
 */

export async function listExercises(search: string): Promise<Exercise[]> {
  let query = supabase.from('exercises').select(COLUMNS).order('name', { ascending: true });

  const term = search.trim();
  if (term) {
    // `ilike` is enough for a personal library; swap for full-text search if it
    // ever grows past a few hundred rows.
    query = query.ilike('name', `%${term}%`);
  }

  return unwrap(await query);
}

export async function getExercise(id: string): Promise<Exercise> {
  return unwrap(await supabase.from('exercises').select(COLUMNS).eq('id', id).single());
}

export async function createExercise(ownerId: string, input: ExerciseInput): Promise<Exercise> {
  return unwrap(
    await supabase
      .from('exercises')
      .insert({
        owner_id: ownerId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        muscle_group: input.muscleGroup ?? null,
      })
      .select(COLUMNS)
      .single(),
  );
}

export async function updateExercise(id: string, input: ExerciseInput): Promise<Exercise> {
  return unwrap(
    await supabase
      .from('exercises')
      .update({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        muscle_group: input.muscleGroup ?? null,
      })
      .eq('id', id)
      .select(COLUMNS)
      .single(),
  );
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw error;
}
