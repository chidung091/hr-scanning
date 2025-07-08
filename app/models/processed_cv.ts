import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CvSubmission from './cv_submission.js'
import type { ExtractedCvData } from '#services/openai_service'

export default class ProcessedCv extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cvSubmissionId: number

  @column()
  declare processingStatus: 'pending' | 'processing' | 'completed' | 'failed'

  @column.dateTime()
  declare processingStartedAt: DateTime | null

  @column.dateTime()
  declare processingCompletedAt: DateTime | null

  @column()
  declare openaiModel: string | null

  @column()
  declare tokensUsed: number | null

  @column()
  declare processingTimeMs: number | null

  @column({
    prepare: (value: ExtractedCvData | null) => {
      if (!value) return null
      if (typeof value === 'string') return value
      return JSON.stringify(value)
    },
    consume: (value: any) => {
      if (!value) return null
      if (typeof value === 'object') return value as ExtractedCvData
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as ExtractedCvData
        } catch (error) {
          console.error('Failed to parse extracted_data JSON:', error)
          return null
        }
      }
      return null
    },
  })
  declare extractedData: ExtractedCvData | null

  @column()
  declare errorMessage: string | null

  @column()
  declare retryCount: number

  @column.dateTime()
  declare lastRetryAt: DateTime | null

  @column({
    consume: (value: any) => Boolean(value),
    prepare: (value: boolean) => value,
  })
  declare dataValidated: boolean

  @column()
  declare validationNotes: string | null

  @column()
  declare searchableText: string | null

  @belongsTo(() => CvSubmission)
  declare cvSubmission: BelongsTo<typeof CvSubmission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper methods for processing workflow
  public markAsProcessing(): void {
    this.processingStatus = 'processing'
    this.processingStartedAt = DateTime.now()
  }

  public markAsCompleted(
    data: ExtractedCvData,
    tokensUsed: number,
    processingTime: number,
    model: string
  ): void {
    this.processingStatus = 'completed'
    this.processingCompletedAt = DateTime.now()
    this.extractedData = data
    this.tokensUsed = tokensUsed
    this.processingTimeMs = processingTime
    this.openaiModel = model
    this.dataValidated = true
    this.generateSearchableText()
  }

  public markAsFailed(errorMessage: string): void {
    this.processingStatus = 'failed'
    this.processingCompletedAt = DateTime.now()
    this.errorMessage = errorMessage
    this.retryCount += 1
    this.lastRetryAt = DateTime.now()
  }

  public canRetry(): boolean {
    return this.retryCount < 3 && this.processingStatus === 'failed'
  }

  // Generate searchable text from extracted data for search functionality
  private generateSearchableText(): void {
    if (!this.extractedData) {
      this.searchableText = null
      return
    }

    const searchableFields: string[] = []
    const data = this.extractedData

    // Personal information
    if (data.PersonalInformation.Name) searchableFields.push(data.PersonalInformation.Name)
    if (data.PersonalInformation.Email) searchableFields.push(data.PersonalInformation.Email)

    // Job objective
    if (data.JobObjective.DesiredPosition) searchableFields.push(data.JobObjective.DesiredPosition)
    if (data.JobObjective.CareerGoals) searchableFields.push(data.JobObjective.CareerGoals)

    // Education
    data.Education.forEach((edu) => {
      if (edu.School) searchableFields.push(edu.School)
      if (edu.Major) searchableFields.push(edu.Major)
      if (edu.DegreeLevel) searchableFields.push(edu.DegreeLevel)
    })

    // Work experience
    data.WorkExperience.forEach((work) => {
      if (work.Company) searchableFields.push(work.Company)
      if (work.JobTitle) searchableFields.push(work.JobTitle)
      if (work.Description) searchableFields.push(work.Description)
    })

    // Skills
    searchableFields.push(...data.Skills.Technical)
    searchableFields.push(...data.Skills.Soft)

    // Technology experience
    searchableFields.push(...data.TechnologyExperience)

    // Projects
    data.Projects.forEach((project) => {
      if (project.ProjectName) searchableFields.push(project.ProjectName)
      if (project.Description) searchableFields.push(project.Description)
      searchableFields.push(...project.Technologies)
    })

    // Languages
    data.Languages.forEach((lang) => {
      if (lang.Name) searchableFields.push(lang.Name)
    })

    // Certifications
    data.Certifications.forEach((cert) => {
      if (cert.Name) searchableFields.push(cert.Name)
      if (cert.Issuer) searchableFields.push(cert.Issuer)
    })

    // Interests
    searchableFields.push(...data.Interests)

    this.searchableText = searchableFields
      .filter((field) => field && field.trim())
      .join(' ')
      .toLowerCase()
  }

  // Query scopes for common patterns
  static byStatus(status: 'pending' | 'processing' | 'completed' | 'failed') {
    return this.query().where('processing_status', status)
  }

  static completed() {
    return this.query().where('processing_status', 'completed')
  }

  static failed() {
    return this.query().where('processing_status', 'failed')
  }

  static canRetry() {
    return this.query().where('processing_status', 'failed').where('retry_count', '<', 3)
  }

  static withCvSubmission() {
    return this.query().preload('cvSubmission', (cvQuery) => {
      cvQuery.select(
        'id',
        'submission_id',
        'applicant_name',
        'applicant_email',
        'original_filename'
      )
    })
  }

  static recentFirst() {
    return this.query().orderBy('created_at', 'desc')
  }

  static processedAfter(date: DateTime) {
    return this.query().where('processing_completed_at', '>=', date.toSQL()!)
  }

  static searchByText(searchTerm: string) {
    return this.query().whereILike('searchable_text', `%${searchTerm.toLowerCase()}%`)
  }

  static withValidData() {
    return this.query().where('data_validated', true)
  }
}
