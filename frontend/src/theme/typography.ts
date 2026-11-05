import type { TextStyle } from 'react-native';

export const typography = {
  title: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  heading: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;
