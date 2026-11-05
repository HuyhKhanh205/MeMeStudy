import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface AudioWaveVisualizerProps {
  sentence?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  sentence = 'The cat is sleeping.',
  isPlaying = false,
  onTogglePlay,
  style,
}) => {
  // Các chiều cao của thanh sóng âm
  const waveHeights = [8, 14, 22, 12, 18, 28, 20, 16, 24, 10, 15, 20, 12, 8];

  return (
    <View style={[styles.container, style]}>
      {/* Hàng câu phát âm */}
      <Pressable onPress={onTogglePlay} style={styles.sentenceRow}>
        <Ionicons
          name={isPlaying ? 'volume-high' : 'volume-medium-outline'}
          size={18}
          color="#2980B9"
          style={styles.speakerIcon}
        />
        <Text style={styles.sentenceText}>{sentence}</Text>
      </Pressable>

      {/* Sóng âm visualizer */}
      <View style={styles.wavesRow}>
        {waveHeights.map((h, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: h,
                backgroundColor: isPlaying ? '#2980B9' : '#85C1E9',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerIcon: {
    marginRight: 6,
  },
  sentenceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2471A3',
  },
  wavesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    paddingHorizontal: 20,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

