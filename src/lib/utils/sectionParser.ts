/**
 * Section Parser Utility
 * Parses HTML to identify, extract, and replace sections
 */

export interface Section {
  id: string;
  name: string;
  startIndex: number;
  endIndex: number;
  html: string;
}

// Common section identifiers to look for
const SECTION_PATTERNS = [
  { id: 'hero', names: ['hero', 'header-hero', 'main-hero', 'banner'], displayName: 'Hero' },
  { id: 'features', names: ['features', 'feature', 'services', 'benefits', 'what-we-do'], displayName: 'Features' },
  { id: 'about', names: ['about', 'about-us', 'who-we-are', 'story'], displayName: 'About' },
  { id: 'testimonials', names: ['testimonials', 'testimonial', 'reviews', 'social-proof', 'clients'], displayName: 'Testimonials' },
  { id: 'pricing', names: ['pricing', 'plans', 'packages', 'prices'], displayName: 'Pricing' },
  { id: 'cta', names: ['cta', 'call-to-action', 'get-started', 'contact', 'signup'], displayName: 'Call to Action' },
  { id: 'faq', names: ['faq', 'faqs', 'questions'], displayName: 'FAQ' },
  { id: 'team', names: ['team', 'our-team', 'people'], displayName: 'Team' },
  { id: 'footer', names: ['footer', 'site-footer'], displayName: 'Footer' },
];

/**
 * Find the matching closing tag for an opening tag, handling nested tags
 */
function findClosingTag(html: string, tagName: string, startFrom: number): number {
  let depth = 1;
  let pos = startFrom;
  const openTag = new RegExp(`<${tagName}[\\s>]`, 'gi');
  const closeTag = new RegExp(`</${tagName}>`, 'gi');
  
  while (depth > 0 && pos < html.length) {
    openTag.lastIndex = pos;
    closeTag.lastIndex = pos;
    
    const nextOpen = openTag.exec(html);
    const nextClose = closeTag.exec(html);
    
    if (!nextClose) {
      // No more closing tags found
      return -1;
    }
    
    if (nextOpen && nextOpen.index < nextClose.index) {
      // Found another opening tag before the closing tag
      depth++;
      pos = nextOpen.index + nextOpen[0].length;
    } else {
      // Found a closing tag
      depth--;
      if (depth === 0) {
        return nextClose.index + nextClose[0].length;
      }
      pos = nextClose.index + nextClose[0].length;
    }
  }
  
  return -1;
}

/**
 * Parse HTML and extract identifiable sections
 */
export function parseSections(html: string): Section[] {
  const sections: Section[] = [];
  const tagNames = ['section', 'header', 'footer'];
  
  for (const tagName of tagNames) {
    const openTagRegex = new RegExp(`<${tagName}[^>]*>`, 'gi');
    let match;
    
    while ((match = openTagRegex.exec(html)) !== null) {
      const startIndex = match.index;
      const afterOpenTag = startIndex + match[0].length;
      
      // Find the matching closing tag
      const endIndex = findClosingTag(html, tagName, afterOpenTag);
      
      if (endIndex === -1) {
        continue; // Couldn't find matching closing tag
      }
      
      const fullMatch = html.substring(startIndex, endIndex);
      
      // Try to identify the section type
      const sectionInfo = identifySection(fullMatch, tagName);
      
      if (sectionInfo) {
        // Check if this section is not nested inside another section we already have
        const isNested = sections.some(
          s => startIndex > s.startIndex && endIndex < s.endIndex
        );
        
        if (!isNested) {
          sections.push({
            id: sectionInfo.id,
            name: sectionInfo.displayName,
            startIndex,
            endIndex,
            html: fullMatch,
          });
        }
      }
    }
  }
  
  // Sort by position in document
  sections.sort((a, b) => a.startIndex - b.startIndex);
  
  // Deduplicate and assign unique IDs if needed
  const uniqueSections: Section[] = [];
  const seenIds = new Map<string, number>();
  
  for (const section of sections) {
    const count = seenIds.get(section.id) || 0;
    seenIds.set(section.id, count + 1);
    
    if (count > 0) {
      section.id = `${section.id}-${count + 1}`;
      section.name = `${section.name} ${count + 1}`;
    }
    
    uniqueSections.push(section);
  }
  
  return uniqueSections;
}

/**
 * Identify section type from HTML content
 */
function identifySection(html: string, tagName: string): { id: string; displayName: string } | null {
  const lowerHtml = html.toLowerCase();
  
  // Check for id or class attributes in the opening tag only (first 500 chars)
  const openingTagArea = lowerHtml.substring(0, Math.min(500, lowerHtml.length));
  
  for (const pattern of SECTION_PATTERNS) {
    for (const name of pattern.names) {
      // Check id attribute
      if (openingTagArea.includes(`id="${name}"`) || openingTagArea.includes(`id='${name}'`)) {
        return { id: pattern.id, displayName: pattern.displayName };
      }
      // Check class attribute containing the name
      const classMatch = openingTagArea.match(/class=["']([^"']+)["']/);
      if (classMatch && classMatch[1].includes(name)) {
        return { id: pattern.id, displayName: pattern.displayName };
      }
    }
  }
  
  // Fallback: check content for keywords (but prioritize tag-based identification)
  for (const pattern of SECTION_PATTERNS) {
    for (const name of pattern.names) {
      // Look for keywords in headings or prominent text
      const headingMatch = lowerHtml.match(/<h[1-3][^>]*>([^<]*)/i);
      if (headingMatch && headingMatch[1].toLowerCase().includes(name)) {
        return { id: pattern.id, displayName: pattern.displayName };
      }
    }
  }
  
  // Use tag name as fallback
  if (tagName === 'header') {
    return { id: 'header', displayName: 'Header' };
  }
  if (tagName === 'footer') {
    return { id: 'footer', displayName: 'Footer' };
  }
  if (tagName === 'section') {
    // For unidentified sections, create a generic name based on position
    return { id: 'section', displayName: 'Section' };
  }
  
  return null;
}

/**
 * Extract a specific section from HTML
 */
export function extractSection(html: string, sectionId: string): Section | null {
  const sections = parseSections(html);
  return sections.find(s => s.id === sectionId) || null;
}

/**
 * Replace a section in the full HTML with new content
 */
export function replaceSection(fullHtml: string, sectionId: string, newSectionHtml: string): string {
  const sections = parseSections(fullHtml);
  const section = sections.find(s => s.id === sectionId);
  
  if (!section) {
    console.warn(`Section "${sectionId}" not found, returning original HTML`);
    return fullHtml;
  }
  
  // Clean up the new section HTML - remove any markdown artifacts
  let cleanedNewHtml = newSectionHtml.trim();
  if (cleanedNewHtml.startsWith('```html')) {
    cleanedNewHtml = cleanedNewHtml.slice(7);
  } else if (cleanedNewHtml.startsWith('```')) {
    cleanedNewHtml = cleanedNewHtml.slice(3);
  }
  if (cleanedNewHtml.endsWith('```')) {
    cleanedNewHtml = cleanedNewHtml.slice(0, -3);
  }
  cleanedNewHtml = cleanedNewHtml.trim();
  
  // Replace the section
  const before = fullHtml.substring(0, section.startIndex);
  const after = fullHtml.substring(section.endIndex);
  
  return before + cleanedNewHtml + after;
}

/**
 * Get context around a section (surrounding sections' brief info)
 */
export function getSectionContext(html: string, sectionId: string): string {
  const sections = parseSections(html);
  const sectionIndex = sections.findIndex(s => s.id === sectionId);
  
  if (sectionIndex === -1) return '';
  
  const contextParts: string[] = [];
  
  // Add info about previous section
  if (sectionIndex > 0) {
    const prevSection = sections[sectionIndex - 1];
    contextParts.push(`Previous section: ${prevSection.name}`);
  }
  
  // Add info about next section
  if (sectionIndex < sections.length - 1) {
    const nextSection = sections[sectionIndex + 1];
    contextParts.push(`Next section: ${nextSection.name}`);
  }
  
  return contextParts.join('. ');
}
