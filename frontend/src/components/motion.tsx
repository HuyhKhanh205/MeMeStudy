/**
 * Bộ chuyển động dùng chung (react-native-reanimated).
 * Mọi hiệu ứng lặp đều tắt khi người dùng bật "Giảm chuyển động" (useReducedMotion) —
 * khi đó chỉ hiển thị trạng thái tĩnh.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type WrapperProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Trễ (ms) trước khi bắt đầu — để các vật không chuyển động cùng nhịp. */
  delay?: number;
};

const smooth = Easing.inOut(Easing.sin);

/** Nhấp nhô lên xuống liên tục — dùng cho mascot. */
export function Float({ children, style, delay = 0, distance = 8, duration = 1800 }: WrapperProps & { distance?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration: duration / 2, easing: smooth }),
          withTiming(0, { duration: duration / 2, easing: smooth }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(y);
  }, [reduced, delay, distance, duration, y]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Bơi qua lại nhẹ theo chiều ngang (kèm nhấp nhô) — dùng cho cá. */
export function Swim({ children, style, delay = 0, distance = 20, duration = 3600 }: WrapperProps & { distance?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: smooth }), -1, true));
    return () => cancelAnimation(t);
  }, [reduced, delay, duration, t]);
  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: (t.value - 0.5) * 2 * distance },
      { translateY: Math.sin(t.value * Math.PI * 2) * 4 },
    ],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Lắc lư quanh gốc (mép dưới) — dùng cho rong biển, san hô. */
export function Sway({ children, style, delay = 0, angle = 6, duration = 2600 }: WrapperProps & { angle?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const r = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    r.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(angle, { duration: duration / 2, easing: smooth }),
          withTiming(-angle, { duration, easing: smooth }),
          withTiming(0, { duration: duration / 2, easing: smooth }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(r);
  }, [reduced, delay, angle, duration, r]);
  const animated = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[{ transformOrigin: 'bottom' }, style, animated]}>{children}</Animated.View>;
}

/** Trôi lên rồi mờ dần, lặp lại — dùng cho bong bóng nước. */
export function RiseFade({ children, style, delay = 0, distance = 140, duration = 5000 }: WrapperProps & { distance?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })), -1),
    );
    return () => cancelAnimation(t);
  }, [reduced, delay, duration, t]);
  const animated = useAnimatedStyle(() => ({
    opacity: t.value < 0.1 ? t.value * 10 : 1 - (t.value - 0.1) / 0.9,
    transform: [{ translateY: -t.value * distance }, { translateX: Math.sin(t.value * Math.PI * 3) * 6 }],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Nảy từ nhỏ lên kích thước thật (spring). Đổi `key` của component để nảy lại. */
export function PopIn({ children, style, delay = 0 }: WrapperProps) {
  const reduced = useReducedMotion();
  const s = useSharedValue(reduced ? 1 : 0.2);
  const o = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    s.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 180 }));
    o.value = withDelay(delay, withTiming(1, { duration: 180 }));
  }, [reduced, delay, s, o]);
  const animated = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Phập phồng liên tục khi `active` — gây chú ý (đồng hồ sắp hết, nút đang bật, bước hiện tại). */
export function Pulse({ children, style, active = true, scale = 1.08, duration = 900 }: Omit<WrapperProps, 'delay'> & { active?: boolean; scale?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  useEffect(() => {
    if (reduced || !active) {
      cancelAnimation(s);
      s.value = withTiming(1, { duration: 150 });
      return;
    }
    s.value = withRepeat(
      withSequence(
        withTiming(scale, { duration: duration / 2, easing: smooth }),
        withTiming(1, { duration: duration / 2, easing: smooth }),
      ),
      -1,
    );
    return () => cancelAnimation(s);
  }, [reduced, active, scale, duration, s]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Nảy một nhịp mỗi khi `trigger` chuyển sang true (icon tab được chọn, đáp án vừa chọn). */
export function Bounce({ children, style, trigger, scale = 1.15 }: Omit<WrapperProps, 'delay'> & { trigger: boolean; scale?: number }) {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  useEffect(() => {
    if (reduced || !trigger) return;
    s.value = withSequence(withTiming(scale, { duration: 120 }), withSpring(1, { damping: 6, stiffness: 220 }));
  }, [reduced, trigger, scale, s]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Hiệu ứng nhấn: co lại khi giữ, nảy về khi thả. Gắn `style` vào Animated view bọc nút. */
export function usePressScale(pressedScale = 0.95) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return {
    style,
    onPressIn: () => {
      s.value = withTiming(pressedScale, { duration: 90 });
    },
    onPressOut: () => {
      s.value = withSpring(1, { damping: 8, stiffness: 260 });
    },
  };
}

/** Số đếm tăng dần từ 0 tới `value` (chạy trên JS, chỉ vài trăm ms). */
export function CountUp({
  value,
  duration = 900,
  delay = 0,
  format = (n: number) => String(Math.round(n)),
  style,
}: {
  value: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  style?: StyleProp<TextStyle>;
}) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(reduced ? value : 0);
  const frame = useRef<number | null>(null);
  useEffect(() => {
    if (reduced) {
      setCurrent(value);
      return;
    }
    let start: number | null = null;
    const timer = setTimeout(() => {
      const step = (now: number) => {
        if (start == null) start = now;
        const p = Math.min((now - start) / duration, 1);
        setCurrent(value * (1 - Math.pow(1 - p, 3))); // ease-out cubic
        if (p < 1) frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [reduced, value, duration, delay]);
  return <Text style={style}>{format(current)}</Text>;
}

/** Hiệu ứng xuất hiện lần lượt cho phần tử thứ `index` trong danh sách. */
export function listEntering(index: number) {
  return FadeInDown.delay(Math.min(index, 10) * 60).duration(320);
}

export { Animated };
