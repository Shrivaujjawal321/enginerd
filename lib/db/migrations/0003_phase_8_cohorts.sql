CREATE TABLE "cohort_members" (
	"cohort_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cohort_members_cohort_id_user_id_pk" PRIMARY KEY("cohort_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" text PRIMARY KEY NOT NULL,
	"roadmap_slug" text NOT NULL,
	"week" text NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"cohort_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rank" integer NOT NULL,
	"score" integer NOT NULL,
	"subjects_completed" integer DEFAULT 0 NOT NULL,
	"problems_solved" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"snapshot_week" text NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cohort_members_user_idx" ON "cohort_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cohorts_roadmap_idx" ON "cohorts" USING btree ("roadmap_slug","week");--> statement-breakpoint
CREATE INDEX "leaderboard_cohort_rank_idx" ON "leaderboard_snapshots" USING btree ("cohort_id","rank");--> statement-breakpoint
CREATE INDEX "leaderboard_user_idx" ON "leaderboard_snapshots" USING btree ("user_id","snapshot_week");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboard_uniq" ON "leaderboard_snapshots" USING btree ("cohort_id","user_id","snapshot_week");