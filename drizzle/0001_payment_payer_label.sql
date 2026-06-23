PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `payments_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`payer_label` text NOT NULL DEFAULT 'Unknown',
	`amount_cents` integer NOT NULL,
	`payment_date` text NOT NULL,
	`gmail_message_id` text,
	`subject` text,
	`raw_preview` text,
	`source` text DEFAULT 'gmail' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `payments_new` (`id`, `student_id`, `payer_label`, `amount_cents`, `payment_date`, `gmail_message_id`, `subject`, `raw_preview`, `source`, `created_at`)
SELECT
	p.`id`,
	p.`student_id`,
	COALESCE(s.`name`, s.`student_ref`, 'Unknown'),
	p.`amount_cents`,
	p.`payment_date`,
	p.`gmail_message_id`,
	p.`subject`,
	p.`raw_preview`,
	p.`source`,
	p.`created_at`
FROM `payments` p
LEFT JOIN `students` s ON s.`id` = p.`student_id`;
--> statement-breakpoint
DROP TABLE `payments`;
--> statement-breakpoint
ALTER TABLE `payments_new` RENAME TO `payments`;
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_gmail_message_id_unique` ON `payments` (`gmail_message_id`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
