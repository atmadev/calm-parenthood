// Centralized emotion theming (design tokens only).
// Keep views free of hardcoded per-emotion styling.

export const EmotionType = Object.freeze({
  FRUSTRATED: 'frustrated',
  IRRITATED: 'irritated',
  ANGRY: 'angry',
  FURIOUS: 'furious',
});

/**
 * @typedef {Object} EmotionTheme
 * @property {*} backgroundSource   - `require(...)` result for RN <Image>.
 * @property {string} titleColor    - Main title/emotion label color.
 * @property {string} iconColor     - Header icon stroke color.
 * @property {string} cardBg        - Emotion button background color (Home list).
 * @property {string} cardTextColor - Emotion button title color (Home list).
 * @property {string} cardSubColor  - Emotion button subtitle color (Home list).
 */

/** @type {Record<string, EmotionTheme>} */
export const EMOTION_THEME = Object.freeze({
  [EmotionType.FRUSTRATED]: {
    backgroundSource: require('./assets/bgScreenFrustrated.png'),
    titleColor: '#622626',
    iconColor: '#622626',
    cardBg: '#E9D9A8',
    cardTextColor: '#622626',
    cardSubColor: '#622626',
  },
  [EmotionType.IRRITATED]: {
    backgroundSource: require('./assets/bgScreenIrritated.png'),
    titleColor: '#622626',
    iconColor: '#FBFBFB',
    cardBg: '#C8936E',
    cardTextColor: '#FBFBFB',
    cardSubColor: '#FBFBFB',
  },
  [EmotionType.ANGRY]: {
    backgroundSource: require('./assets/bgScreenAngry.png'),
    titleColor: '#FBFBFB',
    iconColor: '#FBFBFB',
    cardBg: '#9D5354',
    cardTextColor: '#FBFBFB',
    cardSubColor: '#FBFBFB',
  },
  [EmotionType.FURIOUS]: {
    backgroundSource: require('./assets/bgScreenFurious.png'),
    titleColor: '#FBFBFB',
    iconColor: '#FBFBFB',
    cardBg: '#622626',
    cardTextColor: '#FBFBFB',
    cardSubColor: '#FBFBFB',
  },
});

export const DEFAULT_EMOTION_THEME = Object.freeze({
  backgroundSource: null,
  titleColor: '#804550',
  iconColor: '#EFEFEF',
  cardBg: '#FBFBFB',
  cardTextColor: '#804550',
  cardSubColor: '#804550',
});

export function getEmotionTheme(key) {
  if (!key) return DEFAULT_EMOTION_THEME;
  return EMOTION_THEME[key] ?? DEFAULT_EMOTION_THEME;
}

export function getEmotionBackgroundSource(key) {
  return getEmotionTheme(key).backgroundSource;
}

const RESULT_BACKGROUND = Object.freeze({
  GOOD: require('./assets/bgScreenGood.png'),
  BAD: require('./assets/bgScreenBad.png'),
});

export const CHECK_THEME_GROUP = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});

const CHECK_THEME = Object.freeze({
  [CHECK_THEME_GROUP.LIGHT]: {
    titleColor: '#FBFBFB',
    buttonBg: '#622626',
    buttonOpacity: 0.5,
  },
  [CHECK_THEME_GROUP.DARK]: {
    titleColor: '#622626',
    buttonBg: '#9D5355',
    buttonOpacity: 0.7,
  },
});

export function getCheckThemeGroup(emotionKey) {
  // Light theme used after: furious, angry.
  if (emotionKey === EmotionType.FURIOUS || emotionKey === EmotionType.ANGRY) {
    return CHECK_THEME_GROUP.LIGHT;
  }
  // Dark theme used after: irritated, frustrated (and default fallback).
  return CHECK_THEME_GROUP.DARK;
}

export function getCheckTheme(emotionKey) {
  const group = getCheckThemeGroup(emotionKey);
  return CHECK_THEME[group] ?? CHECK_THEME[CHECK_THEME_GROUP.DARK];
}

export function getBackgroundSourceFor({ screen, emotionKey }) {
  // Centralized background selection logic.
  // NOTE: `screen` is the App's screen key string (e.g. 'TIP', 'CHECK', ...).
  if (screen === 'SUCCESS') return RESULT_BACKGROUND.GOOD;
  if (screen === 'TRY_AGAIN') return RESULT_BACKGROUND.BAD;

  if (screen === 'TIP' || screen === 'CHECK') {
    return getEmotionBackgroundSource(emotionKey);
  }

  // Home/More (and others) keep their existing gradient backgrounds.
  return null;
}

export function getHeaderIconColorFor({ screen, emotionKey }) {
  // On result screens we keep the neutral header icon color for consistency.
  if (screen === 'SUCCESS' || screen === 'TRY_AGAIN') return '#EFEFEF';
  return getEmotionTheme(emotionKey).iconColor;
}

