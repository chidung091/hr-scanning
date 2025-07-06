import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CvSubmission from './cv_submission.js'
import { ASSESSMENT_CONFIG, calculateAssessmentScore } from '../config/assessment_questions.js'

export default class QuestionnaireResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare submissionId: string

  @column()
  declare cvSubmissionId: number

  @column({
    prepare: (value: any) => {
      // Always serialize to JSON string for database storage
      return typeof value === 'string' ? value : JSON.stringify(value)
    },
    consume: (value: any) => {
      // Handle JSON data from PostgreSQL database
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch (error) {
          console.error('Failed to parse JSON from database:', error)
          return {}
        }
      }
      // If it's already an object (PostgreSQL native JSON), return as-is
      return value || {}
    },
  })
  declare responses: Record<string, any>

  // Progress tracking fields
  @column()
  declare currentQuestion: number

  @column()
  declare questionsCompleted: number

  @column({
    consume: (value: any) => Boolean(value)
  })
  declare isCompleted: boolean

  @column()
  declare languagePreference: string

  // Assessment scoring
  @column()
  declare totalScore: number | null

  @column()
  declare assessmentResult: string | null

  @column()
  declare notes: string | null

  // Session management
  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime()
  declare lastActivityAt: DateTime | null

  @belongsTo(() => CvSubmission)
  declare cvSubmission: BelongsTo<typeof CvSubmission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper methods
  public getProgressPercentage(): number {
    return Math.round((this.questionsCompleted / ASSESSMENT_CONFIG.totalQuestions) * 100)
  }

  public isExpired(): boolean {
    if (!this.lastActivityAt) return false
    const timeoutMs = ASSESSMENT_CONFIG.timeoutMinutes * 60 * 1000
    return DateTime.now().diff(this.lastActivityAt).milliseconds > timeoutMs
  }

  public calculateScore(): { totalScore: number; questionScores: Record<string, number>; assessmentResult: string } {
    return calculateAssessmentScore(this.responses)
  }

  public updateProgress(questionNumber: number, response: any): void {
    // Update responses
    this.responses = { ...this.responses, ...response }

    // Update progress tracking
    this.currentQuestion = Math.min(questionNumber + 1, ASSESSMENT_CONFIG.totalQuestions + 1)
    this.questionsCompleted = Math.max(this.questionsCompleted, questionNumber)
    this.lastActivityAt = DateTime.now()

    // Check if completed
    if (this.questionsCompleted >= ASSESSMENT_CONFIG.totalQuestions) {
      this.isCompleted = true
      this.completedAt = DateTime.now()

      // Calculate final score
      const scoring = this.calculateScore()
      this.totalScore = scoring.totalScore
      this.assessmentResult = scoring.assessmentResult
    }
  }

  // Query scopes for common patterns
  static completed() {
    return this.query().where('is_completed', true)
  }

  static byAssessmentResult(result: string) {
    return this.query().where('assessment_result', result)
  }

  static createdAfter(date: DateTime) {
    return this.query().where('created_at', '>=', date.toSQL()!)
  }

  static withCvSubmission() {
    return this.query().preload('cvSubmission', (cvQuery) => {
      cvQuery.select('id', 'submission_id', 'applicant_name', 'applicant_email', 'status')
    })
  }

  static recentActivity() {
    return this.query().orderBy('last_activity_at', 'desc')
  }

  static expiredSessions(timeoutMinutes: number = 30) {
    const cutoffTime = DateTime.now().minus({ minutes: timeoutMinutes })
    return this.query()
      .where('is_completed', false)
      .where('last_activity_at', '<', cutoffTime.toSQL())
  }
}