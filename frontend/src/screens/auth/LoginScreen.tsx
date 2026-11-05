import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Emoji from '../../components/Emoji';
import { Float, Pulse } from '../../components/motion';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/http';
import { colors, spacing, typography } from '../../theme';
import { config } from '../../utils/config';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login({ username: username.trim(), password });
    } catch (e) {
      setError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={styles.content}>
        <View style={styles.header}>
          <Float style={styles.mascot} distance={8}>
            <Emoji name="owl" size={104} />
          </Float>
          <View style={styles.titleRow}>
            {/* ✨ lấp lánh lệch nhịp hai bên tên app. */}
            <Pulse scale={1.25} duration={1400}>
              <Emoji name="sparkles" size={28} />
            </Pulse>
            <Text style={styles.title}>MeMeStudy</Text>
            <Pulse scale={1.25} duration={1700}>
              <Emoji name="sparkles" size={28} />
            </Pulse>
          </View>
          <Text style={styles.subtitle}>Đăng nhập để bắt đầu làm bài thi</Text>
        </View>

        <TextField
          label="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          textContentType="username"
          autoComplete="username"
          returnKeyType="next"
        />
        <TextField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Đăng nhập" onPress={handleSubmit} loading={submitting} />
        <Button
          title="Chưa có tài khoản? Đăng ký"
          variant="ghost"
          onPress={() => navigation.navigate('Register')}
        />

        {config.useMock ? (
          <Text style={styles.hint}>
            Chế độ mock — tài khoản: user / 123456 hoặc admin / 123456
          </Text>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  mascot: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
