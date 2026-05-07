/**
 * Shared shell for the four legal / contact pages — terms, privacy,
 * refunds, contact. Keeps typography + spacing consistent without leaning
 * on @tailwindcss/typography (which isn't installed).
 *
 * Children are wrapped in a styled container that targets bare h2 / p / ul /
 * ol / li / a elements so each page can write plain semantic markup.
 */

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <header className="mb-10 border-b border-white/[0.06] pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {lastUpdated}</p>
      </header>
      <div
        className="
          space-y-4 text-[15px] leading-relaxed text-slate-300
          [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-50
          [&_strong]:text-slate-100
          [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6
          [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6
          [&_li]:pl-1
          [&_a]:text-violet-300 [&_a]:transition-colors hover:[&_a]:text-violet-200 hover:[&_a]:underline
        "
      >
        {children}
      </div>
    </article>
  );
}
