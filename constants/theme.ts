/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#FC5F67';
const tintColorDark = '#FC5F67';

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorLight,
    icon: '#CCCCCC',
    tabIconDefault: '#000000',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#000000',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  regular: 'Area-Regular',
  bold: 'Area-Bold',
  semiBold: 'Area-SemiBold',
  thin: 'Area-Thin',
};

export const Typography = {
  h1: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontFamily: Fonts.thin,
    fontSize: 12,
    lineHeight: 16,
  },
};
