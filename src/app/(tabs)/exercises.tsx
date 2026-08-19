import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import { ExerciseListItem } from '@/features/exercises/components/ExerciseListItem';
import { useExercises } from '@/features/exercises/queries';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { toUserMessage } from '@/lib/supabase/errors';
import { makeStyles, useTheme } from '@/theme';

export default function ExercisesScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search);
  const query = useExercises(debouncedSearch);
  const exercises = query.data ?? [];
  const isSearching = search.trim().length > 0;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text variant="display">Exercises</Text>
        <Input
          placeholder="Search your library…"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ExerciseListItem
              exercise={item}
              onPress={() => router.push({ pathname: '/exercises/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={isSearching ? 'search-outline' : 'barbell-outline'}
              title={isSearching ? 'No matches' : 'Build your library'}
              message={
                isSearching
                  ? `Nothing called "${search.trim()}" yet.`
                  : 'Create an exercise once, then reuse it in every workout.'
              }
              actionLabel="Create exercise"
              onAction={() => router.push('/exercises/new')}
            />
          }
        />
      )}

      <View style={styles.footer}>
        <Button
          label="New exercise"
          fullWidth
          icon={<Ionicons name="add" size={18} color={theme.colors.onPrimary} />}
          onPress={() => router.push('/exercises/new')}
        />
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  header: { paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.lg, gap: t.spacing.md },
  list: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxl,
    gap: t.spacing.sm,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.sm,
    paddingBottom: t.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    backgroundColor: t.colors.background,
  },
}));
