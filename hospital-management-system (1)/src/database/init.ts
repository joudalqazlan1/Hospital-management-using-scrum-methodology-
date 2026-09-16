/**
 * Database Initialization Script
 * HealSmart Hospital Management System
 *
 * This script initializes the Oracle database with:
 * 1. Database schema (tables, sequences, indexes)
 * 2. Sample data for testing
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConnection, initializePool, closePool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute SQL file
 */
async function executeSQLFile(filePath: string): Promise<void> {
  const connection = await getConnection();

  try {
    const sqlContent = readFileSync(filePath, 'utf-8');

    // Split SQL statements by semicolon and filter empty ones
    const statements = sqlContent
      .split(/;[\r\n]/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements from ${filePath}...`);

    for (const statement of statements) {
      if (statement.toUpperCase().includes('BEGIN') ||
          statement.toUpperCase().includes('DECLARE')) {
        // Execute PL/SQL blocks
        await connection.execute(statement + ';');
      } else if (statement.toUpperCase().startsWith('SELECT')) {
        // Execute and display SELECT results
        const result = await connection.execute(statement);
        if (result.rows && result.rows.length > 0) {
          console.log('📊', result.rows);
        }
      } else {
        // Execute regular SQL statements
        await connection.execute(statement);
      }
    }

    await connection.commit();
    console.log(`✅ Successfully executed ${filePath}`);
  } catch (error) {
    await connection.rollback();
    console.error(`❌ Error executing ${filePath}:`, error);
    throw error;
  } finally {
    await connection.close();
  }
}

/**
 * Initialize database schema
 */
export async function initializeSchema(): Promise<void> {
  console.log('🔧 Initializing database schema...');
  const schemaPath = join(__dirname, 'schema.sql');
  await executeSQLFile(schemaPath);
}

/**
 * Seed database with sample data
 */
export async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding database with sample data...');
  const seedPath = join(__dirname, 'seed.sql');
  await executeSQLFile(seedPath);
}

/**
 * Main initialization function
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting HealSmart database initialization...');
    console.log('================================================');

    // Initialize connection pool
    await initializePool();

    // Create schema
    await initializeSchema();

    // Seed data
    await seedDatabase();

    console.log('================================================');
    console.log('✅ Database initialization completed successfully!');
    console.log('📊 Database is ready for use.');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('\n✨ All done! You can now start the application.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Initialization failed:', error);
      process.exit(1);
    });
}

export default {
  initializeDatabase,
  initializeSchema,
  seedDatabase,
};
