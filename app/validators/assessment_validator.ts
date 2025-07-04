import vine from '@vinejs/vine'

/**
 * Validator for assessment session creation
 */
export const createAssessmentValidator = vine.compile(
  vine.object({
    cvSubmissionId: vine.number().positive(),
    language: vine.enum(['en', 'vi']).optional()
  })
)

/**
 * Validator for assessment answer submission
 */
export const submitAnswerValidator = vine.compile(
  vine.object({
    questionId: vine.number().positive(),
    answer: vine.any().optional(), // Will be validated based on question type
    action: vine.enum(['answer', 'skip', 'previous']).optional()
  })
)

/**
 * Validator for multiple choice answers
 */
export const multipleChoiceAnswerValidator = vine.compile(
  vine.object({
    answer: vine.string().minLength(1)
  })
)

/**
 * Validator for text answers
 */
export const textAnswerValidator = vine.compile(
  vine.object({
    answer: vine.string().minLength(1).maxLength(2000)
  })
)

/**
 * Validator for rating answers
 */
export const ratingAnswerValidator = vine.compile(
  vine.object({
    answer: vine.number().min(1).max(10)
  })
)

/**
 * Validator for assessment completion
 */
export const completeAssessmentValidator = vine.compile(
  vine.object({
    sessionId: vine.string().uuid(),
    finalScore: vine.number().min(0).max(100).optional(),
    completedAt: vine.date().optional()
  })
)

/**
 * Validator for assessment query parameters
 */
export const assessmentQueryValidator = vine.compile(
  vine.object({
    cvSubmissionId: vine.number().positive().optional(),
    status: vine.enum(['in_progress', 'completed', 'expired']).optional(),
    language: vine.enum(['en', 'vi']).optional(),
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    sortBy: vine.enum(['createdAt', 'updatedAt', 'score']).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional()
  })
)

/**
 * Custom validator for dynamic question answers based on question type
 */
export function createQuestionAnswerValidator(questionType: string, validation: any) {
  switch (questionType) {
    case 'multiple_choice':
      return vine.compile(
        vine.object({
          answer: vine.string().in(validation.options || [])
        })
      )
    
    case 'text':
      let textSchema = vine.string()
      
      if (validation.minLength) {
        textSchema = textSchema.minLength(validation.minLength)
      }
      
      if (validation.maxLength) {
        textSchema = textSchema.maxLength(validation.maxLength)
      }
      
      return vine.compile(
        vine.object({
          answer: textSchema
        })
      )
    
    case 'rating':
      return vine.compile(
        vine.object({
          answer: vine.number().min(1).max(validation.maxRating || 10)
        })
      )
    
    default:
      return vine.compile(
        vine.object({
          answer: vine.any()
        })
      )
  }
}
