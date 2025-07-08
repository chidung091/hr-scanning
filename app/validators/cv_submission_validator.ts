import vine from '@vinejs/vine'

/**
 * Validator for CV file upload with form data
 */
export const cvUploadValidator = vine.compile(
  vine.object({
    cv_file: vine.file({
      size: '10mb',
      extnames: ['pdf', 'doc', 'docx'],
    }),
    applicant_name: vine.string().minLength(2).maxLength(100),
    applicant_email: vine.string().email().normalizeEmail(),
    job_id: vine.number().positive().optional(),
  })
)

/**
 * Validator for CV submission creation
 */
export const createCvSubmissionValidator = vine.compile(
  vine.object({
    jobId: vine.number().positive(),
    fileName: vine.string().minLength(1).maxLength(255),
    fileUrl: vine.string().url().maxLength(500),
    extractedText: vine.string().optional(),
    fileSize: vine.number().positive().optional(),
    mimeType: vine.string().maxLength(100).optional(),
  })
)

/**
 * Validator for CV submission update
 */
export const updateCvSubmissionValidator = vine.compile(
  vine.object({
    extractedText: vine.string().optional(),
    status: vine.enum(['pending', 'processed', 'failed']).optional(),
    processingError: vine.string().maxLength(1000).optional(),
  })
)

/**
 * Validator for CV submission query parameters
 */
export const cvSubmissionQueryValidator = vine.compile(
  vine.object({
    jobId: vine.number().positive().optional(),
    status: vine.enum(['pending', 'processed', 'failed']).optional(),
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    sortBy: vine.enum(['createdAt', 'fileName', 'status']).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional(),
  })
)
