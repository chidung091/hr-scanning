import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questionnaire_responses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Progress tracking fields
      table.integer('current_question').defaultTo(1) // Track which question user is on (1-6)
      table.integer('questions_completed').defaultTo(0) // Number of questions completed
      table.boolean('is_completed').defaultTo(false) // Whether all questions are completed
      table.string('language_preference').defaultTo('en') // 'en' or 'vi'

      // Session management
      table.timestamp('started_at').nullable() // When assessment was started
      table.timestamp('completed_at').nullable() // When assessment was completed
      table.timestamp('last_activity_at').nullable() // Last time user interacted
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_question')
      table.dropColumn('questions_completed')
      table.dropColumn('is_completed')
      table.dropColumn('language_preference')
      table.dropColumn('started_at')
      table.dropColumn('completed_at')
      table.dropColumn('last_activity_at')
    })
  }
}