import { Client as PgClient } from 'pg';
import mysql from 'mysql2/promise';
import { Connection } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

export const testDatabaseConnection = async (connection: Connection) => {
  try {
    switch (connection.type) {
      case 'postgres':
        return await testPostgresConnection(connection);
      case 'mysql':
        return await testMySQLConnection(connection);
      case 'sqlite':
        return { success: true, message: 'SQLite connection successful' };
      default:
        throw createError(`Unsupported database type: ${connection.type}`, 400);
    }
  } catch (error: any) {
    throw createError(`Connection failed: ${error.message}`, 500);
  }
};

const testPostgresConnection = async (connection: Connection) => {
  const client = new PgClient({
    host: connection.host || 'localhost',
    port: connection.port || 5432,
    database: connection.database,
    user: connection.username || undefined,
    password: connection.password || undefined,
    ssl: connection.ssl ? { rejectUnauthorized: false } : false
  });

  await client.connect();
  await client.query('SELECT 1');
  await client.end();

  return { success: true, message: 'PostgreSQL connection successful' };
};

const testMySQLConnection = async (connection: Connection) => {
  const conn = await mysql.createConnection({
    host: connection.host || 'localhost',
    port: connection.port || 3306,
    database: connection.database,
    user: connection.username || undefined,
    password: connection.password || undefined,
    ssl: connection.ssl ? {} : undefined
  });

  await conn.query('SELECT 1');
  await conn.end();

  return { success: true, message: 'MySQL connection successful' };
};

export const executeQueryOnDatabase = async (connection: Connection, sql: string) => {
  try {
    switch (connection.type) {
      case 'postgres':
        return await executePostgresQuery(connection, sql);
      case 'mysql':
        return await executeMySQLQuery(connection, sql);
      case 'sqlite':
        throw createError('SQLite execution not yet implemented', 501);
      default:
        throw createError(`Unsupported database type: ${connection.type}`, 400);
    }
  } catch (error: any) {
    throw createError(`Query execution failed: ${error.message}`, 500);
  }
};

const executePostgresQuery = async (connection: Connection, sql: string) => {
  const client = new PgClient({
    host: connection.host || 'localhost',
    port: connection.port || 5432,
    database: connection.database,
    user: connection.username || undefined,
    password: connection.password || undefined,
    ssl: connection.ssl ? { rejectUnauthorized: false } : false
  });

  await client.connect();
  const result = await client.query(sql);
  await client.end();

  return {
    columns: result.fields.map(f => ({ name: f.name, dataType: f.dataTypeID })),
    rows: result.rows,
    rowCount: result.rowCount
  };
};

const executeMySQLQuery = async (connection: Connection, sql: string) => {
  const conn = await mysql.createConnection({
    host: connection.host || 'localhost',
    port: connection.port || 3306,
    database: connection.database,
    user: connection.username || undefined,
    password: connection.password || undefined,
    ssl: connection.ssl ? {} : undefined
  });

  const [rows, fields] = await conn.query(sql);
  await conn.end();

  return {
    columns: fields?.map(f => ({ name: f.name, dataType: f.type })) || [],
    rows: Array.isArray(rows) ? rows : [],
    rowCount: Array.isArray(rows) ? rows.length : 0
  };
};
