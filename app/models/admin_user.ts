import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'

export default class AdminUser extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hash password before saving
  static async hashPassword(password: string): Promise<string> {
    return await hash.make(password)
  }

  // Verify password
  async verifyPassword(password: string): Promise<boolean> {
    return await hash.verify(this.password, password)
  }

  // Update last login timestamp
  async updateLastLogin(): Promise<void> {
    this.lastLoginAt = DateTime.now()
    await this.save()
  }

  // Find active admin by username
  static async findActiveByUsername(username: string): Promise<AdminUser | null> {
    return await this.query().where('username', username).where('is_active', true).first()
  }
}
