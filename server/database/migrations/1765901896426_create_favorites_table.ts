import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'favorites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('movie_id').notNullable()
      table.string('title').notNullable()
      table.string('release_date').notNullable()
      table.string('poster_path').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Unique constraint: un utente non può avere lo stesso film più volte
      table.unique(['user_id', 'movie_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
