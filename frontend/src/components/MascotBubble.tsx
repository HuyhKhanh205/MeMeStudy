import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface MascotBubbleProps {
  type?: 'owl' | 'octopus';
  message: string;
  style?: StyleProp<ViewStyle>;
  reverse?: boolean;
}

export const MascotBubble: React.FC<MascotBubbleProps> = ({
  type = 'owl',
  message,
  style,
  reverse = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        reverse && styles.containerReverse,
        style,
      ]}
    >
      {/* Nhân vật Mascot vẽ bằng vector & icon tinh xảo */}
      {type === 'owl' ? (
        <View style={styles.owlWrapper}>
          {/* Mũ cử nhân */}
          <View style={styles.gradCap}>
            <View style={styles.gradCapDiamond} />
            <View style={styles.gradCapTassel} />
          </View>
          {/* Thân cú */}
          <View style={styles.owlBody}>
            {/* Đôi mắt to tri thức */}
            <View style={styles.owlEyeLeft}>
              <View style={styles.owlPupil} />
            </View>
            <View style={styles.owlEyeRight}>
              <View style={styles.owlPupil} />
            </View>
            {/* Mỏ cam */}
            <View style={styles.owlBeak} />
            {/* Bụng trắng */}
            <View style={styles.owlBelly} />
          </View>
        </View>
      ) : (
        <View style={styles.octopusWrapper}>
          {/* Đầu bạch tuộc hồng */}
          <View style={styles.octopusHead}>
            <View style={styles.octopusEyeLeft}>
              <View style={styles.octopusPupil} />
            </View>
            <View style={styles.octopusEyeRight}>
              <View style={styles.octopusPupil} />
            </View>
            <View style={styles.octopusMouth} />
          </View>
          {/* Xúc tu */}
          <View style={styles.tentaclesRow}>
            <View style={styles.tentacle} />
            <View style={[styles.tentacle, { height: 14 }]} />
            <View style={[styles.tentacle, { height: 16 }]} />
            <View style={[styles.tentacle, { height: 14 }]} />
            <View style={styles.tentacle} />
          </View>
        </View>
      )}

      {/* Bong bóng lời thoại (Speech Bubble) */}
      <View style={styles.bubbleWrapper}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
        {/* Đuôi bong bóng */}
        <View
          style={[
            styles.tail,
            reverse ? styles.tailRight : styles.tailLeft,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  containerReverse: {
    flexDirection: 'row-reverse',
  },
  // Mascot Cú Xanh
  owlWrapper: {
    width: 68,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradCap: {
    position: 'absolute',
    top: 2,
    zIndex: 3,
    alignItems: 'center',
  },
  gradCapDiamond: {
    width: 32,
    height: 12,
    backgroundColor: '#1E272C',
    borderRadius: 2,
    transform: [{ rotate: '-3deg' }],
  },
  gradCapTassel: {
    position: 'absolute',
    right: -2,
    top: 5,
    width: 3,
    height: 10,
    backgroundColor: '#F39C12',
    borderRadius: 1.5,
  },
  owlBody: {
    width: 52,
    height: 52,
    backgroundColor: '#3498DB',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2980B9',
    marginTop: 10,
    position: 'relative',
  },
  owlEyeLeft: {
    position: 'absolute',
    top: 10,
    left: 8,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2C3E50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  owlEyeRight: {
    position: 'absolute',
    top: 10,
    right: 8,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2C3E50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  owlPupil: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A252F',
  },
  owlBeak: {
    position: 'absolute',
    top: 24,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E67E22',
    zIndex: 4,
  },
  owlBelly: {
    position: 'absolute',
    bottom: 3,
    width: 26,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },

  // Mascot Bạch tuộc hồng
  octopusWrapper: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  octopusHead: {
    width: 44,
    height: 38,
    backgroundColor: '#FF6B8B',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E8436E',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  octopusEyeLeft: {
    position: 'absolute',
    top: 10,
    left: 8,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  octopusEyeRight: {
    position: 'absolute',
    top: 10,
    right: 8,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  octopusPupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2C3E50',
  },
  octopusMouth: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#A61E4D',
  },
  tentaclesRow: {
    flexDirection: 'row',
    marginTop: -4,
  },
  tentacle: {
    width: 7,
    height: 12,
    backgroundColor: '#FF6B8B',
    borderRadius: 4,
    marginHorizontal: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#E8436E',
  },

  // Bong bóng lời thoại
  bubbleWrapper: {
    flex: 1,
    marginLeft: 12,
    position: 'relative',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D4E6F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleText: {
    color: '#2C3E50',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  tailLeft: {
    left: -8,
    top: 14,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  tailRight: {
    right: -8,
    top: 14,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
});

