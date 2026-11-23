CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`kind` text NOT NULL,
	`value` integer NOT NULL,
	`event_id` text,
	`max_uses` integer,
	`expires_on` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_idx` ON `coupons` (`code`);--> statement-breakpoint
ALTER TABLE `registrations` ADD `coupon_id` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `coupon_code` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `discount_cents` integer DEFAULT 0 NOT NULL;