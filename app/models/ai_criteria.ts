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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Scopes
  static activeCriteria() {
    return this.query().where('isActive', true).orderBy('name', 'asc')
  }

  // Validation method to ensure weights sum to 1.0
  static async validateWeights(excludeId?: number) {
    let query = this.query().where('isActive', true)

    if (excludeId) {
      query = query.where('id', '!=', excludeId)
    }

    const criteria = await query
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0)

    return {
      isValid: totalWeight <= 1.0,
      currentTotal: totalWeight,
      remaining: 1.0 - totalWeight,
    }
  }
}
