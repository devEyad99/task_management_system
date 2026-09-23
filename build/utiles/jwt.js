"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.verifyRefreshToken = exports.getRefreshToken = exports.getAccessToken = void 0;
//
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
function getEnvVariable(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    if (process.env.NODE_ENV === 'production' && value.length < 32) {
        throw new Error(`Environment variable ${key} must be at least 32 characters`);
    }
    return value;
}
const SECRET_KEY = getEnvVariable('SECRET_KEY');
const REFRESH_TOKEN_SECRET = getEnvVariable('REFRESH_TOKEN_SECRET');
function grantToken(secret, expiresIn) {
    return function (data) {
        return jsonwebtoken_1.default.sign(data, secret, { algorithm: 'HS256', expiresIn });
    };
}
exports.getAccessToken = grantToken(SECRET_KEY, '1h');
exports.getRefreshToken = grantToken(REFRESH_TOKEN_SECRET, '1d');
function verifyToken(secret) {
    return function (token) {
        const result = jsonwebtoken_1.default.verify(token, secret, { algorithms: ['HS256'] });
        if (typeof result === 'string' ||
            !Number.isSafeInteger(result.id) ||
            typeof result.email !== 'string' ||
            typeof result.role !== 'string' ||
            !user_model_1.USER_ROLES.includes(result.role)) {
            throw new jsonwebtoken_1.default.JsonWebTokenError('Invalid token payload');
        }
        return { id: result.id, email: result.email, role: result.role };
    };
}
exports.verifyRefreshToken = verifyToken(REFRESH_TOKEN_SECRET);
exports.verifyAccessToken = verifyToken(SECRET_KEY);
