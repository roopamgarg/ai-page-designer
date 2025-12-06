/**
 * File download utility
 * Pure function to trigger browser file downloads
 */

interface DownloadOptions {
  content: string;
  filename: string;
  mimeType?: string;
}

/**
 * Triggers a browser download of the provided content
 */
export function downloadFile({
  content,
  filename,
  mimeType = 'text/html',
}: DownloadOptions): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Download HTML content as an index.html file
 */
export function downloadAsHtml(htmlContent: string, filename = 'landing-page.html'): void {
  downloadFile({
    content: htmlContent,
    filename,
    mimeType: 'text/html',
  });
}

