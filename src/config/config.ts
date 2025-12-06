// src/config/db-config.ts
import dotenv from 'dotenv';
dotenv.config();

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql';
  logging: boolean;
}

export const dbConfig: DatabaseConfig = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'parkingdb',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: (process.env.DB_DIALECT || 'postgres') as any,
  logging: false,
};
