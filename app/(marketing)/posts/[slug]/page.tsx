import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { listPosts, getPost } from "@/lib/posts";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: "Writing" };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link
        href="/about"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-100"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to about
      </Link>

      <header className="mt-4 mb-10 border-b border-white/[0.06] pb-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-50 sm:text-[2.5rem]">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          {post.date ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {post.date}
            </span>
          ) : null}
          {post.readingTimeMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTimeMinutes}-minute read
            </span>
          ) : null}
        </div>
        {post.description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            {post.description}
          </p>
        ) : null}
      </header>

      <div className="max-w-[68ch]">
        <MarkdownRenderer source={post.body} />
      </div>
    </article>
  );
}
