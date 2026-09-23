"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utiles/jwt");
const models_1 = require("../models");
const AppError_1 = require("../errors/AppError");
const authenticate = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    const [scheme, token] = (_a = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')) !== null && _a !== void 0 ? _a : [];
    if (scheme !== 'Bearer' || !token) {
        next(new AppError_1.AppError(401, 'You are not logged in! Please log in to get access.'));
        return;
    }
    try {
        const currentUser = (0, jwt_1.verifyAccessToken)(token);
        const user = yield models_1.User.findByPk(currentUser.id);
        if (!user) {
            next(new AppError_1.AppError(401, 'The user for this token no longer exists'));
            return;
        }
        req.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_image: user.profile_image,
        };
        next();
    }
    catch (_b) {
        next(new AppError_1.AppError(401, 'Invalid token. Please log in again.'));
    }
});
exports.authenticate = authenticate;
