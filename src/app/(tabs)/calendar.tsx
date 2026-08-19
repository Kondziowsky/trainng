import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, ErrorState, LoadingState, Text } from '@/components/ui';
import { MonthGrid } from '@/features/calendar/components/MonthGrid';
import { MonthHeader } from '@/features/calendar/components/MonthHeader';
import { WorkoutCard } from '@/features/workouts/components/WorkoutCard';
import { useWorkoutsInRange } from '@/features/workouts/queries';
import {
  addMonths,
  endOfMonth,
  formatShortDate,
  fromISODate,
  startOfMonth,
  toISODate,
  todayISO,
  type ISODate,
} from '@/lib/date';
import { toUserMessage } from '@/lib/supabase/errors';
import { makeStyles } from '@/theme';

export default function CalendarScreen() {
  const styles = useStyles();
  const router = useRouter();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<ISODate>(todayISO());

  const from = toISODate(startOfMonth(month));
  const to = toISODate(endOfMonth(month));
  const query = useWorkoutsInRange(from, to);

  const workouts = useMemo(() => query.data ?? [], [query.data]);
  const markedDates = useMemo(
    () => new Set(workouts.map((workout) => workout.scheduledFor)),
    [workouts],
  );
  const selectedWorkouts = workouts.filter((workout) => workout.scheduledFor === selectedDate);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="display">Calendar</Text>

        <Card>
          <MonthHeader
            month={month}
            onPrevious={() => setMonth((current) => addMonths(current, -1))}
            onNext={() => setMonth((current) => addMonths(current, 1))}
          />
          {query.isError ? (
            <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
          ) : (
            <MonthGrid
              month={month}
              markedDates={markedDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
        </Card>

        <View style={styles.section}>
          <Text variant="label" color="textSecondary">
            {formatShortDate(fromISODate(selectedDate)).toUpperCase()}
          </Text>

          {query.isPending ? (
            <LoadingState />
          ) : selectedWorkouts.length === 0 ? (
            <View style={styles.emptyDay}>
              <Text variant="body" color="textMuted">
                Nothing planned for this day.
              </Text>
              <Button
                label="Plan a workout"
                variant="secondary"
                onPress={() =>
                  router.push({ pathname: '/workouts/new', params: { date: selectedDate } })
                }
              />
            </View>
          ) : (
            selectedWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() =>
                  router.push({ pathname: '/workouts/[id]', params: { id: workout.id } })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  content: { padding: t.spacing.lg, paddingBottom: t.spacing.xxl, gap: t.spacing.lg },
  section: { gap: t.spacing.md },
  emptyDay: { gap: t.spacing.md, alignItems: 'flex-start' },
}));
