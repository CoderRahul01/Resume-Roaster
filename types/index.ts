export interface RoastPoint {
  emoji: string;
  title: string;
  critique: string;
  fix?: string;
}

export interface RoastResponse {
  roast: RoastPoint[];
  overallScore: number;
}

// ── Structured resume (returned by /api/rewrite) ─────────────────────────────

export interface ResumeEntryItem {
  title: string;        // Job title, degree name, project name, etc.
  organization: string; // Company, university, etc.
  period?: string;      // "Jan 2021 – Present"
  location?: string;    // "Bangalore, India"
  bullets: string[];    // Achievement/responsibility bullets
}

export interface ResumeSection {
  heading: string;      // e.g. "WORK EXPERIENCE", "EDUCATION", "SKILLS"
  // Structured entries (experience, education, projects)
  items?: ResumeEntryItem[];
  // Free-text sections (summary, skills list, objective, certifications)
  text?: string;
}

export interface StructuredResume {
  name: string;
  contact: string;    // Single line: "email · phone · linkedin"
  sections: ResumeSection[];
}

export interface RewriteResponse {
  rewrittenResume: string;   // Plain-text version (for copy)
  structured?: StructuredResume; // Structured version (for PDF)
}
