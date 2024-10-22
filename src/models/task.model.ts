//
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Task extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: string;
  public deadline!: Date;
  public assignedTo!: number;
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
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Make sure this matches the table name
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
  }
);

export default Task;
