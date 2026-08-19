import type { MuscleGroup, Tables } from '@/lib/supabase/database.types';

export type Exercise = Tables<'exercises'>;

export type ExerciseInput = {
  name: string;
  description?: string | null;
  muscleGroup?: MuscleGroup | null;
};

export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'glutes',
  'core',
  'full_body',
  'cardio',
  'mobility',
  'other',
];

const LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  glutes: 'Glutes',
  core: 'Core',
  full_body: 'Full body',
  cardio: 'Cardio',
  mobility: 'Mobility',
  other: 'Other',
};

export function muscleGroupLabel(group: MuscleGroup | null | undefined): string | null {
  return group ? LABELS[group] : null;
}

export type { MuscleGroup };
