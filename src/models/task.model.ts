//
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import sequelize from '../config/database';

export const TASK_STATUSES = ['pending', 'in-progress', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare status: TaskStatus;
  declare priority: CreationOptional<TaskPriority>;
  declare deadline: Date;
  declare assigned_to: number;
  declare createdBy: CreationOptional<number | null>;
  declare completedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...TASK_STATUSES),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM(...TASK_PRIORITIES),
      allowNull: false,
      defaultValue: 'medium',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    indexes: [
      { fields: ['assigned_to'] },
      { name: 'tasks_created_at_id_idx', fields: ['createdAt', 'id'] },
      { name: 'tasks_priority_id_idx', fields: ['priority', 'id'] },
      { name: 'tasks_deadline_id_idx', fields: ['deadline', 'id'] },
    ],
  }
);

export default Task;
