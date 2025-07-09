import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CvSubmission from './cv_submission.js'
import Job from './job.js'

export default class CandidateEvaluation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare candidateId: number

  @column()
  declare jobId: number

  @column()
  declare cvSubmissionId: number

  @column()
  declare score: number

  @column({
    serialize: (value: string) => JSON.parse(value),
    prepare: (value: string[]) => JSON.stringify(value)
  })
  declare strengths: string[]

  @column({
    serialize: (value: string) => JSON.parse(value),
    prepare: (value: string[]) => JSON.stringify(value)
  })
  declare weaknesses: string[]

  @column()
  declare explanation: string

  @column()
  declare recommendation: 'Proceed to next round' | 'Consider with caution' | 'Do not proceed'

  @column({
    serialize: (value: string) => JSON.parse(value),
    prepare: (value: number[]) => JSON.stringify(value)
  })
  declare linkedCriteriaIds: number[]

  @column({
    serialize: (value: string) => JSON.parse(value),
    prepare: (value: number[]) => JSON.stringify(value)
  })
  declare linkedQuestionnaireResponseIds: number[]

  @column()
  declare evaluationModel: string | null

  @column()
  declare tokensUsed: number | null

  @column()
  declare evaluationTimeMs: number | null

  @column()
  declare status: 'pending' | 'completed' | 'failed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => CvSubmission)
  declare cvSubmission: BelongsTo<typeof CvSubmission>

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>
}