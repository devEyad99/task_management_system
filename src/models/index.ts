//
import Task from './task.model';
import User from './user.model';

// A user can have multiple tasks
User.hasMany(Task, {
  foreignKey: 'assigned_to',
  as: 'tasks',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'user' });

// Creator attribution is retained when possible, but old tasks and tasks whose
// creator was deleted are intentionally allowed to have no creator.
User.hasMany(Task, {
  foreignKey: 'createdBy',
  as: 'createdTasks',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Task.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

export { User, Task };
