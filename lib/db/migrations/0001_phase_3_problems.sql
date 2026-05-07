CREATE TABLE "problems" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"difficulty" text NOT NULL,
	"topic" text NOT NULL,
	"companies" jsonb NOT NULL,
	"description" text NOT NULL,
	"examples" jsonb NOT NULL,
	"constraints" jsonb NOT NULL,
	"hints" jsonb NOT NULL,
	"starter_code" jsonb NOT NULL,
	"fn_name" text,
	"tests" jsonb NOT NULL,
	"editorial" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"problem_id" text NOT NULL,
	"language" text NOT NULL,
	"code" text NOT NULL,
	"status" text NOT NULL,
	"runtime_ms" integer,
	"cases_passed" integer DEFAULT 0 NOT NULL,
	"cases_total" integer DEFAULT 0 NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "problems_topic_idx" ON "problems" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "problems_difficulty_idx" ON "problems" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "problems_number_idx" ON "problems" USING btree ("number");--> statement-breakpoint
CREATE INDEX "submissions_user_idx" ON "submissions" USING btree ("user_id","submitted_at");--> statement-breakpoint
CREATE INDEX "submissions_problem_idx" ON "submissions" USING btree ("problem_id","submitted_at");--> statement-breakpoint
CREATE INDEX "submissions_user_problem_idx" ON "submissions" USING btree ("user_id","problem_id");