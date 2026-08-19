import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { WorkoutCard } from '@/features/workouts/components/WorkoutCard';
import { useWorkoutsOnDate } from '@/features/workouts/queries';
import { formatLongDate, todayISO } from '@/lib/date';
import { toUserMessage } from '@/lib/supabase/errors';
import { makeStyles, useTheme } from '@/theme';

export default function TodayScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const router = useRouter();

  const today = todayISO();
  const query = useWorkoutsOnDate(today);
  const workouts = query.data ?? [];

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="caption" color="textMuted">
            {formatLongDate(new Date())}
          </Text>
          <Text variant="display">Today</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={theme.colors.textMuted}
          />
        }
      >
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : workouts.length === 0 ? (
          <EmptyState
            icon="bed-outline"
            title="No workout planned today"
            message="Rest day — or plan something now."
            actionLabel="Plan a workout"
            onAction={() => router.push({ pathname: '/workouts/new', params: { date: today } })}
          />
        ) : (
          <View style={styles.list}>
            <Text variant="label" color="textSecondary">
              {workouts.length === 1 ? "TODAY'S WORKOUT" : "TODAY'S WORKOUTS"}
            </Text>
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                variant="elevated"
                onPress={() => router.push({ pathname: '/workouts/[id]', params: { id: workout.id } })}
              />
            ))}
            <Button
              label="Plan another workout"
              variant="ghost"
              fullWidth
              onPress={() => router.push({ pathname: '/workouts/new', params: { date: today } })}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.lg,
    paddingBottom: t.spacing.md,
  },
  headerText: { gap: t.spacing.xs },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceMuted,
  },
  pressed: { opacity: 0.7 },
  content: { padding: t.spacing.lg, paddingBottom: t.spacing.xxl, flexGrow: 1 },
  list: { gap: t.spacing.md },
}));
