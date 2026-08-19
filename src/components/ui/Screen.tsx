import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme';

export type ScreenProps = ViewProps & {
  /** Which safe-area edges to inset. Tab screens leave `bottom` to the tab bar. */
  edges?: readonly Edge[];
};

/** Page canvas: applies the themed background and safe-area insets. */
export function Screen({ edges = ['top'], style, ...rest }: ScreenProps) {
  const styles = useStyles();
  return <SafeAreaView edges={edges} style={[styles.screen, style]} {...rest} />;
}

export type ScreenScrollProps = ScrollViewProps & { edges?: readonly Edge[] };

/** Scrollable variant with sensible content padding. */
export function ScreenScroll({
  edges = ['top'],
  contentContainerStyle,
  ...rest
}: ScreenScrollProps) {
  const styles = useStyles();
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, contentContainerStyle]}
        {...rest}
      />
    </SafeAreaView>
  );
}

/** Vertical stack with a consistent gap. */
export function VStack({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View style={[styles.stack, style]} {...rest} />;
}

const useStyles = makeStyles((t) => ({
  screen: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxl,
    gap: t.spacing.lg,
  },
  stack: {
    gap: t.spacing.md,
  },
}));
