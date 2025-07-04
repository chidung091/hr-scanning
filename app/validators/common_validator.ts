import vine from '@vinejs/vine'

/**
 * Common pagination validator
 */
export const paginationValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    sortBy: vine.string().minLength(1).maxLength(50).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional()
  })
)

/**
 * Common search validator
 */
export const searchValidator = vine.compile(
  vine.object({
    q: vine.string().minLength(1).maxLength(200).optional(),
    search: vine.string().minLength(1).maxLength(200).optional(),
    query: vine.string().minLength(1).maxLength(200).optional()
  })
)

/**
 * Common ID parameter validator
 */
export const idValidator = vine.compile(
  vine.object({
    id: vine.number().positive()
  })
)

/**
 * Common UUID parameter validator
 */
export const uuidValidator = vine.compile(
  vine.object({
    id: vine.string().uuid()
  })
)

/**
 * Common date range validator
 */
export const dateRangeValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().afterField('startDate').optional(),
    dateFrom: vine.date().optional(),
    dateTo: vine.date().afterField('dateFrom').optional()
  })
)

/**
 * Common status validator
 */
export const statusValidator = vine.compile(
  vine.object({
    status: vine.enum(['active', 'inactive', 'pending', 'completed', 'failed']).optional()
  })
)

/**
 * File upload validator (generic)
 */
export const fileUploadValidator = vine.compile(
  vine.object({
    file: vine
      .file({
        size: '10mb',
        extnames: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']
      })
      .optional()
  })
)

/**
 * Email validator
 */
export const emailValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail()
  })
)

/**
 * Phone validator
 */
export const phoneValidator = vine.compile(
  vine.object({
    phone: vine.string().mobile().optional()
  })
)

/**
 * Language validator
 */
export const languageValidator = vine.compile(
  vine.object({
    language: vine.enum(['en', 'vi']).optional(),
    lang: vine.enum(['en', 'vi']).optional(),
    locale: vine.enum(['en', 'vi']).optional()
  })
)

/**
 * Bulk operation validator
 */
export const bulkOperationValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number().positive()).minLength(1).maxLength(100),
    operation: vine.string().minLength(1).maxLength(50),
    reason: vine.string().minLength(3).maxLength(500).optional(),
    confirm: vine.boolean().optional()
  })
)

/**
 * Custom validation rules
 */

/**
 * Validate that a string contains only alphanumeric characters and common symbols
 */
export const alphanumericWithSymbolsRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'string') {
    return
  }

  const pattern = /^[a-zA-Z0-9\s\-_.,!?()]+$/
  if (!pattern.test(value)) {
    field.report('The {{ field }} field must contain only letters, numbers, and common symbols', 'alphanumericWithSymbols', field)
  }
})

/**
 * Validate file size in a more flexible way
 */
export const fileSizeRule = vine.createRule((value: any, options: { maxSize?: number } = {}, field) => {
  if (!value || typeof value.size !== 'number') {
    return
  }

  const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB default
  if (value.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    field.report(`The {{ field }} field must be smaller than ${maxSizeMB}MB`, 'fileSize', field)
  }
})

/**
 * Validate that a date is not in the past
 */
export const notPastDateRule = vine.createRule((value, _options, field) => {
  if (!value || !(value instanceof Date)) {
    return
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0) // Start of today

  if (value < now) {
    field.report('The {{ field }} field cannot be in the past', 'notPastDate', field)
  }
})
