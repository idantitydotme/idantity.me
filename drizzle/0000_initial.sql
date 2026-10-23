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

