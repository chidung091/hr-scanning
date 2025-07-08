import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, belongsTo } from '@adonisjs/lucid/orm'
import type { HasOne, BelongsTo } from '@adonisjs/lucid/types/relations'
import QuestionnaireResponse from './questionnaire_response.js'
import Job from './job.js'
import ProcessedCv from './processed_cv.js'

export default class CvSubmission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare filename: string

  @column()
  declare originalFilename: string

  @column()
  declare filePath: string

  @column()
  declare fileSize: number

  @column()
  declare mimeType: string

  @column()
  declare submissionId: string

  @column()
  declare applicantEmail: string | null

  @column()
  declare applicantName: string | null

  @column()
  declare status: string

  @column()
  declare extractedText: string | null

  @column({ columnName: 'base64_content' })
  declare base64Content: string | null

  @column()
  declare jobId: number | null

  @hasOne(() => QuestionnaireResponse)
  declare questionnaireResponse: HasOne<typeof QuestionnaireResponse>

  @hasOne(() => ProcessedCv)
  declare processedCv: HasOne<typeof ProcessedCv>

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Query scopes for common patterns
  static byStatus(status: string) {
    return this.query().where('status', status)
  }

  static bySubmissionId(submissionId: string) {
    return this.query().where('submission_id', submissionId)
  }

  static withJob() {
    return this.query().preload('job', (jobQuery) => {
      jobQuery.select('id', 'job_title', 'work_location', 'salary_range')
    })
  }

  static withQuestionnaireResponse() {
    return this.query().preload('questionnaireResponse', (responseQuery) => {
      responseQuery.select(
        'id',
        'cv_submission_id',
        'is_completed',
        'total_score',
        'assessment_result',
        'completed_at'
      )
    })
  }

  static withCompleteDetails() {
    return this.query().preload('job').preload('questionnaireResponse').preload('processedCv')
  }

  static withProcessedCv() {
    return this.query().preload('processedCv')
  }

  static withSuccessfullyProcessedCv() {
    return this.query().preload('processedCv', (processedQuery) => {
      processedQuery.where('processing_status', 'completed')
    })
  }

  static recentFirst() {
    return this.query().orderBy('created_at', 'desc')
  }

  static createdAfter(date: DateTime) {
    return this.query().where('created_at', '>=', date.toSQL()!)
  }

  static withCompletedAssessment() {
    return this.query().whereHas('questionnaireResponse', (subQuery) => {
      subQuery.where('is_completed', true)
    })
  }

  static withoutCompletedAssessment() {
    return this.query().whereDoesntHave('questionnaireResponse', (subQuery) => {
      subQuery.where('is_completed', true)
    })
  }
}
