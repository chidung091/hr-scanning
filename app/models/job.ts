import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import CvSubmission from './cv_submission.js'

export default class Job extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Basic job information
  @column()
  declare jobTitle: string

  @column()
  declare numberOfEmployees: number

  @column()
  declare startTime: string | null

  @column()
  declare endTime: string | null

  @column()
  declare workingTime: string | null

  @column()
  declare workLocation: string | null

  @column()
  declare salaryRange: string | null

  // Job details
  @column()
  declare responsibilities: string | null

  @column()
  declare requirements: string | null

  @column()
  declare preferredQualifications: string | null

  @column()
  declare benefits: string | null

  @column()
  declare probationPolicy: string | null

  @column()
  declare equipmentProvided: string | null

  @column()
  declare otherPerks: string | null

  // Job status and metadata
  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  // Relationships
  @hasMany(() => CvSubmission)
  declare cvSubmissions: HasMany<typeof CvSubmission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Scopes
  static activeJobs() {
    return this.query()
      .where('isActive', true)
      .orderBy('sortOrder', 'asc')
      .orderBy('createdAt', 'desc')
  }
}
