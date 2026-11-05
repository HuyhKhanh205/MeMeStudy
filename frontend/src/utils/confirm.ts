import { Alert, Platform } from 'react-native';

/** Hộp thoại xác nhận chạy được cả mobile (Alert) và web (window.confirm — Alert không có nút trên web). */
export function confirm(
  title: string,
  message: string,
  { confirmText = 'Đồng ý', cancelText = 'Hủy', destructive = false } = {},
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}`) ?? true);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmText,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
