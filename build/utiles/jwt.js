"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.verifyRefreshToken = exports.getRefreshToken = exports.getAccessToken = void 0;
//
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnvVariable(key, defaultValue) {
    const value = process.env[key];
    if (!value) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
}
const SECRET_KEY = getEnvVariable('SECRET_KEY');
const REFRESH_TOKEN_SECRET = getEnvVariable('REFRESH_TOKEN_SECRET');
function grantToken(secret, expiresIn) {
    return function (data) {
        const result = jsonwebtoken_1.default.sign(data, secret, { expiresIn });
        return result;
    };
}
exports.getAccessToken = grantToken(SECRET_KEY, '30m');
exports.getRefreshToken = grantToken(REFRESH_TOKEN_SECRET, '1h');
function verifyToken(secret) {
    return function (token) {
        const result = jsonwebtoken_1.default.verify(token, secret);
        return result;
    };
}
exports.verifyRefreshToken = verifyToken(REFRESH_TOKEN_SECRET);
exports.verifyAccessToken = verifyToken(SECRET_KEY);
