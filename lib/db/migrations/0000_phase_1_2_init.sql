CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "agent_events" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"seq" integer NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"mode" text NOT NULL,
	"input" jsonb NOT NULL,
	"summary" jsonb,
	"generated" jsonb,
	"error" text,
	"cost_usd" double precision DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"event" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_roadmaps" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"run_id" text,
	"roadmap" jsonb NOT NULL,
	"subjects" jsonb NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"published_by" text,
	CONSTRAINT "library_roadmaps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"channel" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text NOT NULL,
	"subtopic_slug" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"mastered_at" timestamp,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_user_id_subtopic_slug_pk" PRIMARY KEY("user_id","subtopic_slug")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" text PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" text,
	"total_minutes" integer DEFAULT 0 NOT NULL,
	"subjects_completed" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"phone" text,
	"phoneVerified" timestamp,
	"college_name" text,
	"graduation_year" integer,
	"preferred_roadmap" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_events" ADD CONSTRAINT "agent_events_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_roadmaps" ADD CONSTRAINT "library_roadmaps_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_events_run_seq_uniq" ON "agent_events" USING btree ("run_id","seq");--> statement-breakpoint
CREATE INDEX "agent_events_run_idx" ON "agent_events" USING btree ("run_id","created_at");--> statement-breakpoint
CREATE INDEX "agent_runs_user_idx" ON "agent_runs" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "agent_runs_status_idx" ON "agent_runs" USING btree ("status","started_at");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_event_idx" ON "audit_events" USING btree ("event","created_at");--> statement-breakpoint
CREATE INDEX "library_roadmaps_published_idx" ON "library_roadmaps" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "otp_identifier_idx" ON "otp_codes" USING btree ("identifier","channel");--> statement-breakpoint
CREATE INDEX "otp_expires_idx" ON "otp_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "progress_user_idx" ON "user_progress" USING btree ("user_id");