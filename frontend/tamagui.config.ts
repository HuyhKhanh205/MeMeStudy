import { defaultConfig } from '@tamagui/config/v5';
import { createFont, createTamagui, createTokens } from 'tamagui';
import {
  colors,
  gameColors,
  gameFonts,
  radius,
  spacing,
  typography,
} from './src/theme';

/**
 * Tokens dùng chung từ `src/theme` để Tamagui và StyleSheet đồng bộ 100%
 * (không sao chép giá trị cứng thành bản thứ hai).
 */
const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...colors,
    ...gameColors,
  },
  space: {
    ...defaultConfig.tokens.space,
    ...spacing,
  },
  size: {
    ...defaultConfig.tokens.size,
    ...spacing,
  },
  radius: {
    ...defaultConfig.tokens.radius,
    ...radius,
  },
});

const headingFont = createFont({
  family: gameFonts.display,
  size: {
    1: typography.caption.fontSize,
    2: typography.label.fontSize,
    3: typography.body.fontSize,
    4: typography.heading.fontSize,
    5: typography.title.fontSize,
    caption: typography.caption.fontSize,
    label: typography.label.fontSize,
    body: typography.body.fontSize,
    heading: typography.heading.fontSize,
    title: typography.title.fontSize,
  },
  lineHeight: {
    1: typography.caption.lineHeight,
    2: typography.label.lineHeight,
    3: typography.body.lineHeight,
    4: typography.heading.lineHeight,
    5: typography.title.lineHeight,
    caption: typography.caption.lineHeight,
    label: typography.label.lineHeight,
    body: typography.body.lineHeight,
    heading: typography.heading.lineHeight,
    title: typography.title.lineHeight,
  },
  weight: {
    1: typography.caption.fontWeight,
    2: typography.label.fontWeight,
    3: typography.body.fontWeight,
    4: typography.heading.fontWeight,
    5: typography.title.fontWeight,
  },
});

const bodyFont = createFont({
  family: gameFonts.bodyBold,
  size: {
    1: typography.caption.fontSize,
    2: typography.label.fontSize,
    3: typography.body.fontSize,
    4: typography.heading.fontSize,
    5: typography.title.fontSize,
    caption: typography.caption.fontSize,
    label: typography.label.fontSize,
    body: typography.body.fontSize,
    heading: typography.heading.fontSize,
    title: typography.title.fontSize,
  },
  lineHeight: {
    1: typography.caption.lineHeight,
    2: typography.label.lineHeight,
    3: typography.body.lineHeight,
    4: typography.heading.lineHeight,
    5: typography.title.lineHeight,
    caption: typography.caption.lineHeight,
    label: typography.label.lineHeight,
    body: typography.body.lineHeight,
    heading: typography.heading.lineHeight,
    title: typography.title.lineHeight,
  },
  weight: {
    1: typography.caption.fontWeight,
    2: typography.label.fontWeight,
    3: typography.body.fontWeight,
    4: typography.heading.fontWeight,
    5: typography.title.fontWeight,
  },
});

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens,
  fonts: {
    ...defaultConfig.fonts,
    heading: headingFont,
    body: bodyFont,
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...colors,
      ...gameColors,
      backgroundHover: colors.primaryLight,
      backgroundPress: colors.primaryLight,
      backgroundFocus: colors.surface,
      color: colors.text,
      colorHover: colors.text,
      colorPress: colors.text,
      colorFocus: colors.text,
      borderColor: colors.border,
      borderColorHover: colors.primary,
      borderColorFocus: colors.primary,
      borderColorPress: colors.primaryDark,
      placeholderColor: colors.textMuted,
    },
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
    allowedStyleValues: false,
  },
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
