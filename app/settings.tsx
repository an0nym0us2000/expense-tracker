import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/stores';
import { seedDemoData } from '../src/database/demoData';
import { exportTransactionsToCSV } from '../src/utils/export';
import { createBackup, restoreFromBackup } from '../src/utils/backup';
import { colors, palette } from '../src/theme/colors';
import { spacing, radius, shadows } from '../src/theme/spacing';
import { fontFamily, fontSize } from '../src/theme/typography';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { settings, setDemoMode, setCurrency } = useAppStore();
    const [isSeeding, setIsSeeding] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleToggleDemo = async () => {
        if (!settings.demoMode) {
            Alert.alert(
                'Enable Demo Mode',
                'This will load sample data to explore the app. Your existing data will not be affected.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Enable',
                        onPress: async () => {
                            setIsSeeding(true);
                            try {
                                await seedDemoData();
                                await setDemoMode(true);
                            } finally {
                                setIsSeeding(false);
                            }
                        },
                    },
                ]
            );
        } else {
            await setDemoMode(false);
        }
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            await exportTransactionsToCSV();
            Alert.alert('Success', 'Transactions exported successfully!');
        } catch (error) {
            Alert.alert('Export Failed', (error as Error).message || 'Failed to export transactions');
        } finally {
            setIsExporting(false);
        }
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            await createBackup();
            Alert.alert('Success', 'Backup created successfully!');
        } catch (error) {
            Alert.alert('Backup Failed', (error as Error).message || 'Failed to create backup');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        Alert.alert(
            'Restore Backup',
            'This will replace ALL your current data with the data from the backup file. This cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        setIsRestoring(true);
                        try {
                            await restoreFromBackup();
                            Alert.alert('Success', 'Data restored successfully! Please restart the app.');
                        } catch (error) {
                            Alert.alert('Restore Failed', (error as Error).message || 'Failed to restore backup');
                        } finally {
                            setIsRestoring(false);
                        }
                    },
                },
            ]
        );
    };

    const currencies = [
        { code: 'USD', symbol: '$', label: 'US Dollar' },
        { code: 'EUR', symbol: '€', label: 'Euro' },
        { code: 'GBP', symbol: '£', label: 'British Pound' },
        { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
        { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Preferences */}
            <Text style={styles.sectionLabel}>PREFERENCES</Text>
            <View style={styles.card}>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBg, { backgroundColor: palette.blue50 }]}>
                            <Text style={styles.icon}>🔔</Text>
                        </View>
                        <Text style={styles.settingLabel}>Notifications</Text>
                    </View>
                    <Switch
                        value={settings.notificationsEnabled}
                        trackColor={{ false: palette.gray300, true: palette.green400 }}
                        thumbColor={palette.white}
                        ios_backgroundColor={palette.gray300}
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBg, { backgroundColor: palette.green50 }]}>
                            <Text style={styles.icon}>🧪</Text>
                        </View>
                        <View>
                            <Text style={styles.settingLabel}>Demo Mode</Text>
                            <Text style={styles.settingSubtext}>Load sample data</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.demoMode}
                        onValueChange={handleToggleDemo}
                        trackColor={{ false: palette.gray300, true: palette.green400 }}
                        thumbColor={palette.white}
                        ios_backgroundColor={palette.gray300}
                        disabled={isSeeding}
                    />
                </View>
            </View>

            {/* Currency */}
            <Text style={styles.sectionLabel}>CURRENCY</Text>
            <View style={styles.card}>
                {currencies.map((curr, index) => (
                    <React.Fragment key={curr.code}>
                        <TouchableOpacity
                            style={styles.currencyItem}
                            onPress={() => setCurrency(curr.code as any)}
                        >
                            <View style={styles.currencyLeft}>
                                <View style={[styles.currencySymbol]}>
                                    <Text style={styles.currencySymbolText}>{curr.symbol}</Text>
                                </View>
                                <View>
                                    <Text style={styles.currencyLabel}>{curr.label}</Text>
                                    <Text style={styles.currencyCode}>{curr.code}</Text>
                                </View>
                            </View>
                            {settings.currency === curr.code && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {index < currencies.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                ))}
            </View>

            {/* Data Management */}
            <Text style={styles.sectionLabel}>DATA</Text>
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleExportCSV}
                    disabled={isExporting}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBg, { backgroundColor: palette.orange50 }]}>
                            <Text style={styles.icon}>📤</Text>
                        </View>
                        <Text style={styles.settingLabel}>Export to CSV</Text>
                    </View>
                    {isExporting && <ActivityIndicator size="small" color={colors.primary} />}
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleBackup}
                    disabled={isBackingUp}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBg, { backgroundColor: palette.blue50 }]}>
                            <Text style={styles.icon}>💾</Text>
                        </View>
                        <Text style={styles.settingLabel}>Create Backup</Text>
                    </View>
                    {isBackingUp && <ActivityIndicator size="small" color={colors.primary} />}
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleRestore}
                    disabled={isRestoring}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBg, { backgroundColor: palette.purple50 }]}>
                            <Text style={styles.icon}>📥</Text>
                        </View>
                        <Text style={styles.settingLabel}>Restore Backup</Text>
                    </View>
                    {isRestoring && <ActivityIndicator size="small" color={colors.primary} />}
                </TouchableOpacity>
            </View>

            {/* About */}
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <View style={styles.card}>
                <View style={styles.aboutItem}>
                    <Text style={styles.aboutLabel}>Version</Text>
                    <Text style={styles.aboutValue}>1.0.0</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.aboutItem}>
                    <Text style={styles.aboutLabel}>Made with</Text>
                    <Text style={styles.aboutValue}>💚 & React Native</Text>
                </View>
            </View>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: spacing.xl,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 28,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.textPrimary,
    },

    // Section
    sectionLabel: {
        fontFamily: fontFamily.bold,
        fontSize: 11,
        color: colors.textTertiary,
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
        marginTop: spacing.xl,
        marginLeft: spacing.xs,
    },

    // Card
    card: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        overflow: 'hidden',
        ...shadows.sm,
    },
    divider: {
        height: 1,
        backgroundColor: palette.gray100,
        marginHorizontal: spacing.lg,
    },

    // Setting Item
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: { fontSize: 20 },
    settingLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    settingSubtext: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        marginTop: 1,
    },

    // Currency
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    currencyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    currencySymbol: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: palette.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbolText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    currencyLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    currencyCode: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.textTertiary,
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: palette.green400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: colors.textInverse,
        fontWeight: '700',
        fontSize: 14,
    },
    comingSoon: {
        backgroundColor: palette.gray100,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    comingSoonText: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.textTertiary,
    },

    // About
    aboutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    aboutLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    aboutValue: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
});
