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
const { UserService } = require('../build/(user)/user.service');
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
  const taskRepository = {
    findTaskById: async () => ({ id: 7, assigned_to: 2 }),
    updateStatus: async () => {
      throw new Error('must not update');
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
