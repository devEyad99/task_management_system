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
exports.TaskController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../../models");
const dtos_1 = require("../dtos");
class TaskController {
    createTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const task = req.body;
                const user = yield models_1.User.findOne({ where: { id: req.body.assigned_to } });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                yield models_1.Task.create(task);
                const responseDto = dtos_1.CreateTaskResponseDto.factory(task, user);
                const userInfo = {
                    id: user.id,
                    name: user.name,
                };
                responseDto.user = userInfo;
                return res.status(201).json(responseDto);
            }
            catch (error) {
                console.error(error);
                return res.status(400).json({ message: 'Invalid request' });
            }
        });
    }
    getAllTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const page = parseInt(req.query.page) || 1;
                const offset = (page - 1) * limit;
                const title = req.query.title;
                const whereClause = title ? { title: { [sequelize_1.Op.like]: `%${title}%` } } : {};
                const tasks = yield models_1.Task.findAll({
                    where: whereClause,
                    limit: limit,
                    offset: offset,
                });
                return res.status(200).json(tasks);
            }
            catch (error) {
                console.error(error); // Log the error for debugging purposes
                return res.status(400).json({ message: 'Invalid request' });
            }
        });
    }
    getTaskById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const task = yield models_1.Task.findByPk(id);
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                return res.status(200).json(task);
            }
            catch (error) {
                console.error(error); // Log the error for debugging purposes
                return res.status(400).json({ message: 'Invalid request' });
            }
        });
    }
    deleteTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const task = yield models_1.Task.findByPk(id);
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                yield task.destroy();
                res.status(200).send(dtos_1.DeleteTaskByIdResponseDto.fromTaskId());
            }
            catch (error) {
                console.error(error); // Log the error for debugging purposes
                return res.status(400).json({ message: 'Invalid request' });
            }
        });
    }
}
exports.TaskController = TaskController;
