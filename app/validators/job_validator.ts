import vine from '@vinejs/vine'

/**
 * Validator for job creation
 */
export const createJobValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(200),
    description: vine.string().minLength(10).maxLength(5000),
    requirements: vine.string().minLength(10).maxLength(3000),
    location: vine.string().minLength(2).maxLength(100),
    department: vine.string().minLength(2).maxLength(100),
    employmentType: vine.enum(['full-time', 'part-time', 'contract', 'internship']),
    experienceLevel: vine.enum(['entry', 'mid', 'senior', 'executive']),
    salaryMin: vine.number().positive().optional(),
    salaryMax: vine.number().positive().optional(),
    currency: vine.string().fixedLength(3).optional(), // ISO currency code
    isActive: vine.boolean().optional(),
    applicationDeadline: vine.date().afterOrEqual('today').optional(),
    tags: vine.array(vine.string().minLength(1).maxLength(50)).maxLength(10).optional()
  })
)

/**
 * Validator for job update
 */
export const updateJobValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(200).optional(),
    description: vine.string().minLength(10).maxLength(5000).optional(),
    requirements: vine.string().minLength(10).maxLength(3000).optional(),
    location: vine.string().minLength(2).maxLength(100).optional(),
    department: vine.string().minLength(2).maxLength(100).optional(),
    employmentType: vine.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    experienceLevel: vine.enum(['entry', 'mid', 'senior', 'executive']).optional(),
    salaryMin: vine.number().positive().optional(),
    salaryMax: vine.number().positive().optional(),
    currency: vine.string().fixedLength(3).optional(),
    isActive: vine.boolean().optional(),
    applicationDeadline: vine.date().afterOrEqual('today').optional(),
    tags: vine.array(vine.string().minLength(1).maxLength(50)).maxLength(10).optional()
  })
)

/**
 * Validator for job query parameters
 */
export const jobQueryValidator = vine.compile(
  vine.object({
    search: vine.string().minLength(1).maxLength(100).optional(),
    department: vine.string().minLength(1).maxLength(100).optional(),
    location: vine.string().minLength(1).maxLength(100).optional(),
    employmentType: vine.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    experienceLevel: vine.enum(['entry', 'mid', 'senior', 'executive']).optional(),
    isActive: vine.boolean().optional(),
    salaryMin: vine.number().positive().optional(),
    salaryMax: vine.number().positive().optional(),
    tags: vine.array(vine.string().minLength(1).maxLength(50)).optional(),
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    sortBy: vine.enum(['createdAt', 'updatedAt', 'title', 'department', 'applicationDeadline']).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional()
  })
)

/**
 * Validator for job ID parameter
 */
export const jobIdValidator = vine.compile(
  vine.object({
    id: vine.number().positive()
  })
)

/**
 * Validator for bulk job operations
 */
export const bulkJobOperationValidator = vine.compile(
  vine.object({
    jobIds: vine.array(vine.number().positive()).minLength(1).maxLength(50),
    operation: vine.enum(['activate', 'deactivate', 'delete']),
    reason: vine.string().minLength(3).maxLength(500).optional()
  })
)
