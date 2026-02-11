export { colors, palette } from './colors';
export { spacing, radius, shadows } from './spacing';
export { typography, fontFamily, fontSize, lineHeight } from './typography';

export const theme = {
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
    screenPadding: 20,
    tabBarHeight: 80,
    fabSize: 56,
} as const;
