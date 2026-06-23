ALTER TABLE `payments` ADD `business_tag` text DEFAULT 'uncategorized' NOT NULL;
--> statement-breakpoint
ALTER TABLE `payments` ADD `direction` text DEFAULT 'in' NOT NULL;
--> statement-breakpoint
ALTER TABLE `payments` ADD `dedupe_key` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_dedupe_key_unique` ON `payments` (`dedupe_key`);
