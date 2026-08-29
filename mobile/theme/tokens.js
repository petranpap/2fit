// Design tokens — mirrors /docs/design.md exactly. Do not invent new values here;
// add to docs/design.md first, then reflect the change in this file.

export const colors = {
  background: '#EEF3F1', // pale sea-glass
  surface: '#FFFFFF',
  primary: '#0F6E8C', // deep Aegean blue
  secondary: '#EF8354', // vivid mandarin/citrus
  textPrimary: '#17211F',
  textSecondary: '#5B6B66',
  border: '#DDE5E1',
  danger: '#C23B3B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
};

export const radius = {
  sm: 6, // inputs, small chips
  md: 12, // cards
  lg: 20, // modals, large containers
  full: 9999, // badges, pills, tags
};

// Soft, primary-tinted shadows — never pure black.
export const shadows = {
  card: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  small: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
};

// Font families are registered by name via useFonts() in App.js.
// Archivo Expanded (Display) isn't published as a standalone Google Fonts
// package, so it's not wired up yet — these two auth screens only need
// Heading and Body.
export const fonts = {
  heading: 'Archivo_700Bold',
  headingSemiBold: 'Archivo_600SemiBold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
};

// Max ~4 distinct sizes per screen keeps hierarchy restrained.
export const typography = {
  heading: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, color: colors.textPrimary },
  subheading: { fontFamily: fonts.headingSemiBold, fontSize: 18, lineHeight: 24, color: colors.textPrimary },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  bodyStrong: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12.5, lineHeight: 18, color: colors.textSecondary, letterSpacing: 0.2 },
};
