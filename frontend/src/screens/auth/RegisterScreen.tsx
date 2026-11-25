import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, YStack } from 'tamagui';
import Button from '../../components/Button';
import Emoji from '../../components/Emoji';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/http';
import { colors, radius, spacing, typography } from '../../theme';
import type { Role } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  fullName?: string;
  username?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>('USER');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = 'Vui lòng nhập họ tên.';
    if (username.trim().length < 3) next.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
    if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (confirm !== password) next.confirm = 'Mật khẩu nhập lại không khớp.';
    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim(),
        password,
        role,
      });
    } catch (e) {
      setSubmitError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentStyle={styles.content}>
        <YStack gap={spacing.xs}>
          <Text
            fontSize={typography.label.fontSize}
            fontWeight={typography.label.fontWeight}
            color={colors.text}
          >
            Đăng ký với tư cách
          </Text>
          <View style={styles.roleTabsRow}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: role === 'USER' }}
              onPress={() => setRole('USER')}
              style={[
                styles.roleTabBtn,
                role === 'USER' && styles.roleTabBtnActive,
              ]}
            >
              <Emoji name="graduationCap" size={20} />
              <Text
                fontSize={typography.label.fontSize}
                fontWeight="700"
                color={role === 'USER' ? colors.white : colors.text}
              >
                Học sinh
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: role === 'TEACHER' }}
              onPress={() => setRole('TEACHER')}
              style={[
                styles.roleTabBtn,
                role === 'TEACHER' && styles.roleTabBtnActive,
              ]}
            >
              <Emoji name="books" size={20} />
              <Text
                fontSize={typography.label.fontSize}
                fontWeight="700"
                color={role === 'TEACHER' ? colors.white : colors.text}
              >
                Giáo viên
              </Text>
            </Pressable>
          </View>
        </YStack>

        <TextField
          label="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          error={errors.fullName}
        />
        <TextField
          label="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          error={errors.username}
        />
        <TextField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        <TextField
          label="Nhập lại mật khẩu"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          error={errors.confirm}
          onSubmitEditing={handleSubmit}
        />

        {submitError ? (
          <Text
            fontSize={typography.body.fontSize}
            fontWeight={typography.body.fontWeight}
            color={colors.danger}
          >
            {submitError}
          </Text>
        ) : null}

        <Button
          title={role === 'USER' ? 'Đăng ký tài khoản Học sinh' : 'Đăng ký tài khoản Giáo viên'}
          onPress={handleSubmit}
          loading={submitting}
        />
        <Button title="Đã có tài khoản? Đăng nhập" variant="ghost" onPress={navigation.goBack} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
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
