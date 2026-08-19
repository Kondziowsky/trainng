import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { addMonths, fromISODate, type ISODate } from '@/lib/date';
import { makeStyles } from '@/theme';

import { MonthGrid } from './MonthGrid';
import { MonthHeader } from './MonthHeader';

export type DatePickerModalProps = {
  visible: boolean;
  value: ISODate;
  onClose: () => void;
  onSelect: (date: ISODate) => void;
};

/**
 * Reuses the calendar's own month grid instead of adding a native date-picker
 * dependency — one component, identical look on Android, iOS and Web.
 */
export function DatePickerModal({ visible, value, onClose, onSelect }: DatePickerModalProps) {
  const styles = useStyles();
  const [month, setMonth] = useState(() => fromISODate(value));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close date picker">
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text variant="heading" style={styles.title}>
            Pick a date
          </Text>
          <MonthHeader
            month={month}
            onPrevious={() => setMonth((current) => addMonths(current, -1))}
            onNext={() => setMonth((current) => addMonths(current, 1))}
          />
          <MonthGrid
            month={month}
            selectedDate={value}
            onSelectDate={(date) => {
              onSelect(date);
              onClose();
            }}
          />
          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  backdrop: {
    flex: 1,
    backgroundColor: t.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
    ...t.elevation.raised,
  },
  title: { paddingBottom: t.spacing.xs },
  actions: { alignItems: 'flex-end' },
}));
