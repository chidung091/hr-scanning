/**
 * Utility functions for sanitizing filenames to ensure compatibility with file storage systems
 */

/**
 * Sanitize a filename by removing or replacing characters that are not allowed
 * by flydrive or other file storage systems
 *
 * @param filename - The original filename to sanitize
 * @param options - Configuration options for sanitization
 * @returns A sanitized filename safe for storage
 */
export function sanitizeFilename(
  filename: string,
  options: {
    replacement?: string
    maxLength?: number
    preserveExtension?: boolean
  } = {}
): string {
  const { replacement = '_', maxLength = 255, preserveExtension = true } = options

  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    return 'unnamed_file'
  }

  // Extract extension if we need to preserve it
  let extension = ''
  let nameWithoutExtension = filename

  if (preserveExtension) {
    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
      extension = filename.substring(lastDotIndex)
      nameWithoutExtension = filename.substring(0, lastDotIndex)
    }
  } else {
    // If not preserving extension, treat the whole filename as the name part
    nameWithoutExtension = filename
  }

  // Replace problematic characters with the replacement character
  // This includes: spaces, parentheses, brackets, special characters, etc.
  // Note: We include dots in the replacement when not preserving extension
  const dotPattern = preserveExtension ? '' : '\\.'
  const pattern = `[\\s\\(\\)\\[\\]{}'"<>|\\\\\/\\*\\?:;,&%$#@!+=~\`\\-\\^${dotPattern}]`
  let sanitized = nameWithoutExtension
    .replace(new RegExp(pattern, 'g'), replacement)
    // Replace multiple consecutive replacement characters with a single one
    .replace(new RegExp(`\\${replacement}+`, 'g'), replacement)
    // Remove leading and trailing replacement characters
    .replace(new RegExp(`^\\${replacement}+|\\${replacement}+$`, 'g'), '')

  // Ensure the filename is not empty after sanitization
  if (!sanitized) {
    sanitized = 'sanitized_file'
  }

  // Add back the extension only if preserveExtension is true
  const finalFilename = preserveExtension ? sanitized + extension : sanitized

  // Truncate if too long, but preserve extension
  if (finalFilename.length > maxLength) {
    const availableLength = maxLength - extension.length
    if (availableLength > 0) {
      return sanitized.substring(0, availableLength) + extension
    } else {
      // If extension is too long, just truncate everything
      return finalFilename.substring(0, maxLength)
    }
  }

  return finalFilename
}

/**
 * Generate a safe file key for storage systems by combining a unique identifier
 * with a sanitized filename
 *
 * @param uniqueId - A unique identifier (like CUID)
 * @param originalFilename - The original filename
 * @param prefix - Optional prefix for the file key (e.g., 'cvs/')
 * @returns A safe file key for storage
 */
export function generateSafeFileKey(
  uniqueId: string,
  originalFilename: string,
  prefix: string = ''
): string {
  const sanitizedFilename = sanitizeFilename(originalFilename)
  const fileName = `${uniqueId}_${sanitizedFilename}`

  return prefix ? `${prefix}${fileName}` : fileName
}

/**
 * Validate if a filename contains only allowed characters
 *
 * @param filename - The filename to validate
 * @returns True if filename is safe, false otherwise
 */
export function isFilenameSafe(filename: string): boolean {
  if (!filename || typeof filename !== 'string') {
    return false
  }

  // Check for problematic characters
  const problematicChars = /[\s\(\)\[\]{}'"<>|\\\/\*\?:;,&%$#@!+=~`]/
  return !problematicChars.test(filename)
}

/**
 * Get a preview of what a filename will look like after sanitization
 * without actually sanitizing it
 *
 * @param filename - The filename to preview
 * @param replacement - The replacement character to use
 * @returns Preview of the sanitized filename
 */
export function previewSanitization(filename: string, replacement: string = '_'): string {
  return sanitizeFilename(filename, { replacement })
}
