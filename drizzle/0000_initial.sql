CREATE TABLE `search_index` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`body_content` text NOT NULL,
	`searchable_text` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX `search_index_source_type_source_id_key` ON `search_index` (`source_type`,`source_id`);
--> statement-breakpoint

CREATE TABLE `bylines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`website_url` text,
	`bio` text,
	`avatar` text,
	`user_id` text,
	`socials` text DEFAULT '{}',
	`metadata` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint

CREATE UNIQUE INDEX `bylines_slug_idx` ON `bylines` (`slug`);
--> statement-breakpoint

CREATE TABLE `content_search_index` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`locale` text NOT NULL,
	`title_text` text NOT NULL,
	`content_text` text NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE INDEX `content_search_index_page_id_idx` ON `content_search_index` (`page_id`);
--> statement-breakpoint

CREATE TABLE `page_draft_locks` (
	`page_id` text PRIMARY KEY NOT NULL,
	`locked_by_user_id` text NOT NULL,
	`locked_by_user_name` text NOT NULL,
	`acquired_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE `page_drafts` (
	`page_id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE `page_taxonomy_terms` (
	`page_id` text NOT NULL,
	`term_id` text NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`term_id`) REFERENCES `taxonomy_terms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX `page_taxonomy_terms_page_term_idx` ON `page_taxonomy_terms` (`page_id`,`term_id`);
--> statement-breakpoint

CREATE TABLE `page_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`page_type` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`allowed_roles` text DEFAULT '[]' NOT NULL,
	`role_permissions` text DEFAULT '{"whoCanCreate":[],"whoCanEdit":[],"whoCanReview":[],"whoCanView":[]}' NOT NULL,
	`required_permission` text,
	`approval_rules` text DEFAULT '{"allowSelfApproval":true,"minApprovals":1}' NOT NULL,
	`default_properties` text DEFAULT '{}' NOT NULL,
	`initial_blocks` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint

CREATE UNIQUE INDEX `page_templates_slug_unique` ON `page_templates` (`slug`);
--> statement-breakpoint

CREATE TABLE `page_version_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`user_id` text NOT NULL,
	`user_role` text NOT NULL,
	`approved_at` integer NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `page_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE `page_version_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`user_id` text NOT NULL,
	`user_role` text NOT NULL,
	`content` text NOT NULL,
	`block_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `page_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE TABLE `page_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`author_ids` text DEFAULT '[]',
	`bylines` text DEFAULT '[]',
	`content` text NOT NULL,
	`created_by` text NOT NULL,
	`approved_by` text DEFAULT '[]' NOT NULL,
	`approved_at` integer,
	`change_summary` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX `page_versions_page_id_version_idx` ON `page_versions` (`page_id`,`version_number`);
--> statement-breakpoint

CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`template_id` text,
	`template_version` integer DEFAULT 1 NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`author_ids` text DEFAULT '[]',
	`bylines` text DEFAULT '[]',
	`content` text NOT NULL,
	`published_version_id` text,
	`posted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`template_id`) REFERENCES `page_templates`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`published_version_id`) REFERENCES `page_versions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint

CREATE UNIQUE INDEX `pages_slug_active_unique_idx` ON `pages` (`slug`) WHERE deleted_at IS NULL;
--> statement-breakpoint

CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`url` text NOT NULL,
	`og_image` text NOT NULL,
	`author` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`branding` text NOT NULL,
	`seo` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE `taxonomy_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`taxonomy` text NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`parent_id` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `taxonomy_terms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX `taxonomy_terms_tax_slug_idx` ON `taxonomy_terms` (`taxonomy`,`slug`);

