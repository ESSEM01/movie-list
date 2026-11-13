import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One review per user and movie. Existing duplicates must be removed
 * before running this migration, otherwise it fails.
 */
export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['user_id', 'movie_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // MySQL: la FK su user_id usa l'indice unique, ne serve uno proprio prima di rimuoverlo
      table.index(['user_id'])
      table.dropUnique(['user_id', 'movie_id'])
    })
  }
}
