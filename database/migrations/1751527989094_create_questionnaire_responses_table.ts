import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questionnaire_responses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('submission_id').notNullable()
      table
        .integer('cv_submission_id')
        .unsigned()
        .references('id')
        .inTable('cv_submissions')
        .onDelete('CASCADE')

      // Store all questionnaire responses as JSON for flexibility
      table.json('responses').notNullable()

      // Progress tracking fields
      table.integer('current_question').defaultTo(1) // Track which question user is on (1-6)
      table.integer('questions_completed').defaultTo(0) // Number of questions completed
      table.boolean('is_completed').defaultTo(false) // Whether all questions are completed
      table.string('language_preference').defaultTo('en') // 'en' or 'vi'

      // Assessment scoring
      table.integer('total_score').nullable()
      table.string('assessment_result').nullable() // excellent, good, fair, poor
      table.text('notes').nullable()

      // Session management
      table.timestamp('started_at').nullable() // When assessment was started
      table.timestamp('completed_at').nullable() // When assessment was completed
      table.timestamp('last_activity_at').nullable() // Last time user interacted

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
