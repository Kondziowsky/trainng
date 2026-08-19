import { Link, Stack } from 'expo-router';

import { Button, Screen, Text } from '@/components/ui';
import { makeStyles } from '@/theme';

export default function NotFoundScreen() {
  const styles = useStyles();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen style={styles.screen} edges={['top', 'bottom']}>
        <Text variant="title">This screen doesn&apos;t exist.</Text>
        <Link href="/" asChild>
          <Button label="Go to Today" variant="secondary" />
        </Link>
      </Screen>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.lg,
    padding: t.spacing.xl,
  },
}));
