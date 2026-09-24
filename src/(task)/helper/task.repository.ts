import { Task, User } from '../../models';
import { Op, QueryTypes, WhereOptions } from 'sequelize';
import { CreateTaskDto, TaskQueryDto } from '../dto';
import sequelize from '../../config/database';

interface TaskSummaryRow {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  priorityLow: number;
  priorityMedium: number;
  priorityHigh: number;
  priorityUrgent: number;
}

export class TaskRepository {
  async createTask(data: CreateTaskDto) {
    return Task.create(data);
  }

  async findUserById(userId: number) {
    return User.findOne({ where: { id: userId } });
  }

  private buildTaskFilter(query: TaskQueryDto): WhereOptions<Task> {
    const conditions: WhereOptions<Task>[] = [];
    if (query.title) {
      conditions.push({ title: { [Op.iLike]: `%${query.title}%` } });
    }
    if (query.search) {
      conditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${query.search}%` } },
          { description: { [Op.iLike]: `%${query.search}%` } },
        ],
      });
    }
    if (query.status) conditions.push({ status: query.status });
    if (query.priority) conditions.push({ priority: query.priority });
    if (query.assignedTo) conditions.push({ assigned_to: query.assignedTo });
    if (query.deadlineFrom) {
      conditions.push({ deadline: { [Op.gte]: query.deadlineFrom } });
    }
    if (query.deadlineTo) {
      conditions.push({ deadline: { [Op.lte]: query.deadlineTo } });
    }
    if (query.overdue === true) {
      conditions.push(
        { deadline: { [Op.lt]: query.overdueAt } },
        { status: { [Op.ne]: 'completed' } }
      );
    } else if (query.overdue === false) {
      conditions.push({
        [Op.or]: [
          { deadline: { [Op.gte]: query.overdueAt } },
          { status: 'completed' },
        ],
      });
    }

    return conditions.length === 0 ? {} : { [Op.and]: conditions };
  }

  async countTasks(query: TaskQueryDto) {
    return Task.count({ where: this.buildTaskFilter(query) });
  }

  async findTasks(query: TaskQueryDto) {
    return Task.findAll({
      where: this.buildTaskFilter(query),
      limit: query.limit,
      offset: query.offset,
      order: [
        [query.sortBy, query.sortOrder],
        ['id', query.sortOrder],
      ],
    });
  }

  async findTaskById(id: number) {
    return Task.findByPk(id);
  }

  async deleteTask(id: number) {
    return Task.destroy({ where: { id } });
  }

  async findTasksByUserId(userId: number, limit?: number, offset?: number) {
    return Task.findAll({
      where: { assigned_to: userId },
      ...(limit === undefined ? {} : { limit }),
      ...(offset === undefined ? {} : { offset }),
      order: [['createdAt', 'DESC']],
    });
  }

  async countTasksByUserId(userId: number) {
    return Task.count({ where: { assigned_to: userId } });
  }

  async getTaskSummary(assignedTo: number | undefined, now: Date) {
    const employeeScope =
      assignedTo === undefined ? '' : 'WHERE assigned_to = :assignedTo';
    const rows = await sequelize.query<TaskSummaryRow>(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'in-progress')::int AS "inProgress",
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (
          WHERE deadline < :now AND status <> 'completed'
        )::int AS overdue,
        COUNT(*) FILTER (WHERE priority = 'low')::int AS "priorityLow",
        COUNT(*) FILTER (WHERE priority = 'medium')::int AS "priorityMedium",
        COUNT(*) FILTER (WHERE priority = 'high')::int AS "priorityHigh",
        COUNT(*) FILTER (WHERE priority = 'urgent')::int AS "priorityUrgent"
      FROM tasks
      ${employeeScope}`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          now,
          ...(assignedTo === undefined ? {} : { assignedTo }),
        },
      }
    );
    return rows[0];
  }

  async saveTask(task: Task) {
    return task.save();
  }
}
