import { test } from '@japa/runner'
import {
  sanitizeFilename,
  generateSafeFileKey,
  isFilenameSafe,
  previewSanitization,
} from '#utils/filename_sanitizer'

test.group('Filename Sanitizer', () => {
  test('should sanitize filename with parentheses and spaces', ({ assert }) => {
    const input = 'FE_Nguyen Tung Lam_Angular_Developer (1).docx'
    const expected = 'FE_Nguyen_Tung_Lam_Angular_Developer_1.docx'
    const result = sanitizeFilename(input)

    assert.equal(result, expected)
  })

  test('should handle various special characters', ({ assert }) => {
    const input = 'Resume@2024#John&Doe[Senior]<Developer>.pdf'
    const expected = 'Resume_2024_John_Doe_Senior_Developer.pdf'
    const result = sanitizeFilename(input)

    assert.equal(result, expected)
  })

  test('should preserve file extension', ({ assert }) => {
    const input = 'My CV (Updated).docx'
    const result = sanitizeFilename(input)

    assert.isTrue(result.endsWith('.docx'))
    assert.equal(result, 'My_CV_Updated.docx')
  })

  test('should handle filename without extension', ({ assert }) => {
    const input = 'My Resume (Final Version)'
    const expected = 'My_Resume_Final_Version'
    const result = sanitizeFilename(input)

    assert.equal(result, expected)
  })

  test('should handle multiple consecutive special characters', ({ assert }) => {
    const input = 'CV   !!!   John   Doe   (((2024))).pdf'
    const expected = 'CV_John_Doe_2024.pdf'
    const result = sanitizeFilename(input)

    assert.equal(result, expected)
  })

  test('should handle empty or invalid input', ({ assert }) => {
    assert.equal(sanitizeFilename(''), 'unnamed_file')
    assert.equal(sanitizeFilename('   '), 'unnamed_file')
    assert.equal(sanitizeFilename(null as any), 'unnamed_file')
    assert.equal(sanitizeFilename(undefined as any), 'unnamed_file')
  })

  test('should handle filename with only special characters', ({ assert }) => {
    const input = '()[]{}!@#$%^&*.pdf'
    const expected = 'sanitized_file.pdf'
    const result = sanitizeFilename(input)

    assert.equal(result, expected)
  })

  test('should respect max length limit', ({ assert }) => {
    const longFilename = 'a'.repeat(300) + '.pdf'
    const result = sanitizeFilename(longFilename, { maxLength: 50 })

    assert.isTrue(result.length <= 50)
    assert.isTrue(result.endsWith('.pdf'))
  })

  test('should use custom replacement character', ({ assert }) => {
    const input = 'My CV (Updated).docx'
    const result = sanitizeFilename(input, { replacement: '-' })

    assert.equal(result, 'My-CV-Updated.docx')
  })

  test('should not preserve extension when disabled', ({ assert }) => {
    const input = 'My CV (Updated).docx'
    const result = sanitizeFilename(input, { preserveExtension: false })

    assert.equal(result, 'My_CV_Updated_docx')
  })
})

test.group('Generate Safe File Key', () => {
  test('should generate safe file key with prefix', ({ assert }) => {
    const uniqueId = 'abc123'
    const filename = 'John Doe Resume (Final).pdf'
    const result = generateSafeFileKey(uniqueId, filename, 'cvs/')

    assert.equal(result, 'cvs/abc123_John_Doe_Resume_Final.pdf')
  })

  test('should generate safe file key without prefix', ({ assert }) => {
    const uniqueId = 'xyz789'
    const filename = 'CV_Updated (2024).docx'
    const result = generateSafeFileKey(uniqueId, filename)

    assert.equal(result, 'xyz789_CV_Updated_2024.docx')
  })

  test('should handle problematic filename in file key generation', ({ assert }) => {
    const uniqueId = 'test123'
    const filename = 'FE_Nguyen Tung Lam_Angular_Developer (1).docx'
    const result = generateSafeFileKey(uniqueId, filename, 'cvs/')

    assert.equal(result, 'cvs/test123_FE_Nguyen_Tung_Lam_Angular_Developer_1.docx')
  })
})

test.group('Filename Safety Validation', () => {
  test('should identify safe filenames', ({ assert }) => {
    assert.isTrue(isFilenameSafe('resume.pdf'))
    assert.isTrue(isFilenameSafe('john_doe_cv.docx'))
    assert.isTrue(isFilenameSafe('CV-2024.pdf'))
  })

  test('should identify unsafe filenames', ({ assert }) => {
    assert.isFalse(isFilenameSafe('resume (1).pdf'))
    assert.isFalse(isFilenameSafe('john doe cv.docx'))
    assert.isFalse(isFilenameSafe('CV@2024.pdf'))
    assert.isFalse(isFilenameSafe('file<name>.txt'))
  })

  test('should handle invalid input for safety check', ({ assert }) => {
    assert.isFalse(isFilenameSafe(''))
    assert.isFalse(isFilenameSafe(null as any))
    assert.isFalse(isFilenameSafe(undefined as any))
  })
})

test.group('Preview Sanitization', () => {
  test('should preview sanitization without modifying original', ({ assert }) => {
    const original = 'My CV (Updated).docx'
    const preview = previewSanitization(original)

    assert.equal(preview, 'My_CV_Updated.docx')
    assert.equal(original, 'My CV (Updated).docx') // Original unchanged
  })

  test('should preview with custom replacement', ({ assert }) => {
    const original = 'Resume (Final Version).pdf'
    const preview = previewSanitization(original, '-')

    assert.equal(preview, 'Resume-Final-Version.pdf')
  })
})

test.group('Real-world CV Filename Examples', () => {
  test('should handle common CV filename patterns', ({ assert }) => {
    const testCases = [
      {
        input: 'FE_Nguyen Tung Lam_Angular_Developer (1).docx',
        expected: 'FE_Nguyen_Tung_Lam_Angular_Developer_1.docx',
      },
      {
        input: 'John Smith - Senior Software Engineer Resume.pdf',
        expected: 'John_Smith_Senior_Software_Engineer_Resume.pdf',
      },
      {
        input: 'CV_Jane_Doe_[Updated_2024].docx',
        expected: 'CV_Jane_Doe_Updated_2024.docx',
      },
      {
        input: 'Resume - Full Stack Developer (React & Node.js).pdf',
        expected: 'Resume_Full_Stack_Developer_React_Node.js.pdf',
      },
      {
        input: 'Curriculum Vitae - Dr. Smith, PhD.pdf',
        expected: 'Curriculum_Vitae_Dr._Smith_PhD.pdf',
      },
    ]

    testCases.forEach(({ input, expected }) => {
      const result = sanitizeFilename(input)
      assert.equal(result, expected, `Failed for input: ${input}`)
    })
  })
})
