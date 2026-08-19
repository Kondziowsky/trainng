import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Button, Card, ScreenScroll, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthProvider';
import { makeStyles, SKINS, useTheme, useThemeContext, type ThemeMode } from '@/theme';

const MODES: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { mode, setMode, skinId, setSkinId } = useThemeContext();
  const { user, signOut } = useAuth();

  return (
    <ScreenScroll edges={['bottom']}>
      <View style={styles.section}>
        <Text variant="label" color="textSecondary">
          APPEARANCE
        </Text>
        <Card padded={false} style={styles.segmented}>
          {MODES.map((option) => {
            const selected = mode === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMode(option.value)}
                style={({ pressed }) => [
                  styles.segment,
                  selected && styles.segmentSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={selected ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text variant="caption" color={selected ? 'primary' : 'textSecondary'}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </Card>
      </View>

      {SKINS.length > 1 ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary">
            THEME
          </Text>
          <Card padded={false} style={styles.segmented}>
            {SKINS.map((skin) => {
              const selected = skinId === skin.id;
              return (
                <Pressable
                  key={skin.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setSkinId(skin.id)}
                  style={({ pressed }) => [
                    styles.segment,
                    selected && styles.segmentSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text variant="caption" color={selected ? 'primary' : 'textSecondary'}>
                    {skin.label}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text variant="label" color="textSecondary">
          ACCOUNT
        </Text>
        <Card>
          <Text variant="body" color="textSecondary">
            {user?.email ?? 'Signed in'}
          </Text>
        </Card>
        <Button label="Sign out" variant="secondary" fullWidth onPress={() => void signOut()} />
      </View>
    </ScreenScroll>
  );
}

const useStyles = makeStyles((t) => ({
  section: { gap: t.spacing.sm },
  segmented: { flexDirection: 'row', padding: t.spacing.xs, gap: t.spacing.xs },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
  },
  segmentSelected: { backgroundColor: t.colors.primarySoft },
  pressed: { opacity: 0.7 },
}));
