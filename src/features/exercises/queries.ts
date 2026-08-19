import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUserId } from '@/lib/auth/AuthProvider';

import * as api from './api';
import type { ExerciseInput } from './types';

export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (search: string) => [...exerciseKeys.all, 'list', search] as const,
  detail: (id: string) => [...exerciseKeys.all, 'detail', id] as const,
};

export function useExercises(search: string) {
  return useQuery({
    queryKey: exerciseKeys.list(search),
    queryFn: () => api.listExercises(search),
    placeholderData: (previous) => previous,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => api.getExercise(id),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const ownerId = useUserId();

  return useMutation({
    mutationFn: (input: ExerciseInput) => api.createExercise(ownerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exerciseKeys.all }),
  });
}

export function useUpdateExercise(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExerciseInput) => api.updateExercise(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exerciseKeys.all }),
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteExercise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exerciseKeys.all }),
  });
}
