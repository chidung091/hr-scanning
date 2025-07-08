import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AiCriterion extends BaseModel {
  static table = 'ai_criteria'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare weight: number

  @column()
  declare description: string | null

  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Scopes
  static activeCriteria() {
    return this.query()
      .where('is_active', true)
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')
  }

  static byWeight() {
    return this.query().orderBy('weight', 'desc').orderBy('sort_order', 'asc')
  }
}
