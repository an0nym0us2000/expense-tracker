export const fontFamily = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
} as const;

export const fontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    h3: 24,
    h2: 28,
    h1: 32,
    display: 40,
} as const;

export const lineHeight = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 26,
    xxl: 28,
    h3: 32,
    h2: 36,
    h1: 40,
    display: 48,
} as const;

export const typography = {
    displayLarge: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.display,
        lineHeight: lineHeight.display,
    },
    h1: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.h1,
        lineHeight: lineHeight.h1,
    },
    h2: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.h2,
        lineHeight: lineHeight.h2,
    },
    h3: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.h3,
        lineHeight: lineHeight.h3,
    },
    titleLarge: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xxl,
        lineHeight: lineHeight.xxl,
    },
    titleMedium: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        lineHeight: lineHeight.xl,
    },
    titleSmall: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        lineHeight: lineHeight.lg,
    },
    bodyLarge: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.lg,
        lineHeight: lineHeight.lg,
    },
    bodyMedium: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        lineHeight: lineHeight.md,
    },
    bodySmall: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        lineHeight: lineHeight.sm,
    },
    labelLarge: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        lineHeight: lineHeight.md,
    },
    labelMedium: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        lineHeight: lineHeight.sm,
    },
    labelSmall: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        lineHeight: lineHeight.xs,
    },
    caption: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        lineHeight: lineHeight.xs,
    },
} as const;
