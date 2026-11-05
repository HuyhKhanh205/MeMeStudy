import { LinearGradient } from 'expo-linear-gradient';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { gameFonts, gameGradients } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pulse } from '../motion';
import StarIcon from './StarIcon';

interface Props {
  total: number;
  /** Chỉ số câu hiện tại (0-based). */
  current: number;
  isAnswered: (index: number) => boolean;
  onSelect: (index: number) => void;
  /** Số bước hiển thị cùng lúc (Figma: 5). */
  windowSize?: number;
}

/** Figma "Steps" ở A3: ✓ đã làm, vàng = câu hiện tại, xanh = chưa làm, ngôi sao ở cuối. */
export default function StepProgress({ total, current, isAnswered, onSelect, windowSize = 5 }: Props) {
  const size = Math.min(windowSize, total);
  const start = Math.max(0, Math.min(current - Math.floor(size / 2), total - size));
  const indexes = Array.from({ length: size }, (_, i) => start + i);

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {indexes.map((index, i) => {
        const state = index === current ? 'current' : isAnswered(index) ? 'done' : 'todo';
        const colors =
          state === 'current'
            ? gameGradients.stepCurrent
            : state === 'done'
              ? gameGradients.stepDone
              : gameGradients.blueCircle;
        // Đoạn nối sau một câu đã làm thì tô xanh.
        const prevDone = i > 0 && index - 1 !== current && isAnswered(index - 1);
        return (
          <Fragment key={index}>
            {i > 0 ? <View style={[styles.connector, prevDone && styles.connectorDone]} /> : null}
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={`Câu ${index + 1}`}
              accessibilityState={{ selected: state === 'current' }}
              onPress={() => onSelect(index)}
              hitSlop={4}
            >
              {/* Câu đang làm phập phồng nhẹ để dễ nhận ra. */}
              <Pulse active={state === 'current'} scale={1.12} duration={1100}>
                <LinearGradient colors={colors} style={styles.step}>
                  {state === 'done' ? (
                    <Ionicons name="checkmark-sharp" size={17} color="#ffffff" />
                  ) : (
                    <Text style={[styles.number, state === 'current' && styles.numberCurrent]}>
                      {index + 1}
                    </Text>
                  )}
                </LinearGradient>
              </Pulse>
            </Pressable>
          </Fragment>
        );
      })}
      <View style={styles.connectorEnd} />
      <StarIcon size={28} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: gameFonts.display,
    fontSize: 15,
    lineHeight: 20,
    color: '#ffffff',
  },
  numberCurrent: {
    color: '#7a4a00',
  },
  connector: {
    width: 12,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  connectorDone: {
    backgroundColor: '#2fb872',
  },
  connectorEnd: {
    width: 8,
    height: 6,
  },
});
