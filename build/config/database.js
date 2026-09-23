"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnvironmentVariable(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}
const port = Number(requireEnvironmentVariable('DATABASE_PORT'));
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('DATABASE_PORT must be a valid TCP port');
}
const sequelize = new sequelize_1.Sequelize(requireEnvironmentVariable('DATABASE_NAME'), requireEnvironmentVariable('DATABASE_USER'), requireEnvironmentVariable('DATABASE_PASSWORD'), {
    host: requireEnvironmentVariable('DATABASE_HOST'),
    dialect: 'postgres',
    port,
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
exports.default = sequelize;
