/**
 * Microsoft Fluent Emoji (kiểu 3D, PNG 256×256) — giấy phép MIT, © Microsoft Corporation.
 * Nguồn: https://github.com/microsoft/fluentui-emoji · chi tiết trong frontend/CREDITS.md.
 */
export const emojiAssets = {
  owl: require('../../assets/emoji/owl.png'),
  octopus: require('../../assets/emoji/octopus.png'),
  tropicalFish: require('../../assets/emoji/tropical_fish.png'),
  fish: require('../../assets/emoji/fish.png'),
  coral: require('../../assets/emoji/coral.png'),
  spiralShell: require('../../assets/emoji/spiral_shell.png'),
  herb: require('../../assets/emoji/herb.png'),
  graduationCap: require('../../assets/emoji/graduation_cap.png'),
  memo: require('../../assets/emoji/memo.png'),
  trophy: require('../../assets/emoji/trophy.png'),
  books: require('../../assets/emoji/books.png'),
  locked: require('../../assets/emoji/locked.png'),
  redQuestionMark: require('../../assets/emoji/red_question_mark.png'),
  clipboard: require('../../assets/emoji/clipboard.png'),
  partyPopper: require('../../assets/emoji/party_popper.png'),
  hourglass: require('../../assets/emoji/hourglass_not_done.png'),
  house: require('../../assets/emoji/house.png'),
  star: require('../../assets/emoji/star.png'),
  sparkles: require('../../assets/emoji/sparkles.png'),
} as const;

export type EmojiName = keyof typeof emojiAssets;
