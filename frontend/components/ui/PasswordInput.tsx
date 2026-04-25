import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextInput, TextInputProps } from 'react-native';
import { AppInput } from './AppInput';
import { COLORS } from '@/constants/colors';
import { FONT_SIZE } from '@/constants/typography';

interface PasswordInputProps extends Omit<
  React.ComponentProps<typeof AppInput>,
  'secureTextEntry'
> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  onBlur?: TextInputProps['onBlur'];
}

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  function PasswordInput(
    {
      label = 'Password',
      value,
      onChangeText,
      placeholder = 'Enter your password',
      error,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    return (
      <View style={styles.wrapper}>
        <AppInput
          ref={ref}
          label={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!visible}
          error={error}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
          onBlur={onBlur}
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setVisible((v) => !v)}
          hitSlop={12}
        >
          <Text style={styles.eyeText}>{visible ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  eyeText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
