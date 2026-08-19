import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { toUserMessage } from '@/lib/supabase/errors';
import { makeStyles, useTheme } from '@/theme';

import { useCreateExercise, useExercises } from '../queries';
import type { Exercise } from '../types';
import { ExerciseListItem } from './ExerciseListItem';

export type ExercisePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Pick<Exercise, 'id' | 'name'>) => void;
};

/**
 * Search the library and pick an existing exercise. If the search term does not
 * match anything, the user can create it inline — which still produces one
 * library row that later workouts reuse, never a per-workout copy.
 */
export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const query = useExercises(debouncedSearch);
  const createExercise = useCreateExercise();

  const term = search.trim();
  const results = query.data ?? [];
  const hasExactMatch = results.some(
    (exercise) => exercise.name.toLowerCase() === term.toLowerCase(),
  );

  function handleClose() {
    setSearch('');
    createExercise.reset();
    onClose();
  }

  function handleSelect(exercise: Pick<Exercise, 'id' | 'name'>) {
    handleClose();
    onSelect(exercise);
  }

  async function handleCreate() {
    try {
      const created = await createExercise.mutateAsync({ name: term });
      handleSelect(created);
    } catch {
      // Surfaced below via `createExercise.isError`.
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} transparent={false}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text variant="heading">Add exercise</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Input
            placeholder="Search your exercises…"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoFocus
            returnKeyType="search"
          />
        </View>

        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ExerciseListItem exercise={item} mode="select" onPress={() => handleSelect(item)} />
            )}
            ListEmptyComponent={
              term ? null : (
                <EmptyState
                  icon="barbell-outline"
                  title="Your library is empty"
                  message="Type a name above to create your first exercise."
                />
              )
            }
            ListFooterComponent={
              term && !hasExactMatch ? (
                <View style={styles.footer}>
                  <Button
                    label={`Create "${term}"`}
                    variant="secondary"
                    fullWidth
                    loading={createExercise.isPending}
                    onPress={() => void handleCreate()}
                  />
                  {createExercise.isError ? (
                    <Text variant="caption" color="danger">
                      {toUserMessage(createExercise.error)}
                    </Text>
                  ) : null}
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
  },
  searchRow: { paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.md },
  list: { paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.xxl, gap: t.spacing.sm },
  footer: { paddingTop: t.spacing.lg, gap: t.spacing.sm },
}));
