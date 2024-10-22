//
import Task from './task.model';
import User from './user.model';

// A user can have multiple tasks
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'user' });

export { User, Task };
