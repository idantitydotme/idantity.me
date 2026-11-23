-- Personal backend tables moved from personal.idantity.me.
-- Replays that project's drizzle history in dependency order (see docs/personal-backend-move.md).
-- Re-run drizzle-kit generate at the build pass to confirm no drift.

-- ---- 20260824193341_short_shinko_yamashiro
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `fasting` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`original_end_time` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `workout` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `pets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_purchased` integer DEFAULT false NOT NULL,
	`purchased_at` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `music` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `groceries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `kanban_board` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `kanban_card` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`due_date` integer,
	`custom_fields` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`list_id`) REFERENCES `kanban_list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kanban_custom_field` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`options` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`board_id`) REFERENCES `kanban_board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kanban_list` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`title` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`board_id`) REFERENCES `kanban_board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`category` text DEFAULT 'general',
	`status` text DEFAULT 'active',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `storage_files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storage_files_key_unique` ON `storage_files` (`key`);

-- ---- 20260825192803_adorable_boom_boom
CREATE TABLE `financial_account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'checking' NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`institution` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `financial_budget` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`monthly_limit` real NOT NULL,
	`spent` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `financial_transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category` text DEFAULT 'General' NOT NULL,
	`description` text,
	`date` integer NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`account_id`) REFERENCES `financial_account`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `note` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`tags` text NOT NULL,
	`color` text DEFAULT 'default' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`is_trashed` integer DEFAULT false NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `todo` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'General' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`due_date` integer,
	`order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
ALTER TABLE `storage_files` ADD `url` text;

-- ---- 20260826191435_gifted_hawkeye
CREATE TABLE `financial_planned_purchase` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`estimated_cost` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`category` text DEFAULT 'Gear' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`target_date` text,
	`link` text,
	`is_purchased` integer DEFAULT false NOT NULL,
	`notes` text,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `financial_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`cost` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`billing_cycle` text DEFAULT 'monthly' NOT NULL,
	`category` text DEFAULT 'Software' NOT NULL,
	`renewal_date` text,
	`payment_method` text,
	`is_active` integer DEFAULT true NOT NULL,
	`notes` text,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);


-- ---- 20260826204737_currency_brl
ALTER TABLE `financial_transaction` ADD `currency` text DEFAULT 'BRL' NOT NULL;--> statement-breakpoint
UPDATE `financial_account` SET `currency` = 'BRL' WHERE `currency` = 'USD';--> statement-breakpoint
UPDATE `financial_budget` SET `currency` = 'BRL' WHERE `currency` = 'USD';--> statement-breakpoint
UPDATE `financial_subscription` SET `currency` = 'BRL' WHERE `currency` = 'USD';--> statement-breakpoint
UPDATE `financial_planned_purchase` SET `currency` = 'BRL' WHERE `currency` = 'USD';

-- ---- 20260826204737_striped_vector
ALTER TABLE `todo` ADD `is_recurring` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `todo` ADD `recurring_interval` text;

-- ---- 20260912000138_bills_variable
ALTER TABLE `financial_subscription` ADD `is_variable` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_subscription` ADD `last_actual_amount` real;--> statement-breakpoint
ALTER TABLE `financial_subscription` ADD `last_actual_month` text;

-- ---- 20260912000614_rename_subscription_to_bill
ALTER TABLE `financial_subscription` RENAME TO `financial_bill`;

-- ---- 20260913150907_account_details
ALTER TABLE `financial_account` ADD `agency` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `account_number` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `owner_name` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `owner_document` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `payment_key` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `routing_number` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `credit_limit` real;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `overdraft_limit` real;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `opening_date` text;--> statement-breakpoint
ALTER TABLE `financial_account` ADD `notes` text;

-- ---- 20260913150907_wishlist_quantity
ALTER TABLE `financial_planned_purchase` ADD `quantity` integer NOT NULL DEFAULT 1;


-- ---- 20260913150907_make_estimated_cost_nullable
--> statement-breakpoint
CREATE TABLE `financial_planned_purchase_new` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`estimated_cost` real,
	`quantity` integer NOT NULL DEFAULT 1,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`category` text DEFAULT 'Gear' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`target_date` text,
	`link` text,
	`is_purchased` integer DEFAULT false NOT NULL,
	`notes` text,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);--> statement-breakpoint
INSERT INTO `financial_planned_purchase_new`(`id`, `user_id`, `title`, `estimated_cost`, `quantity`, `currency`, `category`, `priority`, `target_date`, `link`, `is_purchased`, `notes`, `updated_at`, `created_at`, `deleted_at`) SELECT `id`, `user_id`, `title`, `estimated_cost`, `quantity`, `currency`, `category`, `priority`, `target_date`, `link`, `is_purchased`, `notes`, `updated_at`, `created_at`, `deleted_at` FROM `financial_planned_purchase`;--> statement-breakpoint
DROP TABLE `financial_planned_purchase`;--> statement-breakpoint
ALTER TABLE `financial_planned_purchase_new` RENAME TO `financial_planned_purchase`;

-- ---- 20260924201400_ordinary_overlord
CREATE TABLE `financial_debt` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`direction` text DEFAULT 'borrowed' NOT NULL,
	`type` text DEFAULT 'loan' NOT NULL,
	`lender` text,
	`original_amount` real NOT NULL,
	`remaining_amount` real NOT NULL,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`interest_rate` real,
	`interest_period` text DEFAULT 'yearly',
	`installment_amount` real,
	`total_installments` integer,
	`remaining_installments` integer,
	`due_date_day` integer,
	`start_date` text,
	`end_date` text,
	`linked_account_id` text,
	`is_paid` integer DEFAULT false NOT NULL,
	`notes` text,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
ALTER TABLE `financial_transaction` ADD `is_prepaid` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_transaction` ADD `prepaid_months` integer;--> statement-breakpoint
ALTER TABLE `financial_transaction` ADD `recognized_monthly_amount` real;--> statement-breakpoint
ALTER TABLE `financial_transaction` ADD `prepaid_expires_at` text;

-- ---- 20261013165321_heavy_jimmy_woo
CREATE TABLE `notebook` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`color` text DEFAULT 'neutral' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`is_trashed` integer DEFAULT false NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `notebook_entry` (
	`id` text PRIMARY KEY,
	`notebook_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_storage_files` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`key` text NOT NULL UNIQUE,
	`filename` text NOT NULL,
	`url` text,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_storage_files`(`id`, `user_id`, `key`, `filename`, `url`, `mime_type`, `size`, `uploaded_at`) SELECT `id`, `user_id`, `key`, `filename`, `url`, `mime_type`, `size`, `uploaded_at` FROM `storage_files`;--> statement-breakpoint
DROP TABLE `storage_files`;--> statement-breakpoint
ALTER TABLE `__new_storage_files` RENAME TO `storage_files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `storage_files_key_unique`;

