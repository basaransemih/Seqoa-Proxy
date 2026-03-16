/**
 * HTML cleaning utilities for search results
 */

/**
 * Removes HTML tags from text and cleans up whitespace
 */
export function cleanHtml(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, ' ') // Remove multiple newlines
    .trim();
}

/**
 * Validates and cleans a URL
 */
export function cleanUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  // Remove any HTML entities or encoding issues
  const cleaned = url.replace(/&amp;/g, '&').trim();
  
  // Ensure it starts with http/https
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }
  
  // Handle relative URLs or other protocols
  if (cleaned.startsWith('//')) {
    return `https:${cleaned}`;
  }
  
  return null;
}

/**
 * Validates search result data
 */
export function validateResult(title: string, url: string | null, snippet: string): boolean {
  return !!(title && url && snippet && title.length > 0 && snippet.length > 0);
}
