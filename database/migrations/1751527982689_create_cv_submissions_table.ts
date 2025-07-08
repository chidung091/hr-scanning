import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cv_submissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('filename').notNullable()
      table.string('original_filename').notNullable()
      table.string('file_path').notNullable()
      table.integer('file_size').notNullable()
      table.string('mime_type').notNullable()
      table.string('submission_id').unique().notNullable()
      table.string('applicant_email').nullable()
      table.string('applicant_name').nullable()
      table.string('status').defaultTo('pending') // pending, reviewed, accepted, rejected

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
