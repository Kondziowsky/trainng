import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth/AuthProvider';
import type { ISODate } from '@/lib/date';

import * as api from './api';
import type { WorkoutInput } from './types';

export const workoutKeys = {
  all: ['workouts'] as const,
  range: (from: ISODate, to: ISODate) => [...workoutKeys.all, 'range', from, to] as const,
  onDate: (date: ISODate) => [...workoutKeys.all, 'date', date] as const,
  detail: (id: string) => [...workoutKeys.all, 'detail', id] as const,
};

export function useWorkoutsInRange(from: ISODate, to: ISODate) {
  return useQuery({
    queryKey: workoutKeys.range(from, to),
    queryFn: () => api.listWorkoutsInRange(from, to),
    placeholderData: (previous) => previous,
  });
}

export function useWorkoutsOnDate(date: ISODate) {
  return useQuery({
    queryKey: workoutKeys.onDate(date),
    queryFn: () => api.listWorkoutsOnDate(date),
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: workoutKeys.detail(id),
    queryFn: () => api.getWorkout(id),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    mutationFn: (input: WorkoutInput) => api.createWorkout(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutKeys.all }),
  });
}

export function useUpdateWorkout(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkoutInput) => api.updateWorkout(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutKeys.all }),
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteWorkout(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutKeys.all }),
  });
}
