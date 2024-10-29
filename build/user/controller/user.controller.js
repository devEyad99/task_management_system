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
exports.UserController = void 0;
const models_1 = require("../../models");
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = require("sequelize");
const decorators_1 = require("../../decorators");
const authenticate_1 = require("../../middlewares/authenticate");
const roleAccess_1 = require("../../middlewares/roleAccess");
let UserController = class UserController {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const page = parseInt(req.query.page) || 1;
                const offset = (page - 1) * limit || 0;
                const name = req.query.name;
                const whereClause = name ? { name: { [sequelize_1.Op.like]: `%${name}%` } } : {};
                const users = yield models_1.User.findAll({
                    where: whereClause,
                    limit: limit,
                    offset: offset,
                });
                const usersWithoutPassword = users.map((user) => lodash_1.default.omit(user.toJSON(), 'password'));
                return res.status(200).json({
                    results: users.length,
                    page,
                    usersWithoutPassword,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield models_1.User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const userWithoutPassword = lodash_1.default.omit(user.toJSON(), 'password');
                return res.status(200).json(userWithoutPassword);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    getMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            // find all tasks assigned to that user
            try {
                const tasks = yield models_1.Task.findAll({
                    where: { assigned_to: (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id },
                });
                console.log(req.currentUser);
                return res.status(200).json({
                    user: {
                        id: (_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.id,
                        name: (_c = req.currentUser) === null || _c === void 0 ? void 0 : _c.name,
                        email: (_d = req.currentUser) === null || _d === void 0 ? void 0 : _d.email,
                        role: (_e = req.currentUser) === null || _e === void 0 ? void 0 : _e.role,
                        profile_image: (_f = req.currentUser) === null || _f === void 0 ? void 0 : _f.profile_image,
                        tasks,
                    },
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    deleteUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield models_1.User.findOne({ where: { id } });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                models_1.User.destroy({ where: { id } });
                return res.status(200).json({ message: 'User deleted successfully' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    getLoggedInUserTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(400).json({ message: 'User not found' });
                }
                const tasks = yield models_1.Task.findAll({ where: { assigned_to: userId } });
                return res.status(200).json(tasks);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    updateTaskStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { status } = req.body;
                const task = yield models_1.Task.findByPk(id);
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                if ((task === null || task === void 0 ? void 0 : task.assigned_to) !== ((_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(403).json({
                        message: 'Forbidden, you are not allowed to updata this task',
                    });
                }
                task.status = status;
                yield task.save();
                return res.status(200).json(task);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, email, role } = req.body;
                const user = yield models_1.User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                if (name !== undefined) {
                    user.name = name;
                }
                if (email !== undefined) {
                    user.email = email;
                }
                if (role !== undefined) {
                    user.role = role;
                }
                yield user.save();
                return res.status(200).json(user);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    // upload user profile image
    uploadProfileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield models_1.User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                if (req.file) {
                    user.profile_image = req.file.path;
                    yield user.save();
                    return res.status(200).json(user);
                }
                return res.status(400).json({ message: 'Bad request' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, decorators_1.use)(roleAccess_1.adminRole),
    (0, decorators_1.use)(authenticate_1.authenticate),
    (0, decorators_1.get)('/getAllUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, decorators_1.use)(roleAccess_1.managerAndAdminRole),
    (0, decorators_1.use)(authenticate_1.authenticate),
    (0, decorators_1.get)('/getUserById/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, decorators_1.use)(authenticate_1.authenticate),
    (0, decorators_1.get)('/getMe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
exports.UserController = UserController = __decorate([
    (0, decorators_1.controller)('/user')
], UserController);
