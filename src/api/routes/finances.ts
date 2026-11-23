import { Hono } from "hono";
import { db } from "#db";
import {
  financialAccount,
  financialTransaction,
  financialBudget,
  financialBill,
  financialPlannedPurchase,
  financialDebt,
} from "#db/schema";
import { eq, desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { BASE_CURRENCY, convertBetween, fetchRates } from "#lib/currency";

const app = new Hono()
  .get("/rates", async (c) => {
    const rates = await fetchRates();
    if (!rates)
      return c.json(
        { base: BASE_CURRENCY, date: "", rates: null, error: "Rates unavailable" },
        502,
      );
    return c.json({ base: rates.base, date: rates.date, rates: rates.rates });
  })
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1)
      return c.json({
        accounts: [],
        transactions: [],
        budgets: [],
        bills: [],
        plannedPurchases: [],
        debts: [],
      });
    const userId = ownerId();
    try {
      const [accounts, transactions, budgets, bills, plannedPurchases, debts] = await Promise.all([
        db
          .select()
          .from(financialAccount)
          .where(eq(financialAccount.userId, userId))
          .orderBy(desc(financialAccount.createdAt)),
        db
          .select()
          .from(financialTransaction)
          .where(eq(financialTransaction.userId, userId))
          .orderBy(desc(financialTransaction.date))
          .limit(200),
        db
          .select()
          .from(financialBudget)
          .where(eq(financialBudget.userId, userId))
          .orderBy(desc(financialBudget.createdAt)),
        db
          .select()
          .from(financialBill)
          .where(eq(financialBill.userId, userId))
          .orderBy(desc(financialBill.createdAt)),
        db
          .select()
          .from(financialPlannedPurchase)
          .where(eq(financialPlannedPurchase.userId, userId))
          .orderBy(desc(financialPlannedPurchase.createdAt)),
        db
          .select()
          .from(financialDebt)
          .where(eq(financialDebt.userId, userId))
          .orderBy(desc(financialDebt.createdAt)),
      ]);
      return c.json({ accounts, transactions, budgets, bills, plannedPurchases, debts });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const body = (await c.req.json()) as any;
    try {
      if (body.type === "account") {
        const newAccount = {
          id: crypto.randomUUID(),
          userId,
          name: body.name,
          type: body.accountType || "checking",
          balance: Number(body.balance) || 0,
          currency: body.currency || BASE_CURRENCY,
          institution: body.institution || null,
          agency: body.agency || null,
          accountNumber: body.accountNumber || null,
          ownerName: body.ownerName || null,
          ownerDocument: body.ownerDocument || null,
          paymentKey: body.paymentKey || null,
          routingNumber: body.routingNumber || null,
          creditLimit:
            body.creditLimit == null || body.creditLimit === "" ? null : Number(body.creditLimit),
          overdraftLimit:
            body.overdraftLimit == null || body.overdraftLimit === ""
              ? null
              : Number(body.overdraftLimit),
          openingDate: body.openingDate || null,
          notes: body.notes || null,
          isArchived: false,
        };
        await db.insert(financialAccount).values(newAccount);
        return c.json(newAccount, 201);
      } else if (body.type === "transaction") {
        const amount = Number(body.amount) || 0;
        const txCurrency = (body.currency || BASE_CURRENCY).toUpperCase();
        const isPrepaid = Boolean(body.isPrepaid);
        const prepaidMonths = isPrepaid && body.prepaidMonths ? Number(body.prepaidMonths) : null;
        const recognizedMonthlyAmount =
          isPrepaid && prepaidMonths && prepaidMonths > 0
            ? Number((amount / prepaidMonths).toFixed(2))
            : null;

        const newTx = {
          id: crypto.randomUUID(),
          accountId: body.accountId || null,
          userId,
          amount,
          currency: txCurrency,
          type: body.txType || "expense",
          category: body.category || "General",
          description: body.description || "",
          date: body.date ? new Date(body.date) : new Date(),
          isPrepaid,
          prepaidMonths,
          recognizedMonthlyAmount,
          prepaidExpiresAt: body.prepaidExpiresAt || null,
        };
        await db.insert(financialTransaction).values(newTx);
        if (body.accountId) {
          const acc = await db
            .select()
            .from(financialAccount)
            .where(eq(financialAccount.id, body.accountId))
            .limit(1);
          const accRecord = acc[0];
          if (accRecord) {
            let delta = body.txType === "income" ? amount : -amount;
            if (txCurrency !== accRecord.currency) {
              const rates = (await fetchRates())?.rates ?? null;
              const converted = convertBetween(amount, txCurrency, accRecord.currency, rates);
              if (converted !== null) delta = body.txType === "income" ? converted : -converted;
            }
            await db
              .update(financialAccount)
              .set({ balance: accRecord.balance + delta, updatedAt: new Date() })
              .where(eq(financialAccount.id, body.accountId));
          }
        }
        return c.json(newTx, 201);
      } else if (body.type === "budget") {
        const newBudget = {
          id: crypto.randomUUID(),
          userId,
          category: body.category,
          monthlyLimit: Number(body.monthlyLimit) || 0,
          spent: 0,
          currency: body.currency || BASE_CURRENCY,
        };
        await db.insert(financialBudget).values(newBudget);
        return c.json(newBudget, 201);
      } else if (body.type === "bill") {
        const newBill = {
          id: crypto.randomUUID(),
          userId,
          name: body.name,
          cost: Number(body.cost) || 0,
          currency: body.currency || BASE_CURRENCY,
          billingCycle: body.billingCycle || "monthly",
          category: body.category || "Software",
          renewalDate: body.renewalDate || null,
          paymentMethod: body.paymentMethod || null,
          isActive: body.isActive ?? true,
          isVariable: body.isVariable ?? false,
          lastActualAmount: body.lastActualAmount != null ? Number(body.lastActualAmount) : null,
          lastActualMonth: body.lastActualMonth || null,
          notes: body.notes || null,
        };
        await db.insert(financialBill).values(newBill);
        return c.json(newBill, 201);
      } else if (body.type === "plannedPurchase") {
        const newPlan = {
          id: crypto.randomUUID(),
          userId,
          title: body.title,
          estimatedCost:
            body.estimatedCost == null || body.estimatedCost === ""
              ? null
              : Number(body.estimatedCost),
          quantity: Math.max(1, Number(body.quantity) || 1),
          currency: body.currency || BASE_CURRENCY,
          category: body.category || "Gear",
          priority: body.priority || "medium",
          targetDate: body.targetDate || null,
          link: body.link || null,
          isPurchased: body.isPurchased ?? false,
          notes: body.notes || null,
        };
        await db.insert(financialPlannedPurchase).values(newPlan);
        return c.json(newPlan, 201);
      } else if (body.type === "debt") {
        const originalAmount = Number(body.originalAmount) || 0;
        const remainingAmount =
          body.remainingAmount !== undefined ? Number(body.remainingAmount) : originalAmount;
        const newDebt = {
          id: crypto.randomUUID(),
          userId,
          name: body.name,
          direction: body.direction || (body.debtType === "loan_given" ? "lent" : "borrowed"),
          type: body.debtType || body.type_category || "loan",
          lender: body.lender || null,
          originalAmount,
          remainingAmount,
          currency: body.currency || BASE_CURRENCY,
          interestRate:
            body.interestRate != null && body.interestRate !== ""
              ? Number(body.interestRate)
              : null,
          interestPeriod: body.interestPeriod || "yearly",
          installmentAmount:
            body.installmentAmount != null && body.installmentAmount !== ""
              ? Number(body.installmentAmount)
              : null,
          totalInstallments:
            body.totalInstallments != null && body.totalInstallments !== ""
              ? Number(body.totalInstallments)
              : null,
          remainingInstallments:
            body.remainingInstallments != null && body.remainingInstallments !== ""
              ? Number(body.remainingInstallments)
              : null,
          dueDateDay:
            body.dueDateDay != null && body.dueDateDay !== "" ? Number(body.dueDateDay) : null,
          startDate: body.startDate || null,
          endDate: body.endDate || null,
          linkedAccountId: body.linkedAccountId || null,
          isPaid: body.isPaid ?? false,
          notes: body.notes || null,
        };
        await db.insert(financialDebt).values(newDebt);
        return c.json(newDebt, 201);
      }
      return c.json({ error: "Invalid type" }, 400);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    try {
      if (body.type === "bill" && body.id) {
        await db
          .update(financialBill)
          .set({
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.cost !== undefined ? { cost: Number(body.cost) } : {}),
            ...(body.currency !== undefined ? { currency: body.currency } : {}),
            ...(body.billingCycle !== undefined ? { billingCycle: body.billingCycle } : {}),
            ...(body.category !== undefined ? { category: body.category } : {}),
            ...(body.renewalDate !== undefined ? { renewalDate: body.renewalDate } : {}),
            ...(body.paymentMethod !== undefined ? { paymentMethod: body.paymentMethod } : {}),
            ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
            ...(body.isVariable !== undefined ? { isVariable: body.isVariable } : {}),
            ...(body.lastActualAmount !== undefined
              ? { lastActualAmount: Number(body.lastActualAmount) }
              : {}),
            ...(body.lastActualMonth !== undefined
              ? { lastActualMonth: body.lastActualMonth }
              : {}),
            ...(body.notes !== undefined ? { notes: body.notes } : {}),
            updatedAt: new Date(),
          })
          .where(eq(financialBill.id, body.id));
        return c.json({ success: true });
      } else if (body.type === "budget" && body.id) {
        await db
          .update(financialBudget)
          .set({
            ...(body.category !== undefined ? { category: body.category } : {}),
            ...(body.monthlyLimit !== undefined ? { monthlyLimit: Number(body.monthlyLimit) } : {}),
            ...(body.spent !== undefined ? { spent: Number(body.spent) } : {}),
            ...(body.currency !== undefined ? { currency: body.currency } : {}),
            updatedAt: new Date(),
          })
          .where(eq(financialBudget.id, body.id));
        return c.json({ success: true });
      } else if (body.type === "plannedPurchase" && body.id) {
        await db
          .update(financialPlannedPurchase)
          .set({
            ...(body.title !== undefined ? { title: body.title } : {}),
            ...(body.estimatedCost !== undefined
              ? {
                  estimatedCost:
                    body.estimatedCost == null || body.estimatedCost === ""
                      ? null
                      : Number(body.estimatedCost),
                }
              : {}),
            ...(body.quantity !== undefined
              ? { quantity: Math.max(1, Number(body.quantity) || 1) }
              : {}),
            ...(body.currency !== undefined ? { currency: body.currency } : {}),
            ...(body.category !== undefined ? { category: body.category } : {}),
            ...(body.priority !== undefined ? { priority: body.priority } : {}),
            ...(body.targetDate !== undefined ? { targetDate: body.targetDate } : {}),
            ...(body.link !== undefined ? { link: body.link } : {}),
            ...(body.isPurchased !== undefined ? { isPurchased: body.isPurchased } : {}),
            ...(body.notes !== undefined ? { notes: body.notes } : {}),
            updatedAt: new Date(),
          })
          .where(eq(financialPlannedPurchase.id, body.id));
        return c.json({ success: true });
      } else if (body.type === "debt" && body.id) {
        await db
          .update(financialDebt)
          .set({
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.direction !== undefined ? { direction: body.direction } : {}),
            ...(body.debtType !== undefined ? { type: body.debtType } : {}),
            ...(body.lender !== undefined ? { lender: body.lender || null } : {}),
            ...(body.originalAmount !== undefined
              ? { originalAmount: Number(body.originalAmount) }
              : {}),
            ...(body.remainingAmount !== undefined
              ? { remainingAmount: Number(body.remainingAmount) }
              : {}),
            ...(body.currency !== undefined ? { currency: body.currency } : {}),
            ...(body.interestRate !== undefined
              ? {
                  interestRate:
                    body.interestRate != null && body.interestRate !== ""
                      ? Number(body.interestRate)
                      : null,
                }
              : {}),
            ...(body.interestPeriod !== undefined ? { interestPeriod: body.interestPeriod } : {}),
            ...(body.installmentAmount !== undefined
              ? {
                  installmentAmount:
                    body.installmentAmount != null && body.installmentAmount !== ""
                      ? Number(body.installmentAmount)
                      : null,
                }
              : {}),
            ...(body.totalInstallments !== undefined
              ? {
                  totalInstallments:
                    body.totalInstallments != null && body.totalInstallments !== ""
                      ? Number(body.totalInstallments)
                      : null,
                }
              : {}),
            ...(body.remainingInstallments !== undefined
              ? {
                  remainingInstallments:
                    body.remainingInstallments != null && body.remainingInstallments !== ""
                      ? Number(body.remainingInstallments)
                      : null,
                }
              : {}),
            ...(body.dueDateDay !== undefined
              ? {
                  dueDateDay:
                    body.dueDateDay != null && body.dueDateDay !== ""
                      ? Number(body.dueDateDay)
                      : null,
                }
              : {}),
            ...(body.startDate !== undefined ? { startDate: body.startDate || null } : {}),
            ...(body.endDate !== undefined ? { endDate: body.endDate || null } : {}),
            ...(body.linkedAccountId !== undefined
              ? { linkedAccountId: body.linkedAccountId || null }
              : {}),
            ...(body.isPaid !== undefined ? { isPaid: body.isPaid } : {}),
            ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
            updatedAt: new Date(),
          })
          .where(eq(financialDebt.id, body.id));
        return c.json({ success: true });
      } else if (body.type === "account" && body.id) {
        await db
          .update(financialAccount)
          .set({
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.accountType !== undefined
              ? { type: body.accountType }
              : body.type !== undefined && body.type !== "account"
                ? { type: body.type }
                : {}),
            ...(body.balance !== undefined ? { balance: Number(body.balance) } : {}),
            ...(body.currency !== undefined ? { currency: body.currency } : {}),
            ...(body.institution !== undefined ? { institution: body.institution || null } : {}),
            ...(body.agency !== undefined ? { agency: body.agency || null } : {}),
            ...(body.accountNumber !== undefined
              ? { accountNumber: body.accountNumber || null }
              : {}),
            ...(body.ownerName !== undefined ? { ownerName: body.ownerName || null } : {}),
            ...(body.ownerDocument !== undefined
              ? { ownerDocument: body.ownerDocument || null }
              : {}),
            ...(body.paymentKey !== undefined ? { paymentKey: body.paymentKey || null } : {}),
            ...(body.routingNumber !== undefined
              ? { routingNumber: body.routingNumber || null }
              : {}),
            ...(body.creditLimit !== undefined
              ? {
                  creditLimit:
                    body.creditLimit == null || body.creditLimit === ""
                      ? null
                      : Number(body.creditLimit),
                }
              : {}),
            ...(body.overdraftLimit !== undefined
              ? {
                  overdraftLimit:
                    body.overdraftLimit == null || body.overdraftLimit === ""
                      ? null
                      : Number(body.overdraftLimit),
                }
              : {}),
            ...(body.openingDate !== undefined ? { openingDate: body.openingDate || null } : {}),
            ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
            ...(body.isArchived !== undefined ? { isArchived: body.isArchived } : {}),
            updatedAt: new Date(),
          })
          .where(eq(financialAccount.id, body.id));
        return c.json({ success: true });
      } else if (body.type === "transaction" && body.id) {
        await db
          .update(financialTransaction)
          .set({
            ...(body.description !== undefined ? { description: body.description } : {}),
            ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
            ...(body.currency !== undefined ? { currency: body.currency } : {}),
            ...(body.txType !== undefined ? { type: body.txType } : {}),
            ...(body.category !== undefined ? { category: body.category } : {}),
            ...(body.accountId !== undefined ? { accountId: body.accountId || null } : {}),
            ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
            ...(body.isPrepaid !== undefined ? { isPrepaid: body.isPrepaid } : {}),
            ...(body.prepaidMonths !== undefined
              ? { prepaidMonths: body.prepaidMonths ? Number(body.prepaidMonths) : null }
              : {}),
            ...(body.recognizedMonthlyAmount !== undefined
              ? {
                  recognizedMonthlyAmount:
                    body.recognizedMonthlyAmount != null
                      ? Number(body.recognizedMonthlyAmount)
                      : null,
                }
              : {}),
            ...(body.prepaidExpiresAt !== undefined
              ? { prepaidExpiresAt: body.prepaidExpiresAt || null }
              : {}),
            updatedAt: new Date(),
          })
          .where(eq(financialTransaction.id, body.id));
        return c.json({ success: true });
      }
      return c.json({ error: "Invalid update" }, 400);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const txId = c.req.query("txId");
    const accountId = c.req.query("accountId");
    const budgetId = c.req.query("budgetId");
    const billId = c.req.query("billId");
    const planId = c.req.query("planId");
    const debtId = c.req.query("debtId");
    try {
      if (txId) await db.delete(financialTransaction).where(eq(financialTransaction.id, txId));
      if (accountId) await db.delete(financialAccount).where(eq(financialAccount.id, accountId));
      if (budgetId) await db.delete(financialBudget).where(eq(financialBudget.id, budgetId));
      if (billId) await db.delete(financialBill).where(eq(financialBill.id, billId));
      if (planId)
        await db.delete(financialPlannedPurchase).where(eq(financialPlannedPurchase.id, planId));
      if (debtId) await db.delete(financialDebt).where(eq(financialDebt.id, debtId));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
