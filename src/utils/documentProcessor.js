import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Allowed file types
export const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Extract text from PDF file
 */
export async function extractPDFText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('PDF文件解析失败：' + error.message);
  }
}

/**
 * Extract text from Word document
 */
export async function extractWordText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Word文档解析失败：' + error.message);
  }
}

/**
 * Extract text from PowerPoint file
 */
export async function extractPowerPointText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    let fullText = '';

    // Extract text from slides
    const slideFiles = Object.keys(zip.files).filter(name =>
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );

    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async('text');
      // Extract text between <a:t> tags
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
      if (textMatches) {
        const slideText = textMatches
          .map(match => match.replace(/<\/?a:t>/g, ''))
          .join(' ');
        fullText += slideText + '\n\n';
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error('PowerPoint extraction error:', error);
    throw new Error('PowerPoint文件解析失败：' + error.message);
  }
}

/**
 * Extract text from plain text file
 */
export async function extractPlainText(file) {
  try {
    return await file.text();
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('文本文件读取失败：' + error.message);
  }
}

/**
 * Main function to extract file content based on file type
 */
export async function extractFileContent(file) {
  const mimeType = file.type;

  if (mimeType === 'application/pdf') {
    return await extractPDFText(file);
  } else if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await extractWordText(file);
  } else if (
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return await extractPowerPointText(file);
  } else if (mimeType === 'text/plain') {
    return await extractPlainText(file);
  } else {
    throw new Error('不支持的文件类型：' + mimeType);
  }
}

/**
 * Validate file
 */
export function validateFile(file) {
  if (!file) {
    throw new Error('未选择文件');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('不支持的文件类型。支持的格式：PDF、Word、PowerPoint、TXT');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`);
  }

  return true;
}

/**
 * Get file type display name
 */
export function getFileTypeDisplay(file) {
  const mimeType = file.type;
  const typeMap = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'text/plain': 'TXT',
  };
  return typeMap[mimeType] || '未知';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
