import { marked } from 'marked';
import katex from 'katex';

/**
 * Configure marked with custom renderer for LaTeX
 */
export function configureMarked() {
  const renderer = new marked.Renderer();

  // Custom renderer for inline code (potential inline math)
  const originalCode = renderer.code.bind(renderer);
  renderer.code = (code, language) => {
    // Let KaTeX handle math, pass through other code blocks
    return originalCode(code, language);
  };

  marked.setOptions({
    renderer,
    breaks: true,
    gfm: true,
  });
}

/**
 * Render markdown with LaTeX support
 */
export function renderMarkdown(content) {
  if (!content) return '';

  // Configure marked if not already done
  configureMarked();

  // First, protect inline math from being processed by marked
  const inlineMathPlaceholders = [];
  let processedContent = content.replace(/\$([^\$\n]+)\$/g, (match, math) => {
    const placeholder = `__INLINE_MATH_${inlineMathPlaceholders.length}__`;
    inlineMathPlaceholders.push(math);
    return placeholder;
  });

  // Protect block math
  const blockMathPlaceholders = [];
  processedContent = processedContent.replace(/\$\$([^\$]+)\$\$/g, (match, math) => {
    const placeholder = `__BLOCK_MATH_${blockMathPlaceholders.length}__`;
    blockMathPlaceholders.push(math);
    return placeholder;
  });

  // Convert markdown to HTML
  let html = marked.parse(processedContent);

  // Restore and render inline math
  inlineMathPlaceholders.forEach((math, index) => {
    const placeholder = `__INLINE_MATH_${index}__`;
    try {
      const rendered = katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
      });
      html = html.replace(placeholder, rendered);
    } catch (error) {
      console.error('Inline math render error:', error);
      html = html.replace(placeholder, `$${math}$`);
    }
  });

  // Restore and render block math
  blockMathPlaceholders.forEach((math, index) => {
    const placeholder = `__BLOCK_MATH_${index}__`;
    try {
      const rendered = katex.renderToString(math, {
        throwOnError: false,
        displayMode: true,
      });
      html = html.replace(placeholder, `<div class="math-block">${rendered}</div>`);
    } catch (error) {
      console.error('Block math render error:', error);
      html = html.replace(placeholder, `<div class="math-block">$$${math}$$</div>`);
    }
  });

  return html;
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}
