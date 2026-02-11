import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamily, fontSize } from '../../theme/typography';
import { BottomSheet } from './Modal';
import { formatDate } from '../../utils/date';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    error?: string;
}

export function DatePickerField({ value, onChange, label, error }: DatePickerProps) {
    const [visible, setVisible] = useState(false);
    const [tempYear, setTempYear] = useState(value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
    const [tempMonth, setTempMonth] = useState(value ? parseInt(value.split('-')[1]) - 1 : new Date().getMonth());
    const [tempDay, setTempDay] = useState(value ? parseInt(value.split('-')[2]) : new Date().getDate());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleConfirm = () => {
        const pad = (n: number) => String(n).padStart(2, '0');
        onChange(`${tempYear}-${pad(tempMonth + 1)}-${pad(tempDay)}`);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={[styles.field, error && styles.fieldError]}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.calendarIcon}>📅</Text>
                <Text style={[styles.fieldText, !value && styles.placeholder]}>
                    {value ? formatDate(value) : 'Select date'}
                </Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <BottomSheet visible={visible} onClose={() => setVisible(false)} title="Select Date" snapPoint={0.55}>
                <View style={styles.pickerContainer}>
                    {/* Month selector */}
                    <Text style={styles.pickerLabel}>Month</Text>
                    <View style={styles.monthGrid}>
                        {months.map((m, i) => (
                            <TouchableOpacity
                                key={m}
                                style={[styles.monthItem, tempMonth === i && styles.monthItemActive]}
                                onPress={() => {
                                    setTempMonth(i);
                                    if (tempDay > new Date(tempYear, i + 1, 0).getDate()) {
                                        setTempDay(new Date(tempYear, i + 1, 0).getDate());
                                    }
                                }}
                            >
                                <Text style={[styles.monthText, tempMonth === i && styles.monthTextActive]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Year selector */}
                    <View style={styles.yearRow}>
                        <Text style={styles.pickerLabel}>Year</Text>
                        <View style={styles.yearSelector}>
                            <TouchableOpacity onPress={() => setTempYear((y) => y - 1)} style={styles.yearBtn}>
                                <Text style={styles.yearBtnText}>◀</Text>
                            </TouchableOpacity>
                            <Text style={styles.yearText}>{tempYear}</Text>
                            <TouchableOpacity onPress={() => setTempYear((y) => y + 1)} style={styles.yearBtn}>
                                <Text style={styles.yearBtnText}>▶</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Day selector */}
                    <Text style={styles.pickerLabel}>Day</Text>
                    <View style={styles.dayGrid}>
                        {days.map((d) => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.dayItem, tempDay === d && styles.dayItemActive]}
                                onPress={() => setTempDay(d)}
                            >
                                <Text style={[styles.dayText, tempDay === d && styles.dayTextActive]}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                        <Text style={styles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        minHeight: 48,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    fieldError: {
        borderColor: colors.error,
    },
    calendarIcon: {
        fontSize: 18,
    },
    fieldText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    placeholder: {
        color: colors.textTertiary,
    },
    errorText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
    pickerContainer: {
        paddingBottom: spacing.lg,
    },
    pickerLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    monthItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.backgroundTertiary,
    },
    monthItemActive: {
        backgroundColor: colors.primary,
    },
    monthText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    monthTextActive: {
        color: colors.textInverse,
    },
    yearRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    yearBtn: {
        padding: spacing.sm,
    },
    yearBtnText: {
        fontSize: 14,
        color: colors.primary,
    },
    yearText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    dayGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    dayItem: {
        width: 38,
        height: 38,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundTertiary,
    },
    dayItemActive: {
        backgroundColor: colors.primary,
    },
    dayText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    dayTextActive: {
        color: colors.textInverse,
        fontFamily: fontFamily.semiBold,
    },
    confirmBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    confirmText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textInverse,
    },
});
