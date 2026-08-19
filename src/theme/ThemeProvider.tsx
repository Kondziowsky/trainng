import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { DEFAULT_SKIN_ID, getSkin } from './skins';
import { elevation, radius, spacing, typography } from './tokens';
import type { ColorScheme, Theme, ThemeMode } from './types';

const STORAGE_KEY = 'trainng.theme.v1';

type StoredPreference = { mode: ThemeMode; skinId: string };

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  skinId: string;
  setSkinId: (skinId: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function parsePreference(raw: string | null): StoredPreference | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { mode, skinId } = parsed as Record<string, unknown>;
    if (!isThemeMode(mode)) return null;
    return { mode, skinId: typeof skinId === 'string' ? skinId : DEFAULT_SKIN_ID };
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [skinId, setSkinIdState] = useState<string>(DEFAULT_SKIN_ID);

  // Restore the persisted preference once on mount. Rendering with the system
  // default first avoids a blocking splash for a purely cosmetic value.
  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const stored = parsePreference(raw);
      if (cancelled || !stored) return;
      setModeState(stored.mode);
      setSkinIdState(stored.skinId);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: StoredPreference) => {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      persist({ mode: next, skinId });
    },
    [persist, skinId],
  );

  const setSkinId = useCallback(
    (next: string) => {
      setSkinIdState(next);
      persist({ mode, skinId: next });
    },
    [mode, persist],
  );

  // useColorScheme() can report null or 'unspecified' as well as light/dark;
  // anything that is not an explicit dark preference resolves to light.
  const scheme: ColorScheme =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const theme = useMemo<Theme>(() => {
    const skin = getSkin(skinId);
    return {
      skinId: skin.id,
      scheme,
      colors: skin.colors[scheme],
      spacing,
      radius,
      typography,
      elevation,
    };
  }, [scheme, skinId]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, setMode, skinId, setSkinId }),
    [theme, mode, setMode, skinId, setSkinId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside <ThemeProvider>');
  return ctx;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}
