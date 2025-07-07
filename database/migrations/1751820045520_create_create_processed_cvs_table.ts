import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'processed_cvs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Reference to the original CV submission
      table.integer('cv_submission_id').unsigned().notNullable().references('id').inTable('cv_submissions').onDelete('CASCADE')

      // Processing metadata
      table.string('processing_status').notNullable().defaultTo('pending') // pending, processing, completed, failed
      table.timestamp('processing_started_at').nullable()
      table.timestamp('processing_completed_at').nullable()

      // OpenAI processing details
      table.string('openai_model').nullable() // Track which model was used
      table.integer('tokens_used').nullable() // Track token usage for cost monitoring
      table.integer('processing_time_ms').nullable() // Track processing time

      // Extracted structured data (JSON)
      table.json('extracted_data').nullable() // The structured CV data from OpenAI

      // Error handling
      table.text('error_message').nullable() // Store error details if processing fails
      table.integer('retry_count').defaultTo(0) // Track retry attempts
      table.timestamp('last_retry_at').nullable()

      // Quality and validation
      table.boolean('data_validated').defaultTo(false) // Whether the extracted data passed validation
      table.text('validation_notes').nullable() // Any validation issues or notes

      // Search and indexing support
      table.text('searchable_text').nullable() // Flattened text for search functionality

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes for performance
      table.index(['cv_submission_id'], 'processed_cvs_cv_submission_id_index')
      table.index(['processing_status'], 'processed_cvs_processing_status_index')
      table.index(['processing_completed_at'], 'processed_cvs_processing_completed_at_index')
      table.index(['data_validated'], 'processed_cvs_data_validated_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}