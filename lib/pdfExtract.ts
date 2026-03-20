/**
 * Client-side PDF text extraction using pdfjs-dist.
 * Dynamic import keeps it out of the main bundle — loaded only when user uploads a PDF.
 * The PDF bytes never leave the browser; only extracted plain text is sent to our API.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Use the exact installed version from unpkg so the worker matches
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // TextItem has .str; TextMarkedContent does not — guard with 'str' in item
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    pageTexts.push(pageText);
  }

  // Collapse excessive whitespace that PDF extraction often introduces
  return pageTexts.join("\n\n").replace(/[ \t]{2,}/g, " ").trim();
}
