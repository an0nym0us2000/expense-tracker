import { uuid } from '../utils/uuid';
import { getDatabase } from './connection';
import { getCategoryIdByName, getPaymentMethodIdByName } from './seeds';
import { userProfileRepo } from './userProfileRepo';

/**
 * Seeds demo data so the app looks alive on first run.
 * Creates a demo user, ~30 transactions across the current and previous months,
 * sample budgets, and a savings goal.
 */
export async function seedDemoData(): Promise<void> {
    const db = await getDatabase();

    // Check if demo data already seeded
    const userExists = await userProfileRepo.exists();
    if (userExists) return;

    // Create demo user
    await userProfileRepo.create({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        currency: 'USD',
    });

    // Get category and payment method IDs
    const foodId = await getCategoryIdByName('Food & Dining');
    const transportId = await getCategoryIdByName('Transportation');
    const shoppingId = await getCategoryIdByName('Shopping');
    const entertainmentId = await getCategoryIdByName('Entertainment');
    const billsId = await getCategoryIdByName('Bills & Utilities');
    const groceriesId = await getCategoryIdByName('Groceries');
    const healthId = await getCategoryIdByName('Health');
    const salaryId = await getCategoryIdByName('Salary');
    const freelanceId = await getCategoryIdByName('Freelance');
    const investmentId = await getCategoryIdByName('Investment');
    const cashId = await getPaymentMethodIdByName('Cash');
    const creditId = await getPaymentMethodIdByName('Credit Card');
    const debitId = await getPaymentMethodIdByName('Debit Card');
    const upiId = await getPaymentMethodIdByName('UPI');

    if (!foodId || !transportId || !cashId || !creditId || !debitId || !salaryId) return;

    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

    const pad = (n: number) => String(n).padStart(2, '0');
    const makeDate = (m: number, y: number, d: number) =>
        `${y}-${pad(m)}-${pad(d)}`;

    const demoTransactions = [
        // This month - income
        { type: 'income', amount: 5200, categoryId: salaryId!, date: makeDate(thisMonth, thisYear, 1), note: 'Monthly salary', pmId: debitId! },
        { type: 'income', amount: 800, categoryId: freelanceId!, date: makeDate(thisMonth, thisYear, 5), note: 'Website project', pmId: debitId! },
        { type: 'income', amount: 150, categoryId: investmentId!, date: makeDate(thisMonth, thisYear, 3), note: 'Dividend payout', pmId: debitId! },

        // This month - expenses
        { type: 'expense', amount: 42.50, categoryId: foodId, date: makeDate(thisMonth, thisYear, 2), note: 'Dinner at Olive Garden', pmId: creditId },
        { type: 'expense', amount: 15.00, categoryId: transportId, date: makeDate(thisMonth, thisYear, 2), note: 'Uber ride', pmId: upiId! },
        { type: 'expense', amount: 89.99, categoryId: shoppingId!, date: makeDate(thisMonth, thisYear, 3), note: 'New headphones', pmId: creditId },
        { type: 'expense', amount: 12.99, categoryId: entertainmentId!, date: makeDate(thisMonth, thisYear, 4), note: 'Netflix subscription', pmId: debitId },
        { type: 'expense', amount: 120.00, categoryId: billsId!, date: makeDate(thisMonth, thisYear, 5), note: 'Electricity bill', pmId: debitId },
        { type: 'expense', amount: 65.30, categoryId: groceriesId!, date: makeDate(thisMonth, thisYear, 6), note: 'Weekly groceries', pmId: cashId },
        { type: 'expense', amount: 28.00, categoryId: foodId, date: makeDate(thisMonth, thisYear, 7), note: 'Lunch with team', pmId: upiId! },
        { type: 'expense', amount: 45.00, categoryId: healthId!, date: makeDate(thisMonth, thisYear, 8), note: 'Gym membership', pmId: debitId },
        { type: 'expense', amount: 35.00, categoryId: transportId, date: makeDate(thisMonth, thisYear, 9), note: 'Gas refill', pmId: creditId },
        { type: 'expense', amount: 22.50, categoryId: foodId, date: makeDate(thisMonth, thisYear, 10), note: 'Coffee & snacks', pmId: cashId },
        { type: 'expense', amount: 199.99, categoryId: shoppingId!, date: makeDate(thisMonth, thisYear, 10), note: 'Winter jacket', pmId: creditId },
        { type: 'expense', amount: 8.99, categoryId: entertainmentId!, date: makeDate(thisMonth, thisYear, 11), note: 'Spotify', pmId: debitId },

        // Last month
        { type: 'income', amount: 5200, categoryId: salaryId!, date: makeDate(lastMonth, lastMonthYear, 1), note: 'Monthly salary', pmId: debitId },
        { type: 'expense', amount: 55.00, categoryId: foodId, date: makeDate(lastMonth, lastMonthYear, 3), note: 'Restaurant', pmId: creditId },
        { type: 'expense', amount: 80.00, categoryId: groceriesId!, date: makeDate(lastMonth, lastMonthYear, 5), note: 'Costco run', pmId: debitId },
        { type: 'expense', amount: 45.00, categoryId: transportId, date: makeDate(lastMonth, lastMonthYear, 7), note: 'Gas', pmId: cashId },
        { type: 'expense', amount: 150.00, categoryId: billsId!, date: makeDate(lastMonth, lastMonthYear, 10), note: 'Internet + Phone', pmId: debitId },
        { type: 'expense', amount: 250.00, categoryId: shoppingId!, date: makeDate(lastMonth, lastMonthYear, 12), note: 'Electronics', pmId: creditId },
        { type: 'expense', amount: 35.00, categoryId: healthId!, date: makeDate(lastMonth, lastMonthYear, 15), note: 'Pharmacy', pmId: cashId },
        { type: 'expense', amount: 18.00, categoryId: foodId, date: makeDate(lastMonth, lastMonthYear, 18), note: 'Pizza night', pmId: upiId! },
        { type: 'expense', amount: 12.99, categoryId: entertainmentId!, date: makeDate(lastMonth, lastMonthYear, 20), note: 'Netflix', pmId: debitId },
        { type: 'expense', amount: 72.50, categoryId: groceriesId!, date: makeDate(lastMonth, lastMonthYear, 22), note: 'Groceries', pmId: cashId },
    ];

    for (const tx of demoTransactions) {
        const timestamp = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO "transaction" (id, type, amount, category_id, date, note, payment_method_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuid(), tx.type, tx.amount, tx.categoryId, tx.date, tx.note, tx.pmId, timestamp, timestamp]
        );
    }

    // Create demo budgets for this month
    const budgets = [
        { categoryId: foodId, limit: 300 },
        { categoryId: transportId, limit: 200 },
        { categoryId: shoppingId!, limit: 400 },
        { categoryId: groceriesId!, limit: 350 },
        { categoryId: entertainmentId!, limit: 100 },
        { categoryId: billsId!, limit: 250 },
    ];

    for (const b of budgets) {
        const timestamp = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO budget (id, month, year, category_id, limit_amount, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuid(), thisMonth, thisYear, b.categoryId, b.limit, timestamp, timestamp]
        );
    }

    // Create demo goals
    const goals = [
        { title: 'Emergency Fund', target: 10000, current: 3500, deadline: `${thisYear + 1}-06-30` },
        { title: 'New Laptop', target: 2000, current: 850, deadline: `${thisYear}-12-31` },
        { title: 'Vacation Trip', target: 5000, current: 1200, deadline: `${thisYear + 1}-03-15` },
    ];

    for (const g of goals) {
        const timestamp = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO goal (id, title, target_amount, current_amount, deadline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuid(), g.title, g.target, g.current, g.deadline, timestamp, timestamp]
        );
    }
}
