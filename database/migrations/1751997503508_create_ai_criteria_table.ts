import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_criteria'

  async up() {
    // Check if table already exists
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) {
      return
    }

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.decimal('weight', 3, 2).notNullable() // Allows values like 0.25, 0.50, etc.
      table.text('description').nullable()
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['is_active'])
      table.index(['name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
