"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_STATUSES = void 0;
//
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
exports.TASK_STATUSES = ['pending', 'in-progress', 'completed'];
class Task extends sequelize_1.Model {
}
Task.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...exports.TASK_STATUSES),
        allowNull: false,
    },
    deadline: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    assigned_to: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Task',
    tableName: 'tasks',
    indexes: [{ fields: ['assigned_to'] }],
});
exports.default = Task;
