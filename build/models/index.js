"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.User = void 0;
//
const task_model_1 = __importDefault(require("./task.model"));
exports.Task = task_model_1.default;
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
// A user can have multiple tasks
user_model_1.default.hasMany(task_model_1.default, { foreignKey: 'assigned_to', as: 'tasks' });
task_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'assigned_to', as: 'user' });
