CREATE TYPE "public"."category" AS ENUM('Design', 'Development', 'Test', 'Other');--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"input_prompt" text NOT NULL,
	"output_prompt" text NOT NULL,
	"category" "category" NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text,
	"description" text,
	"tags" text,
	"view_count" text DEFAULT '0',
	"copy_count" text DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "agents_category_idx" ON "agents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "agents_user_id_idx" ON "agents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agents_category_created_at_idx" ON "agents" USING btree ("category","created_at");--> statement-breakpoint
CREATE INDEX "agents_created_at_idx" ON "agents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agents_name_idx" ON "agents" USING btree ("name");--> statement-breakpoint
CREATE INDEX "agents_user_category_idx" ON "agents" USING btree ("user_id","category");