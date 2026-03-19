import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppInput } from './AppInput';
import { COLORS } from '@/constants/colors';
import { FONT_SIZE } from '@/constants/typography';

interface PasswordInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

export function PasswordInput({
  label = 'Password',
  value,
  onChangeText,
  placeholder = 'Enter your password',
  error,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <AppInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!visible}
        error={error}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
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
}

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
