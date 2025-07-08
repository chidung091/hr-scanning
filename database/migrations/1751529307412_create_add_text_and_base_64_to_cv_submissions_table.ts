import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cv_submissions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('extracted_text').nullable()
      table.text('base64_content').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('extracted_text')
      table.dropColumn('base64_content')
    })
  }
}
