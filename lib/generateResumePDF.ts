/**
 * Client-side resume PDF generation using jsPDF.
 * Dynamically imported so jsPDF (~250KB gzip) is only loaded on the success page.
 *
 * Layout: clean single-column, A4, ATS-safe (no tables, no images, no columns).
 * Fonts: Helvetica (built into every jsPDF install, no web font needed).
 */

import type { StructuredResume } from "@/types";

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_W   = 595.28;  // A4 width in pt
const PAGE_H   = 841.89;  // A4 height in pt
const M_L      = 52;      // left margin
const M_R      = 52;      // right margin
const M_T      = 48;      // top margin
const M_B      = 48;      // bottom margin
const CONTENT_W = PAGE_W - M_L - M_R;

// Line heights
const LH_TITLE   = 13;
const LH_BODY    = 12;
const LH_SMALL   = 11;

export async function generateAndDownloadResumePDF(
  data: StructuredResume,
  filename = "resume-rewritten.pdf",
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = M_T;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function pageBreakIfNeeded(needed: number) {
    if (y + needed > PAGE_H - M_B) {
      doc.addPage();
      y = M_T;
    }
  }

  function setStyle(
    size: number,
    weight: "normal" | "bold" | "italic" | "bolditalic",
    color: [number, number, number] = [20, 20, 20],
  ) {
    doc.setFontSize(size);
    doc.setFont("helvetica", weight);
    doc.setTextColor(...color);
  }

  function drawText(
    text: string,
    x: number,
    maxW: number,
    lineH: number,
    opts?: { align?: "left" | "center" | "right" },
  ): number {
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, x, y, { align: opts?.align ?? "left" });
    const added = lines.length * lineH;
    y += added;
    return added;
  }

  function hRule(color: [number, number, number] = [200, 200, 200], weight = 0.4) {
    doc.setDrawColor(...color);
    doc.setLineWidth(weight);
    doc.line(M_L, y, PAGE_W - M_R, y);
  }

  // ── HEADER ──────────────────────────────────────────────────────────────────

  // Name
  setStyle(20, "bold");
  drawText(data.name, PAGE_W / 2, CONTENT_W, 24, { align: "center" });
  y += 2;

  // Contact line
  setStyle(8.5, "normal", [100, 100, 100]);
  drawText(data.contact, PAGE_W / 2, CONTENT_W, LH_SMALL, { align: "center" });
  y += 8;

  // Header divider
  hRule([180, 180, 180], 0.5);
  y += 14;

  // ── SECTIONS ────────────────────────────────────────────────────────────────

  for (const section of data.sections) {
    pageBreakIfNeeded(36);

    // Section heading
    setStyle(9.5, "bold");
    doc.text(section.heading.toUpperCase(), M_L, y);
    y += 3;
    hRule([40, 40, 40], 0.7);
    y += 9;

    // ── Free-text section (Summary, Skills, Certifications, etc.) ────────────
    if (section.text) {
      setStyle(9.5, "normal", [50, 50, 50]);
      const textLines = doc.splitTextToSize(section.text, CONTENT_W);
      pageBreakIfNeeded(textLines.length * LH_BODY + 4);
      doc.text(textLines, M_L, y);
      y += textLines.length * LH_BODY + 4;
    }

    // ── Item-based section (Experience, Education, Projects, etc.) ────────────
    if (section.items && section.items.length > 0) {
      for (const item of section.items) {
        pageBreakIfNeeded(22);

        // Row 1: Title (left) | Period (right)
        const periodText = item.period ?? "";
        setStyle(10, "bold");
        const periodW = periodText
          ? doc.getStringUnitWidth(periodText) * 10 / doc.internal.scaleFactor + 2
          : 0;
        const titleMaxW = CONTENT_W - periodW - 4;
        const titleLines = doc.splitTextToSize(item.title, titleMaxW);

        doc.text(titleLines[0], M_L, y);

        if (periodText) {
          setStyle(8.5, "normal", [110, 110, 110]);
          doc.text(periodText, PAGE_W - M_R, y, { align: "right" });
        }
        y += LH_TITLE + 1;

        // Remaining title lines (rare but possible for very long titles)
        if (titleLines.length > 1) {
          setStyle(10, "bold");
          for (let i = 1; i < titleLines.length; i++) {
            doc.text(titleLines[i], M_L, y);
            y += LH_TITLE;
          }
        }

        // Row 2: Organization | Location
        if (item.organization) {
          const orgParts = [item.organization, item.location].filter(Boolean);
          setStyle(9, "italic", [85, 85, 85]);
          const orgLines = doc.splitTextToSize(orgParts.join(" · "), CONTENT_W);
          pageBreakIfNeeded(orgLines.length * LH_SMALL + 2);
          doc.text(orgLines, M_L, y);
          y += orgLines.length * LH_SMALL + 2;
        }

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          setStyle(9.5, "normal", [50, 50, 50]);
          for (const bullet of item.bullets) {
            const bulletLines = doc.splitTextToSize(`• ${bullet}`, CONTENT_W - 10);
            pageBreakIfNeeded(bulletLines.length * LH_BODY + 1);
            doc.text(bulletLines, M_L + 8, y);
            y += bulletLines.length * LH_BODY + 1;
          }
        }

        y += 6; // gap between items
      }
    }

    y += 7; // gap between sections
  }

  doc.save(filename);
}
