import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

const port = Number(requireEnvironmentVariable('DATABASE_PORT'));
if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
  throw new Error('DATABASE_PORT must be a valid TCP port');
}

const sequelize = new Sequelize(
  requireEnvironmentVariable('DATABASE_NAME'),
  requireEnvironmentVariable('DATABASE_USER'),
  requireEnvironmentVariable('DATABASE_PASSWORD'),
  {
    host: requireEnvironmentVariable('DATABASE_HOST'),
    dialect: 'postgres',
    port,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30_000,
      idle: 10_000,
    },
  }
);

export default sequelize;
