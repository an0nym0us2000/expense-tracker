import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    TextInput,
    ScrollView,
    FlatList,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../src/stores';
import { useBudgetStore } from '../src/stores';
import { categoryRepo } from '../src/database';
import { colors, palette } from '../src/theme/colors';
import { spacing, radius } from '../src/theme/spacing';
import { fontFamily, fontSize } from '../src/theme/typography';
import type { Category } from '../src/types';

const { width, height } = Dimensions.get('window');

type OnboardingStep = 'welcome' | 'income' | 'categories' | 'budget' | 'complete';

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
    const [budgetCreated, setBudgetCreated] = useState(false);

    const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
    const { addBudget } = useBudgetStore();
    const currency = useAppStore((s) => s.settings.currency);

    React.useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const categories = await categoryRepo.getByType('expense');
        setExpenseCategories(categories);
    };

    const handleNext = () => {
        if (currentStep === 'welcome') {
            setCurrentStep('income');
        } else if (currentStep === 'income') {
            if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
                Alert.alert('Invalid Income', 'Please enter a valid monthly income amount.');
                return;
            }
            setCurrentStep('categories');
        } else if (currentStep === 'categories') {
            if (selectedCategories.length === 0) {
                Alert.alert('No Categories', 'Please select at least one category to track.');
                return;
            }
            setCurrentStep('budget');
        } else if (currentStep === 'budget') {
            handleCreateBudgets();
        } else if (currentStep === 'complete') {
            handleFinish();
        }
    };

    const handleSkip = () => {
        setCurrentStep('complete');
    };

    const handleCreateBudgets = async () => {
        const income = parseFloat(monthlyIncome);
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        // 50/30/20 rule: 50% needs, 30% wants, 20% savings
        const budgetPerCategory = income * 0.5 / selectedCategories.length;

        try {
            for (const categoryId of selectedCategories) {
                await addBudget({
                    categoryId,
                    limitAmount: Math.round(budgetPerCategory),
                    month,
                    year,
                });
            }
            setBudgetCreated(true);
            setCurrentStep('complete');
        } catch (error) {
            console.error('Error creating budgets:', error);
            Alert.alert('Error', 'Failed to create budgets. Please try again.');
        }
    };

    const handleFinish = async () => {
        await setOnboardingCompleted();
        router.replace('/(tabs)');
    };

    const toggleCategory = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const renderWelcome = () => (
        <View style={styles.stepContainer}>
            <LinearGradient
                colors={['#F0FFF4', '#E8FFF0', '#F8FBF8']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decorative dots */}
            <View style={styles.dotsContainer}>
                {[...Array(6)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.decorDot,
                            {
                                top: 100 + Math.random() * (height * 0.3),
                                left: 20 + Math.random() * (width - 40),
                                width: 4 + Math.random() * 6,
                                height: 4 + Math.random() * 6,
                                opacity: 0.15 + Math.random() * 0.2,
                            },
                        ]}
                    />
                ))}
            </View>

            <View style={styles.logoSection}>
                <View style={styles.logoOuterRing}>
                    <View style={styles.logoInnerCircle}>
                        <Text style={styles.logoLeaf}>🌱</Text>
                    </View>
                    <View style={styles.accentDot} />
                </View>
            </View>

            <View style={styles.textSection}>
                <Text style={styles.appName}>Sprout</Text>
                <Text style={styles.subtitle}>
                    Take control of your{'\n'}finances{' '}
                    <Text style={styles.subtitleGreen}>effortlessly</Text>.
                </Text>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderIncome = () => (
        <View style={styles.stepContainer}>
            <View style={styles.contentSection}>
                <View style={styles.iconBubble}>
                    <Text style={styles.iconBubbleText}>💰</Text>
                </View>

                <Text style={styles.stepTitle}>What's your monthly income?</Text>
                <Text style={styles.stepDescription}>
                    This helps us create smart budget recommendations for you.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '¥'}</Text>
                    <TextInput
                        style={styles.incomeInput}
                        value={monthlyIncome}
                        onChangeText={setMonthlyIncome}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        placeholderTextColor={palette.gray400}
                        autoFocus
                    />
                </View>

                <Text style={styles.helperText}>Don't worry, you can change this later</Text>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipBtnText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.stepContainer}>
            <View style={styles.contentSection}>
                <View style={styles.iconBubble}>
                    <Text style={styles.iconBubbleText}>🏷️</Text>
                </View>

                <Text style={styles.stepTitle}>Choose categories to track</Text>
                <Text style={styles.stepDescription}>
                    Select the expense categories you want to monitor and budget for.
                </Text>

                <ScrollView style={styles.categoriesGrid} showsVerticalScrollIndicator={false}>
                    <View style={styles.categoriesRow}>
                        {expenseCategories.map((category) => {
                            const isSelected = selectedCategories.includes(category.id);
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        isSelected && styles.categoryChipSelected,
                                    ]}
                                    onPress={() => toggleCategory(category.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.categoryChipIcon}>{category.icon}</Text>
                                    <Text
                                        style={[
                                            styles.categoryChipLabel,
                                            isSelected && styles.categoryChipLabelSelected,
                                        ]}
                                    >
                                        {category.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.categoryChipCheck}>
                                            <Text style={styles.categoryChipCheckText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <Text style={styles.selectedCount}>
                    {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                </Text>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipBtnText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderBudget = () => {
        const income = parseFloat(monthlyIncome);
        const budgetPerCategory = income * 0.5 / selectedCategories.length;

        return (
            <View style={styles.stepContainer}>
                <View style={styles.contentSection}>
                    <View style={styles.iconBubble}>
                        <Text style={styles.iconBubbleText}>🎯</Text>
                    </View>

                    <Text style={styles.stepTitle}>Create your first budget</Text>
                    <Text style={styles.stepDescription}>
                        Based on the 50/30/20 rule, we recommend allocating 50% of your income to essentials.
                    </Text>

                    <View style={styles.budgetSummary}>
                        <View style={styles.budgetSummaryRow}>
                            <Text style={styles.budgetSummaryLabel}>Monthly Income</Text>
                            <Text style={styles.budgetSummaryValue}>
                                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '¥'}
                                {income.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.budgetSummaryRow}>
                            <Text style={styles.budgetSummaryLabel}>Budget per Category</Text>
                            <Text style={styles.budgetSummaryValue}>
                                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '¥'}
                                {Math.round(budgetPerCategory).toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.budgetSummaryRow}>
                            <Text style={styles.budgetSummaryLabel}>Categories</Text>
                            <Text style={styles.budgetSummaryValue}>{selectedCategories.length}</Text>
                        </View>
                    </View>

                    <View style={styles.budgetPreview}>
                        <Text style={styles.budgetPreviewTitle}>Budget Preview</Text>
                        <ScrollView style={styles.budgetPreviewList} showsVerticalScrollIndicator={false}>
                            {selectedCategories.map((categoryId) => {
                                const category = expenseCategories.find((c) => c.id === categoryId);
                                if (!category) return null;
                                return (
                                    <View key={category.id} style={styles.budgetPreviewItem}>
                                        <Text style={styles.budgetPreviewIcon}>{category.icon}</Text>
                                        <Text style={styles.budgetPreviewName}>{category.name}</Text>
                                        <Text style={styles.budgetPreviewAmount}>
                                            {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '¥'}
                                            {Math.round(budgetPerCategory).toLocaleString()}
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleNext}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.btnGradient}
                        >
                            <Text style={styles.primaryBtnText}>Create Budget</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                        <Text style={styles.skipBtnText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderComplete = () => (
        <View style={styles.stepContainer}>
            <View style={styles.contentSection}>
                <View style={styles.iconBubbleLarge}>
                    <Text style={styles.iconBubbleLargeText}>🎉</Text>
                </View>

                <Text style={styles.stepTitle}>You're all set!</Text>
                <Text style={styles.stepDescription}>
                    {budgetCreated
                        ? `We've created ${selectedCategories.length} budgets for you. Start tracking your expenses to see your progress!`
                        : "You can set up budgets anytime from the Budgets tab. Let's start tracking your expenses!"}
                </Text>

                <View style={styles.completeFeatures}>
                    <View style={styles.completeFeature}>
                        <Text style={styles.completeFeatureIcon}>📊</Text>
                        <Text style={styles.completeFeatureText}>Track expenses and income</Text>
                    </View>
                    <View style={styles.completeFeature}>
                        <Text style={styles.completeFeatureIcon}>💰</Text>
                        <Text style={styles.completeFeatureText}>Monitor your budgets</Text>
                    </View>
                    <View style={styles.completeFeature}>
                        <Text style={styles.completeFeatureIcon}>🎯</Text>
                        <Text style={styles.completeFeatureText}>Set and achieve goals</Text>
                    </View>
                    <View style={styles.completeFeature}>
                        <Text style={styles.completeFeatureIcon}>📈</Text>
                        <Text style={styles.completeFeatureText}>Visualize your spending</Text>
                    </View>
                </View>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleFinish}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Start Using Sprout</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStepIndicator = () => {
        const steps = ['welcome', 'income', 'categories', 'budget', 'complete'];
        const currentIndex = steps.indexOf(currentStep);

        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => (
                    <View
                        key={step}
                        style={[
                            styles.stepDot,
                            index <= currentIndex && styles.stepDotActive,
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'welcome':
                return renderWelcome();
            case 'income':
                return renderIncome();
            case 'categories':
                return renderCategories();
            case 'budget':
                return renderBudget();
            case 'complete':
                return renderComplete();
            default:
                return renderWelcome();
        }
    };

    return (
        <View style={styles.container}>
            {currentStep !== 'welcome' && renderStepIndicator()}
            {renderCurrentStep()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    stepContainer: {
        flex: 1,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        gap: spacing.sm,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: palette.gray300,
    },
    stepDotActive: {
        backgroundColor: colors.primary,
        width: 24,
    },
    contentSection: {
        flex: 1,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xxl,
    },
    iconBubble: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: spacing.xl,
    },
    iconBubbleText: {
        fontSize: 36,
    },
    iconBubbleLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: spacing.xl,
    },
    iconBubbleLargeText: {
        fontSize: 56,
    },
    stepTitle: {
        fontFamily: fontFamily.bold,
        fontSize: 28,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    stepDescription: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xxl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    currencySymbol: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.primary,
        marginRight: spacing.sm,
    },
    incomeInput: {
        flex: 1,
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.textPrimary,
        paddingVertical: spacing.lg,
    },
    helperText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textTertiary,
        textAlign: 'center',
    },
    categoriesGrid: {
        flex: 1,
        marginBottom: spacing.lg,
    },
    categoriesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: spacing.sm,
    },
    categoryChipSelected: {
        backgroundColor: palette.green50,
        borderColor: colors.primary,
    },
    categoryChipIcon: {
        fontSize: 20,
    },
    categoryChipLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    categoryChipLabelSelected: {
        color: colors.primary,
    },
    categoryChipCheck: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryChipCheckText: {
        fontSize: 12,
        color: colors.textInverse,
        fontWeight: 'bold',
    },
    selectedCount: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    budgetSummary: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    budgetSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    budgetSummaryLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    budgetSummaryValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    budgetPreview: {
        flex: 1,
    },
    budgetPreviewTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    budgetPreviewList: {
        flex: 1,
    },
    budgetPreviewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    budgetPreviewIcon: {
        fontSize: 20,
    },
    budgetPreviewName: {
        flex: 1,
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    budgetPreviewAmount: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },
    completeFeatures: {
        gap: spacing.lg,
    },
    completeFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
    },
    completeFeatureIcon: {
        fontSize: 24,
    },
    completeFeatureText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    buttonSection: {
        paddingHorizontal: spacing.xxl,
        paddingBottom: 60,
        gap: spacing.md,
    },
    primaryBtn: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
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
    skipBtn: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    skipBtnText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },

    // Welcome screen specific
    dotsContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    decorDot: {
        position: 'absolute',
        borderRadius: 10,
        backgroundColor: palette.green300,
    },
    logoSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    logoOuterRing: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 3,
        borderColor: palette.green200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    logoInnerCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: palette.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    logoLeaf: {
        fontSize: 52,
    },
    accentDot: {
        position: 'absolute',
        top: 24,
        right: 32,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: palette.green300,
    },
    textSection: {
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        marginBottom: 20,
    },
    appName: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.textPrimary,
        marginBottom: spacing.md,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.lg,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
    },
    subtitleGreen: {
        color: colors.primary,
        fontFamily: fontFamily.medium,
    },
});
