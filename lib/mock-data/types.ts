export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "unsolved" | "attempted" | "solved";

export type RoadmapCategory =
  | "Web Development"
  | "Mobile"
  | "Data & ML"
  | "DevOps & Cloud"
  | "Systems"
  | "Game Dev"
  | "Security"
  | "Blockchain"
  | "Interview Prep"
  | "Portfolio";

export type SubtopicContentBlock =
  | {
      type: "what";
      title: string;
      body: string[];
    }
  | {
      type: "why";
      title: string;
      body: string[];
    }
  | {
      type: "how";
      title: string;
      body: string[];
      code?: { language: string; snippet: string };
    }
  | {
      type: "example";
      title: string;
      body: string[];
      code?: { language: string; snippet: string };
    }
  | {
      type: "diagram";
      title: string;
      mermaid: string;
    }
  | {
      type: "interview";
      title: string;
      question: string;
      answer: string[];
    };

export type Subtopic = {
  slug: string;
  title: string;
  estMinutes: number;
  status: "not_started" | "in_progress" | "completed";
  content?: SubtopicContentBlock[];
};

export type Topic = {
  slug: string;
  title: string;
  subtopics: Subtopic[];
};

export type Subject = {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  estHours: number;
  topicsCount: number;
  progressPct: number;
  hasPractice: boolean;
  iconAccent: string;
  roadmapSlugs: string[];
  topics: Topic[];
};

export type Roadmap = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: RoadmapCategory;
  difficulty: Difficulty;
  durationMonths: number;
  subjectsCount: number;
  topicsCount: number;
  rating: number;
  enrolled: number;
  thumbnailAccent: string;
  skills: string[];
  companies: string[];
  whyThis: string[];
  subjectSlugs: string[];
  progressPct?: number;
  /** Optional follow-up roadmap suggested at the end of this one. Used by
   *  subject-markdown-reader's end-of-roadmap card to recommend a specific
   *  next track instead of the generic /roadmaps browse. */
  nextRoadmapSlug?: string;
};

export type ProblemTest = {
  /** Args passed to the function being tested. */
  args: unknown[];
  /** Expected return value (deep-equal compared). */
  expected: unknown;
  /** Optional human-readable label shown in the test panel. */
  label?: string;
};

export type Problem = {
  slug: string;
  number: number;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  companies: string[];
  status: ProblemStatus;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  starterCode: { language: string; code: string }[];
  /** Function name that the runner will call after evaluating user code. */
  fnName?: string;
  /** Test cases for auto-grading. If omitted, the problem can only be Run, not Submitted. */
  tests?: ProblemTest[];
};

export type Company = {
  slug: string;
  name: string;
  shortName: string;
  founded: number;
  employees: string;
  description: string;
  techStack: string[];
  skillsLookFor: string[];
  employeeQuotes: { quote: string; name: string; role: string }[];
  relatedRoadmaps: string[];
  accent: string;
};

export type JobPosting = {
  id: string;
  companySlug: string;
  title: string;
  location: string;
  remoteType: "Remote" | "Hybrid" | "On-site";
  experienceMin: number;
  experienceMax: number;
  techStack: string[];
  salaryMin: number;
  salaryMax: number;
  matchPct: number;
  postedDaysAgo: number;
  applyUrl: string;
};
