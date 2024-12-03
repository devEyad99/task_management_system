//
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME as string,
  process.env.DATABASE_USER as string,
  process.env.DATABASE_PASSWORD as string,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    port: Number(process.env.DATABASE_PORT),
  }
);

export default sequelize;
