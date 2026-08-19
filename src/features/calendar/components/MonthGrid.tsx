import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { buildMonthGrid, todayISO, weekdayLabels, type ISODate } from '@/lib/date';
import { makeStyles } from '@/theme';

export type MonthGridProps = {
  /** Any date inside the month to render. */
  month: Date;
  /** Dates that have at least one workout — shown with a dot. */
  markedDates?: ReadonlySet<ISODate>;
  selectedDate?: ISODate | null;
  onSelectDate: (date: ISODate) => void;
};

/**
 * A Monday-first month grid.
 *
 * Hand-rolled rather than pulling in a calendar library: it is ~80 lines, it
 * consumes theme tokens directly (so future skins just work), and the MVP needs
 * no scheduling features a library would provide.
 */
export function MonthGrid({ month, markedDates, selectedDate, onSelectDate }: MonthGridProps) {
  const styles = useStyles();
  const weeks = useMemo(() => buildMonthGrid(month), [month]);
  const labels = useMemo(() => weekdayLabels(), []);
  const today = todayISO();

  return (
    <View style={styles.grid}>
      <View style={styles.week}>
        {labels.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.cell}>
            <Text variant="caption" color="textMuted">
              {label}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0]?.date ?? ''} style={styles.week}>
          {week.map((cell) => {
            const isSelected = selectedDate === cell.date;
            const isToday = today === cell.date;
            const isMarked = markedDates?.has(cell.date) ?? false;

            return (
              <Pressable
                key={cell.date}
                accessibilityRole="button"
                accessibilityLabel={cell.date}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectDate(cell.date)}
                style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
              >
                <View
                  style={[
                    styles.day,
                    isToday && !isSelected && styles.dayToday,
                    isSelected && styles.daySelected,
                  ]}
                >
                  <Text
                    variant="body"
                    color={
                      isSelected ? 'onPrimary' : cell.inCurrentMonth ? 'text' : 'textMuted'
                    }
                  >
                    {cell.dayOfMonth}
                  </Text>
                </View>
                <View style={[styles.dot, isMarked && (isSelected ? styles.dotOnSelected : styles.dotVisible)]} />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const DAY_SIZE = 36;

const useStyles = makeStyles((t) => ({
  grid: { gap: t.spacing.xs },
  week: { flexDirection: 'row' },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: t.spacing.xs,
    gap: 3,
  },
  pressed: { opacity: 0.6 },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayToday: { borderColor: t.colors.primary },
  daySelected: { backgroundColor: t.colors.primary },
  dot: {
    width: 5,
    height: 5,
    borderRadius: t.radius.full,
    backgroundColor: 'transparent',
  },
  dotVisible: { backgroundColor: t.colors.primary },
  dotOnSelected: { backgroundColor: t.colors.textMuted },
}));
