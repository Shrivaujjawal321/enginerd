"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, BookOpen, Briefcase, Code2, Map } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

const FEATURES = [
  {
    title: "Roadmaps",
    description:
      "Career-specific paths, AI-curated and updated monthly. Java Full Stack, Frontend, DevOps, ML, and more.",
    href: "/roadmaps",
    cta: "View roadmaps",
    icon: Map,
    accent: "from-violet-600 to-violet-400",
  },
  {
    title: "Subjects",
    description:
      "Deep-dive content in Hinglish — real-world examples, diagrams, and interview answers for every topic.",
    href: "/subjects",
    cta: "Read topics",
    icon: BookOpen,
    accent: "from-cyan-500 to-cyan-300",
  },
  {
    title: "DSA Practice",
    description:
      "500+ problems, MNC-tagged, with hints in Hinglish. Inline editor with test cases.",
    href: "/practice",
    cta: "Solve problems",
    icon: Code2,
    accent: "from-violet-500 to-cyan-500",
  },
  {
    title: "Careers",
    description:
      "Apply to MNC openings in one click. Your resume gets matched to your roadmap progress.",
    href: "/careers",
    cta: "Browse openings",
    icon: Briefcase,
    accent: "from-cyan-500 to-violet-400",
  },
];

export function FeatureCards() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Everything in one place.
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            From your first roadmap to your first job — the full journey.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link href={feature.href} className="block h-full">
                <GlassCard
                  hoverable
                  className="group flex h-full flex-col p-7"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-black/20`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-50">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-slate-200 transition-colors group-hover:text-white">
                    {feature.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
