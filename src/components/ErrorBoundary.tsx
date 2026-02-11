import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, palette } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontFamily, fontSize } from '../theme/typography';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });

        // In production, you would send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <LinearGradient
                        colors={['#FFF5F5', '#FEE', '#FFF']}
                        style={StyleSheet.absoluteFillObject}
                    />

                    <View style={styles.content}>
                        {/* Error Icon */}
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>⚠️</Text>
                        </View>

                        {/* Error Title */}
                        <Text style={styles.title}>Oops! Something went wrong</Text>

                        {/* Error Message */}
                        <Text style={styles.subtitle}>
                            We're sorry for the inconvenience. The app encountered an unexpected error.
                        </Text>

                        {/* Error Details (only in development) */}
                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>Error Details:</Text>
                                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                                {this.state.errorInfo && (
                                    <Text style={styles.errorStack}>
                                        {this.state.errorInfo.componentStack}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* Action Buttons */}
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={this.handleReset}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.primaryBtnText}>Try Again</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.helpText}>
                            If the problem persists, try restarting the app.
                        </Text>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: palette.red50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    icon: {
        fontSize: 56,
    },
    title: {
        fontFamily: fontFamily.bold,
        fontSize: 24,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xxl,
    },
    errorDetails: {
        width: '100%',
        backgroundColor: palette.gray100,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        maxHeight: 200,
    },
    errorTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    errorText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    errorStack: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    primaryBtn: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: spacing.lg,
        width: '100%',
    },
    btnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    primaryBtnText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textInverse,
        letterSpacing: 0.3,
    },
    helpText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textTertiary,
        textAlign: 'center',
    },
});

export default ErrorBoundary;
