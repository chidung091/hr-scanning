import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AiCriteria extends BaseModel {
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

  // Query scopes
  static activeCriteria() {
    return this.query()
      .where('is_active', true)
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')
  }

  // Validation helpers
  static validateWeight(weight: number): boolean {
    return weight >= 0 && weight <= 1
  }

  // Get total weight of all active criteria
  static async getTotalWeight(): Promise<number> {
    const result = await this.query().where('is_active', true).sum('weight as total')

    const total = result[0]?.$extras.total || 0
    return Number.parseFloat(total) || 0
  }

  // Get criteria for AI evaluation
  static async getForEvaluation(): Promise<AiCriteria[]> {
    return await this.activeCriteria()
  }

  // Serialize method to ensure weight is always a number
  serialize() {
    const serialized = super.serialize()
    return {
      ...serialized,
      weight: Number.parseFloat(serialized.weight) || 0,
    }
  }
}
