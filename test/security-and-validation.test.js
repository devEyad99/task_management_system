const assert = require('node:assert/strict');
const test = require('node:test');

process.env.DATABASE_NAME ||= 'test';
process.env.DATABASE_USER ||= 'test';
process.env.DATABASE_PASSWORD ||= 'test';
process.env.DATABASE_HOST ||= 'localhost';
process.env.DATABASE_PORT ||= '5432';
process.env.SECRET_KEY ||= 'test-access-secret-that-is-long-enough';
process.env.REFRESH_TOKEN_SECRET ||= 'test-refresh-secret-that-is-long-enough';

const { AuthService } = require('../build/(auth)/auth.service');
const { TaskService } = require('../build/(task)/task.service');
const { TaskRepository } = require('../build/(task)/helper/task.repository');
const { UserService } = require('../build/(user)/user.service');
const { UserController } = require('../build/(user)/user.controller');
const { Task } = require('../build/models');
const { Op } = require('sequelize');
const { parsePagination } = require('../build/helper/validation');
const {
  getRefreshToken,
  verifyAccessToken,
} = require('../build/utiles/jwt');

test('public signup rejects privileged roles before persistence', async () => {
  const repository = {
    findUserByEmail: async () => null,
    hashPassword: async () => 'hash',
    createUser: async () => {
      throw new Error('must not persist');
    },
  };

  await assert.rejects(
    new AuthService(repository).signup({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    }),
    { statusCode: 403 }
  );
});

test('user updates reject password mass assignment', async () => {
  const service = new UserService({}, {});
  await assert.rejects(service.updateUser('1', { password: 'new-password' }), {
    statusCode: 400,
  });
});

test('refreshing a token uses the current database role', async () => {
  const repository = {
    findUserById: async () => ({
      id: 1,
      name: 'Current User',
      email: 'current@example.com',
      role: 'employee',
      profile_image: null,
    }),
  };
  const staleToken = getRefreshToken({
    id: 1,
    email: 'current@example.com',
    role: 'admin',
  });

  const result = await new AuthService(repository).refreshToken({
    refreshToken: staleToken,
  });

  assert.equal(verifyAccessToken(result.access_token).role, 'employee');
});

test('only the assigned user can update a task status', async () => {
  let savedTask;
  const taskRepository = {
    findTaskById: async () => ({
      id: 7,
      assigned_to: 2,
      status: 'pending',
      completedAt: null,
    }),
    saveTask: async (task) => {
      savedTask = task;
      return task;
    },
  };
  const service = new UserService({}, taskRepository);

  await assert.rejects(
    service.updateTaskStatus(
      {
        id: 1,
        name: 'Employee',
        email: 'employee@example.com',
        role: 'employee',
        profile_image: null,
      },
      '7',
      { status: 'completed' }
    ),
    { statusCode: 403 }
  );
  assert.equal(savedTask, undefined);
});

test('the assigned user can complete and reopen a task through the existing endpoint', async () => {
  const task = {
    id: 7,
    assigned_to: 1,
    status: 'pending',
    completedAt: null,
  };
  const taskRepository = {
    findTaskById: async () => task,
    saveTask: async (value) => value,
  };
  const service = new UserService({}, taskRepository);
  const employee = {
    id: 1,
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    profile_image: null,
  };

  await service.updateTaskStatus(employee, '7', { status: 'completed' });
  assert.equal(task.status, 'completed');
  assert.ok(task.completedAt instanceof Date);

  await service.updateTaskStatus(employee, '7', { status: 'in-progress' });
  assert.equal(task.status, 'in-progress');
  assert.equal(task.completedAt, null);
});

test('a manager can update, reassign, and complete any task', async () => {
  const task = {
    id: 5,
    title: 'Old title',
    description: 'Description',
    status: 'pending',
    deadline: new Date('2026-10-01T00:00:00.000Z'),
    assigned_to: 1,
    createdBy: 9,
    completedAt: null,
  };
  const repository = {
    findTaskById: async () => task,
    findUserById: async (id) => (id === 2 ? { id: 2 } : null),
    saveTask: async (value) => value,
  };
  const manager = {
    id: 10,
    name: 'Manager',
    email: 'manager@example.com',
    role: 'manager',
    profile_image: null,
  };

  const result = await new TaskService(repository).updateTask(manager, '5', {
    title: 'Updated title',
    assigned_to: 2,
    status: 'completed',
  });

  assert.equal(result.title, 'Updated title');
  assert.equal(result.assigned_to, 2);
  assert.equal(result.status, 'completed');
  assert.ok(result.completedAt instanceof Date);
  assert.equal(result.createdBy, 9);
});

test('an admin can reopen any completed task', async () => {
  const completedAt = new Date('2026-09-20T00:00:00.000Z');
  const task = {
    id: 6,
    title: 'Task',
    description: 'Description',
    status: 'completed',
    deadline: new Date('2026-10-01T00:00:00.000Z'),
    assigned_to: 1,
    createdBy: null,
    completedAt,
  };
  const repository = {
    findTaskById: async () => task,
    saveTask: async (value) => value,
  };
  const admin = {
    id: 11,
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    profile_image: null,
  };

  const result = await new TaskService(repository).updateTask(admin, '6', {
    status: 'in-progress',
  });

  assert.equal(result.status, 'in-progress');
  assert.equal(result.completedAt, null);
});

test('employees cannot use the manager task update operation', async () => {
  const repository = {
    findTaskById: async () => {
      throw new Error('must not read task');
    },
  };
  const employee = {
    id: 1,
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    profile_image: null,
  };

  await assert.rejects(
    new TaskService(repository).updateTask(employee, '5', {
      title: 'Not allowed',
    }),
    { statusCode: 403 }
  );
});

test('new tasks retain their authenticated creator and completion time', async () => {
  let createdTask;
  const repository = {
    findUserById: async () => ({ id: 2, name: 'Assignee' }),
    createTask: async (data) => {
      createdTask = { id: 12, ...data };
      return createdTask;
    },
  };
  const manager = {
    id: 10,
    name: 'Manager',
    email: 'manager@example.com',
    role: 'manager',
    profile_image: null,
  };

  const result = await new TaskService(repository).createTask(manager, {
    title: 'Completed on creation',
    description: 'Description',
    status: 'completed',
    deadline: '2026-10-01T00:00:00.000Z',
    assigned_to: 2,
  });

  assert.equal(createdTask.createdBy, manager.id);
  assert.ok(createdTask.completedAt instanceof Date);
  assert.equal(result.task.createdBy, manager.id);
  assert.ok(result.task.completedAt instanceof Date);
});

test('task updates reject internal fields and unknown assignees', async () => {
  const task = {
    id: 5,
    title: 'Task',
    description: 'Description',
    status: 'pending',
    deadline: new Date('2026-10-01T00:00:00.000Z'),
    assigned_to: 1,
    createdBy: null,
    completedAt: null,
  };
  const repository = {
    findTaskById: async () => task,
    findUserById: async () => null,
  };
  const manager = {
    id: 10,
    name: 'Manager',
    email: 'manager@example.com',
    role: 'manager',
    profile_image: null,
  };
  const service = new TaskService(repository);

  await assert.rejects(
    service.updateTask(manager, '5', { createdBy: 10 }),
    { statusCode: 400 }
  );
  await assert.rejects(
    service.updateTask(manager, '5', { assigned_to: 999 }),
    { statusCode: 404 }
  );
});

test('task listing validates and forwards filters, search, sorting, and pagination', async () => {
  let countQuery;
  let findQuery;
  const repository = {
    countTasks: async (query) => {
      countQuery = query;
      return 7;
    },
    findTasks: async (query) => {
      findQuery = query;
      return [{ id: 1 }];
    },
  };

  const result = await new TaskService(repository).getAllTasks({
    page: '2',
    limit: '3',
    title: 'legacy title',
    search: 'shared text',
    status: 'in-progress',
    assignee: '9',
    deadlineFrom: '2026-10-01T00:00:00.000Z',
    deadlineTo: '2026-10-31T23:59:59.999Z',
    overdue: 'true',
    sortBy: 'deadline',
    sortOrder: 'asc',
  });

  assert.equal(countQuery, findQuery);
  assert.equal(findQuery.page, 2);
  assert.equal(findQuery.limit, 3);
  assert.equal(findQuery.offset, 3);
  assert.equal(findQuery.title, 'legacy title');
  assert.equal(findQuery.search, 'shared text');
  assert.equal(findQuery.status, 'in-progress');
  assert.equal(findQuery.assignedTo, 9);
  assert.equal(findQuery.overdue, true);
  assert.equal(findQuery.sortBy, 'deadline');
  assert.equal(findQuery.sortOrder, 'ASC');
  assert.ok(findQuery.deadlineFrom instanceof Date);
  assert.ok(findQuery.deadlineTo instanceof Date);
  assert.ok(findQuery.overdueAt instanceof Date);
  assert.deepEqual(result, {
    page: 2,
    limit: 3,
    totalPages: 3,
    totalTasks: 7,
    result: 1,
    tasks: [{ id: 1 }],
  });
});

test('task repository searches title and description and applies overdue sorting', async () => {
  const originalFindAll = Task.findAll;
  let options;
  Task.findAll = async (queryOptions) => {
    options = queryOptions;
    return [];
  };

  try {
    const now = new Date('2026-09-24T12:00:00.000Z');
    await new TaskRepository().findTasks({
      search: 'release',
      overdue: true,
      overdueAt: now,
      sortBy: 'title',
      sortOrder: 'ASC',
      page: 1,
      limit: 20,
      offset: 0,
    });

    const conditions = options.where[Op.and];
    const searchCondition = conditions.find((condition) => condition[Op.or]);
    const searchedFields = searchCondition[Op.or].map(
      (condition) => Object.keys(condition)[0]
    );
    assert.deepEqual(searchedFields, ['title', 'description']);
    assert.ok(
      conditions.some(
        (condition) => condition.deadline?.[Op.lt]?.getTime() === now.getTime()
      )
    );
    assert.ok(
      conditions.some((condition) => condition.status?.[Op.ne] === 'completed')
    );
    assert.deepEqual(options.order, [
      ['title', 'ASC'],
      ['id', 'ASC'],
    ]);
    assert.equal(options.limit, 20);
    assert.equal(options.offset, 0);
  } finally {
    Task.findAll = originalFindAll;
  }
});

test('task listing rejects invalid and unknown query parameters', async () => {
  const service = new TaskService({});
  const invalidQueries = [
    { unexpected: 'value' },
    { status: 'blocked' },
    { assignee: 'not-an-id' },
    { assignee: '1', assigned_to: '1' },
    {
      deadlineFrom: '2026-11-01T00:00:00.000Z',
      deadlineTo: '2026-10-01T00:00:00.000Z',
    },
    { overdue: 'yes' },
    { sortBy: 'status' },
    { sortOrder: 'sideways' },
  ];

  for (const query of invalidQueries) {
    await assert.rejects(service.getAllTasks(query), { statusCode: 400 });
  }
});

test('assigned employees and managers can read a task by ID', async () => {
  const task = { id: 8, assigned_to: 2 };
  const service = new TaskService({ findTaskById: async () => task });
  const employee = {
    id: 2,
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    profile_image: null,
  };
  const manager = {
    id: 10,
    name: 'Manager',
    email: 'manager@example.com',
    role: 'manager',
    profile_image: null,
  };

  assert.equal(await service.getTaskById(employee, '8'), task);
  assert.equal(await service.getTaskById(manager, '8'), task);
});

test('an employee cannot read a task assigned to another user', async () => {
  const service = new TaskService({
    findTaskById: async () => ({ id: 8, assigned_to: 3 }),
  });
  const employee = {
    id: 2,
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    profile_image: null,
  };

  await assert.rejects(service.getTaskById(employee, '8'), {
    statusCode: 403,
  });
});

test('my-tasks remains an unpaginated array when pagination is not requested', async () => {
  let repositoryArguments;
  let countCalled = false;
  const tasks = [{ id: 1 }, { id: 2 }];
  const repository = {
    findTasksByUserId: async (...args) => {
      repositoryArguments = args;
      return tasks;
    },
    countTasksByUserId: async () => {
      countCalled = true;
      return tasks.length;
    },
  };
  const currentUser = {
    id: 2,
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    profile_image: null,
  };

  const result = await new UserService({}, repository).getMyTasks(
    currentUser,
    {}
  );

  assert.deepEqual(result.tasks, tasks);
  assert.deepEqual(repositoryArguments, [2]);
  assert.equal(countCalled, false);
  assert.equal(result.pagination, undefined);
});

test('my-tasks pagination preserves the array body and exposes metadata headers', async () => {
  const tasks = [{ id: 3 }, { id: 4 }];
  const taskRepository = {
    findTasksByUserId: async (userId, limit, offset) => {
      assert.equal(userId, 2);
      assert.equal(limit, 2);
      assert.equal(offset, 2);
      return tasks;
    },
    countTasksByUserId: async () => 5,
  };
  const controller = new UserController(
    new UserService({}, taskRepository)
  );
  let responseStatus;
  let responseBody;
  let responseHeaders;
  let nextError;
  const response = {
    set(headers) {
      responseHeaders = headers;
      return this;
    },
    status(status) {
      responseStatus = status;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  await controller.getMyTasks(
    {
      currentUser: {
        id: 2,
        name: 'Employee',
        email: 'employee@example.com',
        role: 'employee',
        profile_image: null,
      },
      query: { page: '2', limit: '2' },
    },
    response,
    (error) => {
      nextError = error;
    }
  );

  assert.equal(nextError, undefined);
  assert.equal(responseStatus, 200);
  assert.deepEqual(responseBody, tasks);
  assert.deepEqual(responseHeaders, {
    'X-Page': '2',
    'X-Limit': '2',
    'X-Total-Count': '5',
    'X-Total-Pages': '3',
  });
});

test('my-tasks rejects unsupported and invalid pagination parameters', async () => {
  const service = new UserService({}, {});
  const currentUser = {
    id: 2,
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    profile_image: null,
  };

  await assert.rejects(service.getMyTasks(currentUser, { status: 'pending' }), {
    statusCode: 400,
  });
  await assert.rejects(service.getMyTasks(currentUser, { page: '0' }), {
    statusCode: 400,
  });
});

test('pagination rejects unbounded and invalid values', () => {
  assert.throws(() => parsePagination('0', '5'), { statusCode: 400 });
  assert.throws(() => parsePagination('1', '101'), { statusCode: 400 });
  assert.deepEqual(parsePagination(undefined, undefined), {
    page: 1,
    limit: 5,
    offset: 0,
  });
});
