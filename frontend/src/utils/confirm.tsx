import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Emoji from '../components/Emoji';
import { WoodLabel } from '../components/game';
import { gameFonts } from '../theme';

interface DialogOptions {
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  hideCancel?: boolean;
}

interface DialogRequest extends DialogOptions {
  title: string;
  message: string;
  resolve: (ok: boolean) => void;
}

let listener: ((req: DialogRequest) => void) | null = null;

/**
 * Hiển thị hộp thoại xác nhận (Có / Không) ngay BÊN TRONG màn hình điện thoại (không dùng window.confirm của trình duyệt).
 */
export function confirm(
  title: string,
  message: string,
  { confirmText = 'Đồng ý', cancelText = 'Hủy', destructive = false }: DialogOptions = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    if (listener) {
      listener({
        title,
        message,
        confirmText,
        cancelText,
        destructive,
        hideCancel: false,
        resolve,
      });
    } else {
      resolve(true);
    }
  });
}

/**
 * Hiển thị hộp thoại thông báo (1 nút Đã hiểu / Đóng) ngay BÊN TRONG màn hình điện thoại (không dùng window.alert của trình duyệt).
 */
export function showAlert(
  title: string,
  message: string,
  confirmText = 'Đã hiểu',
): Promise<void> {
  return new Promise((resolve) => {
    if (listener) {
      listener({
        title,
        message,
        confirmText,
        hideCancel: true,
        resolve: () => resolve(),
      });
    } else {
      resolve();
    }
  });
}

/**
 * Component gắn ở cấp cao nhất trong App.tsx để hiển thị popup thông báo/xác nhận bên trong khung điện thoại.
 */
export function AppDialogHost() {
  const [queue, setQueue] = useState<DialogRequest[]>([]);

  useEffect(() => {
    listener = (req) => {
      setQueue((prev) => [...prev, req]);
    };
    return () => {
      listener = null;
    };
  }, []);

  const current = queue[0] ?? null;

  const handleClose = (result: boolean) => {
    if (!current) return;
    setQueue((prev) => prev.slice(1));
    current.resolve(result);
  };

  if (!current) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => handleClose(false)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => handleClose(false)}
      >
        <Pressable style={styles.card} onPress={() => {}}>
          <WoodLabel text={current.title} fontSize={16} />

          <View style={styles.mascotWrap}>
            <Emoji name="owl" size={58} />
          </View>

          <Text style={styles.messageText}>{current.message}</Text>

          <View style={styles.actionsRow}>
            {!current.hideCancel && (
              <Pressable
                accessibilityRole="button"
                onPress={() => handleClose(false)}
                style={({ pressed }) => [
                  styles.btn,
                  styles.cancelBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.cancelBtnText}>{current.cancelText ?? 'Hủy'}</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => handleClose(true)}
              style={({ pressed }) => [
                styles.btn,
                current.destructive ? styles.dangerBtn : styles.confirmBtn,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.confirmBtnText}>{current.confirmText ?? 'Đồng ý'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fffdf8',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#fed7aa',
    padding: 18,
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 4px 0px 0px #fb923c',
  },
  mascotWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff0d6',
    borderWidth: 2,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  cancelBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#475569',
  },
  confirmBtn: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
    boxShadow: '0px 3px 0px 0px #1e40af',
  },
  dangerBtn: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    boxShadow: '0px 3px 0px 0px #b91c1c',
  },
  confirmBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#ffffff',
  },
});
