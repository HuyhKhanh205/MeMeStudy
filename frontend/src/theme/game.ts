/**
 * Token cho Style A – Game hoá (Figma: MeMeStudy › Foundations & Components › Color palette).
 * Tên khớp với biến `game/*` trong Figma; phần `gradients`/`shadows` lấy từ các component Game/*.
 */
export const gameColors = {
  sky: '#4fb3f6',
  skyLight: '#cdebff',
  grass: '#7cc95a',
  grassDark: '#4e9a3a',
  wood: '#b8743a',
  woodDark: '#7a4a22',
  woodLight: '#f3ddb8',
  orange: '#f7931e',
  orangeDark: '#c9650a',
  cream: '#fff6e3',
  green: '#3fc380',
  greenDark: '#26985e',
  red: '#f0566b',
  redDark: '#c33549',
  purple: '#a67ce8',
  ocean: '#1e8fd8',
  oceanDeep: '#0b4f95',
  ink: '#4a2a10',
  navy: '#1d4ed8',
  yellow: '#ffc93c',
  mint: '#dff6e4',
  lilac: '#efe4ff',
  peach: '#fff0d6',
  // Màu phụ dùng trong các frame A3/A4
  inkMuted: '#8a6a4a',
  boardBorder: '#c98a4b',
  boardShadow: '#8b5426',
  boardFill: 'rgba(255,246,227,0.97)',
  audioCard: '#dcefff',
  waveActive: '#2f6fd6',
  waveIdle: '#9cc6f5',
  bubbleBorder: '#bfe0ff',
  chipBorder: '#f3c88a',
  reviewFill: '#ffe4e8',
  white: '#ffffff',
} as const;

/** Gradient trên→dưới (`bg-gradient-to-b`) của từng thành phần. */
export const gameGradients = {
  oceanScreen: ['#47bdf5', '#0b5fa8'],
  sunnyScreen: ['#ffd36b', '#fff5d6'],
  orangeButton: ['#ffb547', '#f7861e'],
  timerPill: ['#ff8a3d', '#e8590c'],
  blueCircle: ['#5b8def', '#1d4ed8'],
  redCircle: ['#ff7d8e', '#e8475e'],
  greenAnswer: ['#5fdb97', '#2fb872'],
  redAnswer: ['#ff7d8e', '#e8475e'],
  stepDone: ['#7ce3a6', '#2fb872'],
  stepCurrent: ['#ffe070', '#ffb800'],
  infoBar: ['#fff6e3', '#f3ddb8'],
  woodLabel: ['#c98a4b', '#9a5e2a'],
} as const satisfies Record<string, readonly [string, string]>;

/** Bóng "3D" (offset cứng) + bóng mờ, dùng prop `boxShadow` của React Native. */
export const gameShadows = {
  orangeButton: '0px 6px 0px 0px #b25a08, 0px 12px 18px 0px rgba(0,0,0,0.18)',
  greenAnswer: '0px 5px 0px 0px #1e8a52, 0px 10px 14px 0px rgba(0,0,0,0.15)',
  redAnswer: '0px 5px 0px 0px #b02a40, 0px 10px 14px 0px rgba(0,0,0,0.15)',
  blueAnswer: '0px 5px 0px 0px #173a9e, 0px 10px 14px 0px rgba(0,0,0,0.15)',
  yellowAnswer: '0px 5px 0px 0px #b27d00, 0px 10px 14px 0px rgba(0,0,0,0.15)',
  circle: '0px 3px 0px 0px #173a9e',
  board: '0px 6px 0px 0px #8b5426, 0px 14px 20px 0px rgba(0,0,0,0.14)',
  infoBar: '0px 4px 0px 0px #8b5426',
  woodLabel: '0px 3px 0px 0px #5e3515',
  speechBubble: '0px 4px 10px 0px rgba(29,78,216,0.15)',
  playInner: '0px 2px 0px 0px rgba(201,101,10,0.6)',
  rewardPill: '0px 3px 0px 0px #c9650a',
} as const;

/** Font của Style A — được nạp trong App.tsx bằng @expo-google-fonts. */
export const gameFonts = {
  display: 'Baloo2_800ExtraBold',
  bodyExtraBold: 'Nunito_800ExtraBold',
  bodyBold: 'Nunito_700Bold',
} as const;
