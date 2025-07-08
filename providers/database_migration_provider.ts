/*
|--------------------------------------------------------------------------
| Database Migration Provider
|--------------------------------------------------------------------------
|
| This provider automatically runs database migrations on application startup
| to ensure the database schema is up-to-date. It includes safety checks to
| prevent issues on subsequent application restarts.
|
*/

import type { ApplicationService } from '@adonisjs/core/types'
import { Database } from '@adonisjs/lucid/database'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import env from '#start/env'

// Define the migration list node type locally since it's not exported from the main package
interface MigrationListNode {
  name: string
  status: 'pending' | 'migrated' | 'corrupt'
  batch?: number
  migrationTime?: Date
}

export default class DatabaseMigrationProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register method called during the "registering" lifecycle
   */
  register() {
    // Nothing to register
  }

  /**
   * Boot method called during the "booting" lifecycle
   */
  async boot() {
    // Nothing to register during boot
  }

  /**
   * Ready method called during the "ready" lifecycle
   */
  async ready() {
    // Only run migrations in production and development environments
    // Skip in test environment to avoid conflicts with test setup
    if (this.app.inTest) {
      return
    }

    try {
      await this.runMigrationsIfNeeded()
    } catch (error) {
      console.error('Failed to run automatic database migrations:', error)
      // Don't throw the error to prevent application startup failure
      // Log the error and let the application continue
    }
  }

  /**
   * Shutdown method called during application shutdown
   */
  async shutdown() {
    // Nothing to do
  }

  /**
   * Check if migrations need to be run and execute them if necessary
   */
  private async runMigrationsIfNeeded() {
    const db = await this.app.container.make(Database)

    // Ensure we're using PostgreSQL - this provider is designed specifically for PostgreSQL
    const dbConnection = env.get('DB_CONNECTION')
    if (dbConnection !== 'postgres') {
      console.warn(
        `Database migration provider is designed for PostgreSQL only. Current connection: ${dbConnection}. Skipping automatic migrations.`
      )
      return
    }

    try {
      // Check if the migrations table exists
      const migrationTableExists = await this.checkMigrationTableExists(db)

      if (!migrationTableExists) {
        console.log('Migration table does not exist. Running initial migrations...')
        await this.runMigrations(db)
        return
      }

      // Check if there are pending migrations
      const hasPendingMigrations = await this.checkPendingMigrations(db)

      if (hasPendingMigrations) {
        console.log('Pending migrations detected. Running migrations...')
        await this.runMigrations(db)
      } else {
        console.log('Database schema is up-to-date. No migrations needed.')
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
      throw error
    }
  }

  /**
   * Check if the migrations table exists in the database
   */
  private async checkMigrationTableExists(db: Database): Promise<boolean> {
    try {
      // For PostgreSQL, check if the table exists in the information_schema
      const result = await db.rawQuery(
        `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'adonis_schema'
          ) as table_exists`
      )

      return result.rows[0]?.table_exists === true
    } catch (error) {
      console.error('Error checking migration table existence:', error)
      return false
    }
  }

  /**
   * Check if there are pending migrations
   */
  private async checkPendingMigrations(db: Database): Promise<boolean> {
    try {
      const migrator = new MigrationRunner(db, this.app, {
        direction: 'up',
        connectionName: db.primaryConnectionName,
      })

      const status = await migrator.getList()

      // Check if there are any migrations that haven't been run
      const pendingMigrations = status.filter(
        (migration: MigrationListNode) => migration.status === 'pending'
      )

      return pendingMigrations.length > 0
    } catch (error) {
      console.error('Error checking pending migrations:', error)
      // If we can't check, assume we need to run migrations to be safe
      return true
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(db: Database) {
    try {
      console.log('Starting database migrations...')

      const migrator = new MigrationRunner(db, this.app, {
        direction: 'up',
        connectionName: db.primaryConnectionName,
      })

      await migrator.run()

      if (migrator.status === 'completed') {
        const migratedCount = Object.keys(migrator.migratedFiles).length
        console.log(
          `✅ Database migrations completed successfully. ${migratedCount} migrations executed.`
        )

        // Log the migrations that were run
        if (migratedCount > 0) {
          console.log('Executed migrations:')
          Object.values(migrator.migratedFiles).forEach((migration) => {
            console.log(`  - ${migration.file.name}`)
          })
        }
      } else if (migrator.status === 'skipped') {
        console.log('Database migrations skipped - no pending migrations found.')
      } else if (migrator.status === 'error') {
        console.error('Database migrations failed with error:', migrator.error)
        throw migrator.error || new Error('Migration failed with unknown error')
      } else {
        console.warn('Database migrations completed with warnings.')
      }

      await migrator.close()
    } catch (error) {
      console.error('Failed to run database migrations:', error)
      throw error
    }
  }
}
