CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`tagline` text,
	`summary` text,
	`description` text,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`duration` text,
	`location_name` text,
	`address` text,
	`city` text DEFAULT 'Porto Alegre',
	`maps_url` text,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`total_spots` integer DEFAULT 0 NOT NULL,
	`spots_taken` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'auto' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`is_sample` integer DEFAULT false NOT NULL,
	`cover_image` text,
	`cover_alt` text,
	`included` text,
	`important_info` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_idx` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `events_date_idx` ON `events` (`date`);--> statement-breakpoint
CREATE TABLE `past_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`date` text NOT NULL,
	`location` text,
	`description` text,
	`published` integer DEFAULT true NOT NULL,
	`is_sample` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `past_events_slug_unique` ON `past_events` (`slug`);--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`registration_id` text,
	`type` text,
	`payload` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`width` integer,
	`height` integer,
	`past_event_id` text,
	`event_id` text,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`past_event_id`) REFERENCES `past_events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `photos_past_idx` ON `photos` (`past_event_id`);--> statement-breakpoint
CREATE INDEX `photos_event_idx` ON `photos` (`event_id`);--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`public_token` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`instagram` text,
	`city` text,
	`discovery_source` text,
	`accepted_terms_at` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_provider` text,
	`provider_reference` text,
	`checkout_url` text,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`hold_expires_at` text,
	`paid_at` text,
	`confirmation_sent_at` text,
	`overbooked` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `registrations_event_idx` ON `registrations` (`event_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_token_idx` ON `registrations` (`public_token`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waitlist_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`instagram` text,
	`notified_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `waitlist_event_idx` ON `waitlist_entries` (`event_id`);