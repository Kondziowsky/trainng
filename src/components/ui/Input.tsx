import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export function Input({ label, error, hint, style, onFocus, onBlur, ...rest }: InputProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.primary}
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrapper: { gap: t.spacing.xs },
  label: { marginLeft: 2 },
  input: {
    minHeight: 48,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    color: t.colors.text,
    fontSize: 15,
  },
  inputFocused: { borderColor: t.colors.primary },
  inputError: { borderColor: t.colors.danger },
  helper: { marginLeft: 2 },
}));
