/**
 * Sprout-inspired green finance color palette
 * Clean, minimal, premium design tokens
 */

export const palette = {
    // Primary greens (vibrant sprout greens)
    green50: '#EAFFF0',
    green100: '#D0F5DC',
    green200: '#A8EDBC',
    green300: '#6FE094',
    green400: '#4CD964',
    green500: '#34C759',
    green600: '#2DB84D',
    green700: '#249A3F',
    green800: '#1B7A31',
    green900: '#125A23',

    // Mint accents
    mint50: '#F0FFF4',
    mint100: '#C6F6D5',
    mint200: '#9AE6B4',
    mint300: '#68D391',
    mint400: '#48BB78',
    mint500: '#38A169',

    // Sage tones
    sage50: '#F7FFF7',
    sage100: '#E8F5E9',
    sage200: '#C8E6C9',
    sage300: '#A5D6A7',
    sage400: '#81C784',

    // Neutrals (softer, warmer)
    white: '#FFFFFF',
    gray50: '#FAFBFC',
    gray100: '#F5F6F8',
    gray200: '#EBEDF0',
    gray300: '#DFE1E6',
    gray400: '#B3B9C4',
    gray500: '#8993A4',
    gray600: '#6B778C',
    gray700: '#505F79',
    gray800: '#344563',
    gray900: '#172B4D',
    black: '#091E42',

    // Semantic
    red50: '#FFF5F5',
    red400: '#FC8181',
    red500: '#F56565',
    orange50: '#FFFAF0',
    orange400: '#F6AD55',
    orange500: '#ED8936',
    blue50: '#EBF8FF',
    blue400: '#63B3ED',
    blue500: '#4299E1',
    purple50: '#FAF5FF',
    purple400: '#B794F4',
    purple500: '#9F7AEA',
    yellow50: '#FFFFF0',
    yellow400: '#F6E05E',
    yellow500: '#ECC94B',
    pink50: '#FFF5F7',
    pink400: '#F687B3',
    teal50: '#E6FFFA',
    teal400: '#4FD1C5',
} as const;

export const colors = {
    // Primary
    primary: palette.green400,
    primaryLight: palette.green100,
    primaryDark: palette.green700,
    primaryBg: palette.green50,
    primaryGradientStart: '#4CD964',
    primaryGradientEnd: '#2DB84D',

    // Secondary
    secondary: palette.mint400,
    secondaryLight: palette.mint100,
    secondaryDark: palette.mint500,

    // Background
    background: '#F8FBF8',
    backgroundSecondary: palette.white,
    backgroundTertiary: palette.gray100,
    surface: palette.white,
    surfaceElevated: palette.white,

    // Text
    textPrimary: palette.gray900,
    textSecondary: palette.gray600,
    textTertiary: palette.gray500,
    textInverse: palette.white,
    textOnPrimary: palette.white,
    textGreen: palette.green500,

    // Border
    border: palette.gray200,
    borderLight: palette.gray100,
    borderFocused: palette.green400,

    // Semantic
    success: palette.green500,
    successBg: palette.green50,
    warning: palette.orange500,
    warningBg: palette.orange50,
    error: palette.red500,
    errorBg: palette.red50,
    info: palette.blue500,
    infoBg: palette.blue50,

    // Income / Expense
    income: palette.green500,
    incomeBg: palette.green50,
    expense: palette.red500,
    expenseBg: palette.red50,

    // Category colors
    categoryColors: [
        palette.green400,
        palette.blue400,
        palette.orange400,
        palette.purple400,
        palette.red400,
        palette.teal400,
        palette.pink400,
        palette.yellow400,
        palette.mint300,
        palette.sage300,
    ],

    // Tab bar
    tabBarActive: palette.green500,
    tabBarInactive: palette.gray400,
    tabBarBg: palette.white,

    // FAB
    fab: palette.green400,
    fabIcon: palette.white,

    // Overlay
    overlay: 'rgba(0,0,0,0.4)',
    overlayLight: 'rgba(0,0,0,0.08)',

    // Card
    cardBg: palette.white,
    cardBorder: palette.gray100,
    cardShadow: 'rgba(0,0,0,0.06)',
} as const;
