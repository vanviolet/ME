import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  title: string;
  category?: string;
  date?: string;
  readTime?: string;
  authorName?: string;
  summary?: string;
  htmlContent: string;
  filename?: string;
  sourceUrl?: string;
  phonetic?: string;
  formula?: string;
}

/**
 * Robust, high-fidelity PDF exporter using html2canvas & jsPDF with A4 multi-page slicing.
 * Fallback to browser window.print() if canvas rendering encounters strict browser sandboxing.
 */
export async function exportToPdf(options: PdfExportOptions): Promise<void> {
  const container = document.createElement('div');
  container.className = 'pdf-render-sandbox';
  
  // Place element within layout flow but invisible and non-interactive
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px'; // Exact A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1c1917';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.7';
  container.style.padding = '44px 48px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';
  container.style.opacity = '0.01';
  container.style.pointerEvents = 'none';

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .pdf-render-sandbox * { box-sizing: border-box; }
    .pdf-header { border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 24px; }
    .pdf-meta-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 10px; border-radius: 6px; background-color: #ffe4e6; color: #e11d48; margin-right: 12px; }
    .pdf-meta-item { font-size: 11px; color: #78716c; margin-right: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .pdf-title { font-size: 26px; font-weight: 800; color: #0c0a09; line-height: 1.25; margin: 16px 0 12px 0; }
    .pdf-summary { font-size: 14px; line-height: 1.6; color: #44403c; background: #fafaf9; border-left: 4px solid #e11d48; padding: 12px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }
    .pdf-formula { font-family: ui-monospace, monospace; font-size: 12px; background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; color: #be123c; font-weight: 600; }
    .pdf-body h1 { font-size: 20px; font-weight: 700; color: #0c0a09; margin: 28px 0 12px; border-bottom: 1px solid #f5f5f4; padding-bottom: 6px; }
    .pdf-body h2 { font-size: 17px; font-weight: 700; color: #1c1917; margin: 24px 0 10px; }
    .pdf-body h3 { font-size: 15px; font-weight: 600; color: #292524; margin: 18px 0 8px; }
    .pdf-body p { margin: 0 0 14px 0; color: #292524; }
    .pdf-body code { font-family: ui-monospace, monospace; font-size: 12px; background-color: #f5f5f4; color: #be123c; padding: 2px 6px; border-radius: 4px; }
    .pdf-body pre { background-color: #1c1917; color: #f5f5f4; padding: 14px 18px; border-radius: 8px; font-family: ui-monospace, monospace; font-size: 11.5px; line-height: 1.55; overflow-x: hidden; margin: 16px 0; }
    .pdf-body pre code { background: transparent; color: inherit; padding: 0; }
    .pdf-body ul, .pdf-body ol { margin: 0 0 14px 0; padding-left: 24px; }
    .pdf-body li { margin-bottom: 6px; color: #292524; }
    .pdf-body blockquote { border-left: 3px solid #d6d3d1; padding-left: 14px; margin: 14px 0; color: #57534e; font-style: italic; }
    .pdf-body table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 12px; }
    .pdf-body th, .pdf-body td { border: 1px solid #e7e5e4; padding: 8px 12px; text-align: left; }
    .pdf-body th { background: #f5f5f4; font-weight: 600; color: #0c0a09; }
    .pdf-footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e7e5e4; font-size: 10px; color: #a8a29e; display: flex; justify-content: space-between; font-family: ui-monospace, monospace; }
  `;
  container.appendChild(styleTag);

  const contentWrapper = document.createElement('div');
  contentWrapper.innerHTML = `
    <header class="pdf-header">
      <div>
        ${options.category ? `<span class="pdf-meta-badge">${options.category}</span>` : ''}
        ${options.date ? `<span class="pdf-meta-item">Published: ${options.date}</span>` : ''}
        ${options.readTime ? `<span class="pdf-meta-item">Read Time: ${options.readTime}</span>` : ''}
        <span class="pdf-meta-item">Author: ${options.authorName || 'Muchamad Irvan'}</span>
      </div>
      <h1 class="pdf-title">${options.title}</h1>
      ${options.phonetic ? `<div class="pdf-meta-item" style="margin-bottom: 8px;">Phonetic: ${options.phonetic}</div>` : ''}
      ${options.summary ? `<div class="pdf-summary">${options.summary}</div>` : ''}
      ${options.formula ? `<div class="pdf-formula">Formula: ${options.formula}</div>` : ''}
    </header>
    <main class="pdf-body">
      ${options.htmlContent}
    </main>
    <footer class="pdf-footer">
      <span>vanviolet.my.id • Muchamad Irvan Architecture & Engineering</span>
      <span>${options.sourceUrl || window.location.href}</span>
    </footer>
  `;
  container.appendChild(contentWrapper);

  document.body.appendChild(container);

  try {
    // Render to Canvas with 2x resolution for ultra-sharp vector-like text
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Remaining pages
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeSlug = (options.filename || options.title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    pdf.save(`${safeSlug}.pdf`);
  } catch (error) {
    console.warn('html2canvas PDF generation failed, switching to native browser print fallback:', error);
    window.print();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
