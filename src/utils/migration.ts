import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import config from '../config';

interface MigrationFile {
  filename: string;
  filepath: string;
  order: number;
}

export class MigrationRunner {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      multipleStatements: true,
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async createMigrationsTable(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename),
        INDEX idx_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await this.connection.execute(createTableQuery);
  }

  async getExecutedMigrations(): Promise<string[]> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    const [rows] = await this.connection.execute(
      'SELECT filename FROM migrations ORDER BY executed_at ASC'
    ) as [any[], any];

    return rows.map(row => row.filename);
  }

  async markMigrationAsExecuted(filename: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    await this.connection.execute(
      'INSERT INTO migrations (filename) VALUES (?)',
      [filename]
    );
  }

  getMigrationFiles(): MigrationFile[] {
    const migrationsDir = path.join(__dirname, '../migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(filename => {
        const orderMatch = filename.match(/^(\d+)/);
        const order = orderMatch ? parseInt(orderMatch[1], 10) : 999;
        
        return {
          filename,
          filepath: path.join(migrationsDir, filename),
          order,
        };
      })
      .sort((a, b) => a.order - b.order);

    return files;
  }

  async executeMigration(migrationFile: MigrationFile): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    console.log(`Executing migration: ${migrationFile.filename}`);

    const sql = fs.readFileSync(migrationFile.filepath, 'utf8');
    
    try {
      await this.connection.execute(sql);
      await this.markMigrationAsExecuted(migrationFile.filename);
      console.log(`✓ Migration completed: ${migrationFile.filename}`);
    } catch (error) {
      console.error(`✗ Migration failed: ${migrationFile.filename}`, error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      await this.connect();
      await this.createMigrationsTable();

      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file.filename)
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations found.');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migration(s):`);
      pendingMigrations.forEach(file => {
        console.log(`  - ${file.filename}`);
      });

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log('All migrations completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async rollbackLastMigration(): Promise<void> {
    try {
      await this.connect();
      
      const [rows] = await this.connection!.execute(
        'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1'
      ) as [any[], any];

      if (rows.length === 0) {
        console.log('No migrations to rollback.');
        return;
      }

      const lastMigration = rows[0].filename;
      console.log(`Rolling back migration: ${lastMigration}`);

      // Note: This is a basic rollback that just removes the migration record
      // For more complex rollbacks, you would need separate rollback SQL files
      await this.connection!.execute(
        'DELETE FROM migrations WHERE filename = ?',
        [lastMigration]
      );

      console.log(`✓ Rollback completed: ${lastMigration}`);
      console.log('Note: This only removes the migration record. Manual cleanup may be required.');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  switch (command) {
    case 'up':
      runner.runMigrations().catch(process.exit);
      break;
    case 'rollback':
      runner.rollbackLastMigration().catch(process.exit);
      break;
    default:
      console.log('Usage: ts-node migration.ts [up|rollback]');
      process.exit(1);
  }
}