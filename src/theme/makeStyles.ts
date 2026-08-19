import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import type { Theme } from './types';

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * Creates a themed stylesheet hook.
 *
 *   const useStyles = makeStyles((t) => ({ box: { backgroundColor: t.colors.surface } }));
 *   ...
 *   const styles = useStyles();
 *
 * Styles are memoised per theme object, so switching light/dark (or skins)
 * rebuilds them exactly once.
 */
export function makeStyles<T extends NamedStyles>(build: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(build(theme)), [theme]);
  };
}
