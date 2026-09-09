export const tokens = {
  colors: {
    primary: '#E8A33D',
    primaryPressed: '#D2891E',
    onPrimary: '#1A1A1A',
    secondary: '#8A6A52',
    onSecondary: '#FFFFFF',
    tertiary: '#4A6B5A',
    error: '#B3261E',
    text: '#1A1A1A',
    textMuted: '#9B9389',
    surface: '#FAF7F2',
    surfaceContainer: '#F5F2ED',
    surfaceContainerHigh: '#EFEBE4',
    surfaceRaised: '#FFFFFF',
    divider: '#EFE8E0',
    shadow: '#3B2F24',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    cardPadding: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radii: {
    input: 16,
    card: 20,
    pill: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#3B2F24',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#3B2F24',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
  },

  fonts: {
    heroMobile: {
      family: 'InstrumentSerif-Regular',
      size: 48,
      lineHeight: 1.1,
      letterSpacing: -0.72, // -1.5% of 48
    },
    displayLarge: {
      family: 'InstrumentSerif-Regular',
      size: 28,
      lineHeight: 1.1,
      letterSpacing: -0.28, // -1% of 28
    },
    displayMedium: {
      family: 'InstrumentSerif-Regular',
      size: 24,
      lineHeight: 1.2,
      letterSpacing: -0.24, // -1% of 24
    },
    bodyLarge: {
      family: 'Manrope-Regular',
      size: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    // From tokens.css (--type-landing-body). Used for prominent empty-state headings.
    landingBody: {
      family: 'Manrope-SemiBold',
      size: 18,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodySmall: {
      family: 'Manrope-Regular',
      size: 14,
      lineHeight: 1.5,
      letterSpacing: 0.07, // +0.5% of 14
    },
    labelButton: {
      family: 'Manrope-SemiBold',
      size: 16,
      lineHeight: 1.0,
      letterSpacing: 0.08, // +0.5% of 16
    },
    labelSmall: {
      family: 'Manrope-Medium',
      size: 13,
      lineHeight: 1.4,
      letterSpacing: 0.26, // +2% of 13
    },
    metadata: {
      family: 'Manrope-Medium',
      size: 12,
      lineHeight: 1.4,
      letterSpacing: 0.36, // +3% of 12
    },
    overline: {
      family: 'Manrope-SemiBold',
      size: 11,
      lineHeight: 1.4,
      letterSpacing: 0.88, // +8% of 11
    },
  },

  tapTarget: 44,
} as const;

export type Tokens = typeof tokens;
