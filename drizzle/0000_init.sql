CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`student_ref` text NOT NULL,
	`name` text NOT NULL,
	`monthly_rent_cents` integer NOT NULL,
	`lease_start` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_student_ref_unique` ON `students` (`student_ref`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`amount_cents` integer NOT NULL,
	`payment_date` text NOT NULL,
	`gmail_message_id` text,
	`subject` text,
	`raw_preview` text,
	`source` text DEFAULT 'gmail' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_gmail_message_id_unique` ON `payments` (`gmail_message_id`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expense_date` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`room_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `gmail_sync_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`last_sync_at` text,
	`last_error` text,
	`last_processed_count` integer DEFAULT 0,
	`last_inserted_count` integer DEFAULT 0,
	`last_skipped_count` integer DEFAULT 0
);
