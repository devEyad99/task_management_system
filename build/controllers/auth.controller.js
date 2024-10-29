"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const models_1 = require("../models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = __importDefault(require("lodash"));
const validator_1 = __importDefault(require("validator"));
const jwt_1 = require("../utiles/jwt");
const decorators_1 = require("../decorators");
let AuthController = class AuthController {
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, role } = req.body;
                if (!validator_1.default.isEmail(email)) {
                    return res.status(400).json({ message: 'Invalid email format' });
                }
                const existingUser = yield models_1.User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(409).json({ message: 'User already exists' });
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const user = yield models_1.User.create({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                });
                const newUser = lodash_1.default.omit(user.toJSON(), 'password');
                const token = (0, jwt_1.getAccessToken)({ email, role, id: user.id });
                return res.status(201).json({
                    message: 'User created successfully',
                    token,
                    user: newUser,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield models_1.User.findOne({ where: { email } });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
                if (!isValidPassword) {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }
                const loggedUser = lodash_1.default.omit(user.toJSON(), 'password');
                const token = (0, jwt_1.getAccessToken)({ email, role: user.role, id: user.id });
                const refreshToken = (0, jwt_1.getRefreshToken)({
                    email: user.email,
                    role: user.role,
                    id: user.id,
                });
                return res.status(200).json({
                    message: 'Login successful',
                    token,
                    refreshToken,
                    user: loggedUser,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const currentUser = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const accessToken = (0, jwt_1.getAccessToken)({
                email: currentUser.email,
                role: currentUser.role,
                id: currentUser.id,
            });
            const newRefreshToken = (0, jwt_1.getRefreshToken)({
                email: currentUser.email,
                role: currentUser.role,
                id: currentUser.id,
            });
            return res.json({
                message: 'Refresh token generated successfully',
                access_token: accessToken,
                refresh_token: newRefreshToken,
            });
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return res
                .status(403)
                .json({ message: 'Invalid token. Please log in again.' });
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, decorators_1.post)('/signup'),
    (0, decorators_1.bodyValidator)('name', 'email', 'password', 'role'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, decorators_1.post)('/login'),
    (0, decorators_1.bodyValidator)('email', 'password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, decorators_1.post)('/refreshToken'),
    (0, decorators_1.bodyValidator)('refreshToken'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, decorators_1.controller)('/auth')
], AuthController);
