import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Button, Input, ScreenScroll, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth/AuthProvider';
import { toUserMessage } from '@/lib/supabase/errors';
import { makeStyles } from '@/theme';

type Mode = 'sign-in' | 'sign-up';

/**
 * Deliberately minimal: email + password is all the MVP needs to exercise RLS.
 * Social/Apple/Google sign-in are out of scope but plug into the same provider.
 */
export default function SignInScreen() {
  const styles = useStyles();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        // With email confirmation enabled there is no session yet.
        setNotice('Check your inbox to confirm your address, then sign in.');
        setMode('sign-in');
      }
    } catch (cause) {
      setError(toUserMessage(cause, 'Could not sign you in.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScroll edges={['top', 'bottom']} contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <View style={styles.intro}>
          <Text variant="display">Trainng</Text>
          <Text variant="body" color="textSecondary">
            Plan your training, one day at a time.
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
        />

        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}
        {notice ? (
          <Text variant="caption" color="success">
            {notice}
          </Text>
        ) : null}

        <Button
          label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
          size="lg"
          fullWidth
          loading={submitting}
          onPress={() => void handleSubmit()}
        />

        <Button
          label={mode === 'sign-in' ? 'I need an account' : 'I already have an account'}
          variant="ghost"
          fullWidth
          onPress={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
            setError(null);
            setNotice(null);
          }}
        />
      </KeyboardAvoidingView>
    </ScreenScroll>
  );
}

const useStyles = makeStyles((t) => ({
  content: { flexGrow: 1, justifyContent: 'center', padding: t.spacing.xl },
  form: { gap: t.spacing.lg },
  intro: { gap: t.spacing.xs, marginBottom: t.spacing.lg },
}));
