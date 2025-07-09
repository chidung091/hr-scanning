import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'candidate_evaluations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Foreign keys
      table.integer('candidate_id').unsigned().notNullable()
      table.integer('job_id').unsigned().notNullable()
      table.integer('cv_submission_id').unsigned().notNullable()

      // Evaluation results
      table.integer('score').notNullable().checkBetween([1, 10])
      table.json('strengths').notNullable()
      table.json('weaknesses').notNullable()
      table.text('explanation').notNullable()
      table
        .enum('recommendation', [
          'Proceed to next round',
          'Consider with caution',
          'Do not proceed',
        ])
        .notNullable()

      // Linked data for traceability
      table.json('linked_criteria_ids').notNullable()
      table.json('linked_questionnaire_response_ids').notNullable()

      // Evaluation metadata
      table.string('evaluation_model').nullable()
      table.integer('tokens_used').nullable()
      table.integer('evaluation_time_ms').nullable()
      table.enum('status', ['pending', 'completed', 'failed']).defaultTo('pending')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Foreign key constraints
      table
        .foreign('cv_submission_id')
        .references('id')
        .inTable('cv_submissions')
        .onDelete('CASCADE')
      table.foreign('job_id').references('id').inTable('jobs').onDelete('CASCADE')

      // Indexes
      table.index(['candidate_id', 'job_id'])
      table.index(['cv_submission_id'])
      table.index(['score'])
      table.index(['recommendation'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
