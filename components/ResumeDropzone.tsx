"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { extractTextFromPDF } from "@/lib/pdfExtract";
import { RESUME } from "@/lib/config";

interface ResumeDropzoneProps {
  onExtracted: (text: string) => void;
  isDisabled?: boolean;
}

export function ResumeDropzone({ onExtracted, isDisabled }: ResumeDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF file.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("PDF too large — keep it under 15 MB.");
        return;
      }

      setIsExtracting(true);
      setUploadedFile(file.name);

      try {
        const raw = await extractTextFromPDF(file);

        if (raw.trim().length < RESUME.minChars) {
          toast.error(
            "Not enough text found. Is this a scanned/image PDF? Try copy-pasting the text instead.",
          );
          setUploadedFile(null);
          return;
        }

        if (raw.length > RESUME.maxChars) {
          toast.info("Resume is very long — trimmed to the first 50,000 characters.");
        }

        onExtracted(raw.slice(0, RESUME.maxChars));
        toast.success("Resume loaded. Ready to roast 🔥");
      } catch {
        toast.error("Failed to read the PDF. Try a different file or paste the text instead.");
        setUploadedFile(null);
      } finally {
        setIsExtracting(false);
      }
    },
    [onExtracted],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && !isDisabled && !isExtracting) processFile(file);
    },
    [isDisabled, isExtracting, processFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  function openFilePicker() {
    if (!isDisabled && !isExtracting) inputRef.current?.click();
  }

  // ── Uploaded / ready state ──────────────────────────────────────────────────
  if (uploadedFile && !isExtracting) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] overflow-hidden">
        {/* Green accent strip */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/30" />
        <div className="p-4 flex items-center justify-between gap-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex items-center gap-3 min-w-0">
            {/* PDF icon */}
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f0f0f4] truncate">{uploadedFile}</p>
              <p className="text-[11px] text-emerald-400/70 mt-0.5 font-mono">Extracted · ready to roast</p>
            </div>
          </div>
          <button
            onClick={openFilePicker}
            className="text-[11px] text-zinc-600 hover:text-zinc-300 font-mono whitespace-nowrap transition-colors flex-shrink-0 underline underline-offset-2"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // ── Extracting / loading state ───────────────────────────────────────────────
  if (isExtracting) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d14] p-10 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/[0.10] border-t-[#ff4444]/60 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 font-mono">Reading PDF...</p>
      </div>
    );
  }

  // ── Default drop zone ────────────────────────────────────────────────────────
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload resume PDF"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={openFilePicker}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFilePicker()}
      className={`
        rounded-2xl border-2 border-dashed transition-all duration-200
        cursor-pointer select-none outline-none
        focus-visible:ring-2 focus-visible:ring-[#ff4444]/50
        ${
          isDragging
            ? "border-[#ff4444]/50 bg-[#ff4444]/[0.04] scale-[1.01]"
            : "border-white/[0.09] bg-[#0d0d14] hover:border-white/[0.18] hover:bg-[#111118]"
        }
        p-8 sm:p-12 flex flex-col items-center gap-4
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="hidden"
        disabled={isDisabled}
      />

      {/* Upload icon */}
      <div
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
          ${isDragging
            ? "bg-[#ff4444]/15 border border-[#ff4444]/30"
            : "bg-white/[0.04] border border-white/[0.07] group-hover:border-white/[0.14]"
          }
        `}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDragging ? "#ff4444" : "#52525b"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-200"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5">
        <p className="font-semibold text-[#f0f0f4] text-sm sm:text-base">
          {isDragging ? "Drop it — let's see what we're working with" : "Drop your resume PDF here"}
        </p>
        <p className="text-zinc-600 text-xs sm:text-sm">
          <span className="hidden sm:inline">Drag & drop, or </span>
          <span className="text-zinc-400 underline underline-offset-2 decoration-zinc-700">
            tap to browse
          </span>
          <span className="text-zinc-700"> · PDF only · up to 15 MB</span>
        </p>
        <p className="text-zinc-700 text-[11px] font-mono hidden sm:block">
          Works with all standard resume formats
        </p>
      </div>

      {/* Mobile: prominent button */}
      <div className="sm:hidden w-full mt-1">
        <div className="w-full h-11 rounded-xl bg-[#ff4444] text-white text-sm font-bold flex items-center justify-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Resume PDF
        </div>
      </div>
    </div>
  );
}
