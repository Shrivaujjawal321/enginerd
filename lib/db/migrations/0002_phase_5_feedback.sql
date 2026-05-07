CREATE TABLE "subject_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"anonymous_id" text,
	"subject_slug" text NOT NULL,
	"rating" text NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subject_feedback" ADD CONSTRAINT "subject_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_user_subject_uniq" ON "subject_feedback" USING btree ("user_id","subject_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_anon_subject_uniq" ON "subject_feedback" USING btree ("anonymous_id","subject_slug");--> statement-breakpoint
CREATE INDEX "feedback_subject_idx" ON "subject_feedback" USING btree ("subject_slug");