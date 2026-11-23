import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const financialAccount = sqliteTable("financial_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type", { enum: ["checking", "savings", "credit", "investment", "cash"] })
    .notNull()
    .default("checking"),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("BRL"),
  institution: text("institution"),
  agency: text("agency"),
  accountNumber: text("account_number"),
  ownerName: text("owner_name"),
  ownerDocument: text("owner_document"),
  paymentKey: text("payment_key"),
  routingNumber: text("routing_number"),
  creditLimit: real("credit_limit"),
  overdraftLimit: real("overdraft_limit"),
  openingDate: text("opening_date"),
  notes: text("notes"),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FinancialAccount = typeof financialAccount.$inferSelect;
export type NewFinancialAccount = typeof financialAccount.$inferInsert;

export const financialTransaction = sqliteTable("financial_transaction", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => financialAccount.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("BRL"),
  type: text("type", { enum: ["income", "expense", "transfer"] }).notNull(),
  category: text("category").notNull().default("General"),
  description: text("description"),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  isPrepaid: integer("is_prepaid", { mode: "boolean" }).notNull().default(false),
  prepaidMonths: integer("prepaid_months"),
  recognizedMonthlyAmount: real("recognized_monthly_amount"),
  prepaidExpiresAt: text("prepaid_expires_at"), // YYYY-MM-DD
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FinancialTransaction = typeof financialTransaction.$inferSelect;
export type NewFinancialTransaction = typeof financialTransaction.$inferInsert;

export const financialBudget = sqliteTable("financial_budget", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  monthlyLimit: real("monthly_limit").notNull(),
  spent: real("spent").notNull().default(0),
  currency: text("currency").notNull().default("BRL"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FinancialBudget = typeof financialBudget.$inferSelect;
export type NewFinancialBudget = typeof financialBudget.$inferInsert;

// Bills Table
export const financialBill = sqliteTable("financial_bill", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  cost: real("cost").notNull(),
  currency: text("currency").notNull().default("BRL"),
  billingCycle: text("billing_cycle", { enum: ["monthly", "yearly", "weekly"] })
    .notNull()
    .default("monthly"),
  category: text("category").notNull().default("Software"),
  renewalDate: text("renewal_date"), // YYYY-MM-DD
  paymentMethod: text("payment_method"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isVariable: integer("is_variable", { mode: "boolean" }).notNull().default(false),
  lastActualAmount: real("last_actual_amount"),
  lastActualMonth: text("last_actual_month"), // YYYY-MM
  notes: text("notes"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FinancialBill = typeof financialBill.$inferSelect;
export type NewFinancialBill = typeof financialBill.$inferInsert;

// Planned Purchases / Financial Wishlist Table
export const financialPlannedPurchase = sqliteTable("financial_planned_purchase", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  estimatedCost: real("estimated_cost"),
  quantity: integer("quantity").notNull().default(1),
  currency: text("currency").notNull().default("BRL"),
  category: text("category").notNull().default("Gear"),
  priority: text("priority", { enum: ["low", "medium", "high", "essential"] })
    .notNull()
    .default("medium"),
  targetDate: text("target_date"), // YYYY-MM-DD
  link: text("link"),
  isPurchased: integer("is_purchased", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FinancialPlannedPurchase = typeof financialPlannedPurchase.$inferSelect;
export type NewFinancialPlannedPurchase = typeof financialPlannedPurchase.$inferInsert;

// Debts / Loans / Installments (Borrowing & Lending) Table
export const financialDebt = sqliteTable("financial_debt", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  direction: text("direction", { enum: ["borrowed", "lent"] })
    .notNull()
    .default("borrowed"), // 'borrowed' = I owe money (liability), 'lent' = Someone owes me (receivable asset)
  type: text("type", {
    enum: [
      "loan",
      "financing",
      "installment",
      "personal_debt",
      "credit_card_debt",
      "loan_given",
      "other",
    ],
  })
    .notNull()
    .default("loan"),
  lender: text("lender"), // Bank, Person, or Institution (or Borrower if direction='lent')
  originalAmount: real("original_amount").notNull(),
  remainingAmount: real("remaining_amount").notNull(),
  currency: text("currency").notNull().default("BRL"),
  interestRate: real("interest_rate"), // Annual % or monthly %
  interestPeriod: text("interest_period", { enum: ["yearly", "monthly"] }).default("yearly"),
  installmentAmount: real("installment_amount"),
  totalInstallments: integer("total_installments"),
  remainingInstallments: integer("remaining_installments"),
  dueDateDay: integer("due_date_day"), // Day of month (1-31)
  startDate: text("start_date"), // YYYY-MM-DD
  endDate: text("end_date"), // YYYY-MM-DD
  linkedAccountId: text("linked_account_id"),
  isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type FinancialDebt = typeof financialDebt.$inferSelect;
export type NewFinancialDebt = typeof financialDebt.$inferInsert;
