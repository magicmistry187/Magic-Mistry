/**
 * Utility functions and constants for file size and format validation across frontend uploaders.
 * Enforces a strict maximum limit of 4MB for all image and PDF uploads.
 */

export const MAX_FILE_SIZE_MB = 4;
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4,194,304 bytes

/**
 * Checks whether a file is within the maximum size limit.
 * @param {File|Blob} file
 * @param {number} maxBytes
 * @returns {boolean}
 */
export function isFileSizeValid(file, maxBytes = MAX_FILE_SIZE_BYTES) {
  if (!file || typeof file.size !== 'number') return true;
  return file.size <= maxBytes;
}

/**
 * Formats bytes into a human-readable string (KB or MB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates file size and type.
 * @param {File} file
 * @param {Object} options
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateUploadFile(file, options = {}) {
  const {
    maxBytes = MAX_FILE_SIZE_BYTES,
    maxMb = MAX_FILE_SIZE_MB,
    allowPdf = false,
    fileLabel = 'file',
  } = options;

  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Size validation
  if (!isFileSizeValid(file, maxBytes)) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the ${maxMb}MB limit. Please choose a smaller ${fileLabel}.`,
    };
  }

  // Type validation
  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name || '');
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');

  if (allowPdf) {
    if (!isImage && !isPdf) {
      return {
        valid: false,
        error: 'Only image (JPG, PNG, WEBP) and PDF files are allowed.',
      };
    }
  } else {
    if (!isImage) {
      return {
        valid: false,
        error: 'Please upload a valid image file (PNG, JPG, or WEBP).',
      };
    }
  }

  return { valid: true, error: null };
}

