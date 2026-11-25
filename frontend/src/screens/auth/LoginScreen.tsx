import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import Button from '../../components/Button';
import Emoji from '../../components/Emoji';
import { Float, Pulse } from '../../components/motion';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/http';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type LoginRoleTab = 'STUDENT' | 'TEACHER';

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [roleTab, setRoleTab] = useState<LoginRoleTab>('STUDENT');
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRoleTab = (tab: LoginRoleTab) => {
    setRoleTab(tab);
    setError(null);
    if (tab === 'STUDENT') {
      setUsername('user');
      setPassword('123456');
    } else {
      setUsername('teacher');
      setPassword('123456');
    }
  };

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
        <YStack gap={spacing.xs} marginBottom={spacing.xs}>
          <Float style={styles.mascot} distance={8}>
            <Emoji name="owl" size={96} />
          </Float>
          <XStack alignItems="center" justifyContent="center" gap={spacing.sm}>
            {/* ✨ lấp lánh lệch nhịp hai bên tên app. */}
            <Pulse scale={1.25} duration={1400}>
              <Emoji name="sparkles" size={28} />
            </Pulse>
            <Text
              fontSize={typography.title.fontSize}
              fontWeight={typography.title.fontWeight}
              color={colors.primary}
              textAlign="center"
            >
              MeMeStudy
            </Text>
            <Pulse scale={1.25} duration={1700}>
              <Emoji name="sparkles" size={28} />
            </Pulse>
          </XStack>
          <Text
            fontSize={typography.body.fontSize}
            fontWeight={typography.body.fontWeight}
            color={colors.textMuted}
            textAlign="center"
          >
            Chọn tư cách đăng nhập để bắt đầu
          </Text>
        </YStack>

        {/* Bộ chọn tư cách đăng nhập: Học sinh hoặc Giáo viên */}
        <View style={styles.roleTabsRow}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: roleTab === 'STUDENT' }}
            onPress={() => handleSelectRoleTab('STUDENT')}
            style={[
              styles.roleTabBtn,
              roleTab === 'STUDENT' && styles.roleTabBtnActive,
            ]}
          >
            <Emoji name="graduationCap" size={22} />
            <Text
              fontSize={typography.label.fontSize}
              fontWeight="700"
              color={roleTab === 'STUDENT' ? colors.white : colors.text}
            >
              Học sinh
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: roleTab === 'TEACHER' }}
            onPress={() => handleSelectRoleTab('TEACHER')}
            style={[
              styles.roleTabBtn,
              roleTab === 'TEACHER' && styles.roleTabBtnActive,
            ]}
          >
            <Emoji name="books" size={22} />
            <Text
              fontSize={typography.label.fontSize}
              fontWeight="700"
              color={roleTab === 'TEACHER' ? colors.white : colors.text}
            >
              Giáo viên
            </Text>
          </Pressable>
        </View>

        <TextField
          label={roleTab === 'STUDENT' ? 'Tên đăng nhập Học sinh' : 'Tên đăng nhập Giáo viên'}
          value={username}
          onChangeText={setUsername}
          placeholder={roleTab === 'STUDENT' ? 'user' : 'teacher'}
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

        {error ? (
          <Text
            fontSize={typography.body.fontSize}
            fontWeight={typography.body.fontWeight}
            color={colors.danger}
          >
            {error}
          </Text>
        ) : null}

        <Button
          title={
            roleTab === 'STUDENT'
              ? 'Đăng nhập với tư cách Học sinh'
              : 'Đăng nhập với tư cách Giáo viên'
          }
          onPress={handleSubmit}
          loading={submitting}
        />
        <Button
          title="Chưa có tài khoản? Đăng ký"
          variant="ghost"
          onPress={() => navigation.navigate('Register')}
        />

        <Text
          fontSize={typography.caption.fontSize}
          fontWeight={typography.caption.fontWeight}
          color={colors.textMuted}
          textAlign="center"
        >
          {roleTab === 'STUDENT'
            ? 'Tài khoản Học sinh mẫu: user / 123456'
            : 'Tài khoản Giáo viên mẫu: teacher / 123456 (hoặc admin / 123456)'}
        </Text>
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
  mascot: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  roleTabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: 6,
    borderRadius: radius.lg,
  },
  roleTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'transparent',
  },
  roleTabBtnActive: {
    backgroundColor: colors.primary,
  },
});
