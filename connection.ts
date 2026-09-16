/**
 * Oracle Database Connection Pool Management
 * HealSmart Hospital Management System
 */

import oracledb from 'oracledb';
import dbConfig from '../config/database';

let pool: oracledb.Pool | null = null;

/**
 * Initialize Oracle Database Connection Pool
 */
export async function initializePool(): Promise<void> {
  try {
    // Enable thick mode if needed (for Oracle Instant Client)
    // oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_19_8' });

    pool = await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      poolMin: dbConfig.poolMin,
      poolMax: dbConfig.poolMax,
      poolIncrement: dbConfig.poolIncrement,
    });

    console.log('✅ Oracle Database Connection Pool initialized successfully');
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error('❌ Error initializing database pool:', errorMessage);
    throw new Error(`Failed to initialize database pool: ${errorMessage}`);
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) {
    await initializePool();
  }

  if (!pool) {
    throw new Error('Database pool is not initialized');
  }

  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error('❌ Error getting database connection:', errorMessage);
    throw new Error(`Failed to get database connection: ${errorMessage}`);
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.close(10);
      pool = null;
      console.log('✅ Database connection pool closed');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('❌ Error closing database pool:', errorMessage);
      throw new Error(`Failed to close database pool: ${errorMessage}`);
    }
  }
}

/**
 * Execute a query with automatic connection management
 */
export async function executeQuery<T = any>(
  sql: string,
  binds: any[] = [],
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<T>> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();

    const result = await connection.execute<T>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    });

    return result;
  } catch (error: any) {
    // Extract Oracle error details - careful not to trigger circular JSON
    let errorCode = 'unknown';
    let errorMessage = 'Database error';

    try {
      errorCode = error?.errorNum || error?.code || 'unknown';
    } catch (e) {
      // Ignore if accessing error properties fails
    }

    try {
      // Try to get error message without triggering circular reference
      if (error && typeof error === 'object') {
        const msg = String(error);
        if (msg && msg !== '[object Object]') {
          errorMessage = msg.substring(0, 200); // Limit length
        }
      }
    } catch (e) {
      // If String() fails, keep default message
    }

    console.error('❌ Database query error');
    console.error('Error code:', errorCode);
    console.error('Error message:', errorMessage);
    console.error('SQL:', sql.substring(0, 200));
    console.error('Binds:', JSON.stringify(binds));

    // Throw a clean error without circular references
    const cleanError = new Error(`Database error (${errorCode}): ${errorMessage}`);
    (cleanError as any).errorCode = errorCode;
    (cleanError as any).sql = sql;
    throw cleanError;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        console.error('❌ Error closing connection:', errorMessage);
      }
    }
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await getConnection();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error('❌ Database connection test failed:', errorMessage);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export default {
  initializePool,
  getConnection,
  closePool,
  executeQuery,
  testConnection,
};
