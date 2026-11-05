export const colors = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#EEF2FF',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
