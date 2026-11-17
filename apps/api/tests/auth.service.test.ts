import {
  getUserById,
  loginUser,
  registerUser,
  verifyToken,
} from '../src/services/auth.service';
import { db } from '../src/db/client';

describe('auth service', () => {
  beforeEach(() => {
    db.reset();
  });

  describe('registerUser', () => {
    it('registers a user and returns a valid token', async () => {
      const result = await registerUser({
        email: 'member@example.com',
        name: 'Test Member',
        password: 'password123',
      });

      expect(result.user).toMatchObject({
        email: 'member@example.com',
        name: 'Test Member',
        role: 'member',
      });
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(verifyToken(result.token)).toEqual({
        userId: result.user.id,
        role: 'member',
      });
    });

    it('rejects an invalid email', async () => {
      await expect(
        registerUser({
          email: 'invalid-email',
          name: 'Test Member',
          password: 'password123',
        }),
      ).rejects.toThrow('invalid email');
    });

    it('rejects a password shorter than eight characters', async () => {
      await expect(
        registerUser({
          email: 'member@example.com',
          name: 'Test Member',
          password: 'short',
        }),
      ).rejects.toThrow('password too short');
    });

    it('rejects a duplicate email', async () => {
      const input = {
        email: 'member@example.com',
        name: 'Test Member',
        password: 'password123',
      };

      await registerUser(input);

      await expect(registerUser(input)).rejects.toThrow(
        'email already registered',
      );
    });
  });

  describe('loginUser', () => {
    it('logs in a registered user', async () => {
      const registered = await registerUser({
        email: 'member@example.com',
        name: 'Test Member',
        password: 'password123',
      });

      const result = await loginUser('member@example.com', 'password123');

      expect(result.user).toEqual(registered.user);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(verifyToken(result.token).userId).toBe(registered.user.id);
    });

    it('rejects an incorrect password', async () => {
      await registerUser({
        email: 'member@example.com',
        name: 'Test Member',
        password: 'password123',
      });

      await expect(
        loginUser('member@example.com', 'wrong-password'),
      ).rejects.toThrow('invalid credentials');
    });

    it('rejects an unknown email', async () => {
      await expect(
        loginUser('missing@example.com', 'password123'),
      ).rejects.toThrow('invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('returns the correct user ID and role for a valid token', async () => {
      const registered = await registerUser({
        email: 'admin@example.com',
        name: 'Test Member',
        password: 'password123',
      });

      expect(verifyToken(registered.token)).toEqual({
        userId: registered.user.id,
        role: 'member',
      });
    });

    it('throws for an invalid token', () => {
      expect(() => verifyToken('not-a-valid-token')).toThrow();
    });
  });

  describe('getUserById', () => {
    it('returns an existing user without the password hash', async () => {
      const registered = await registerUser({
        email: 'member@example.com',
        name: 'Test Member',
        password: 'password123',
      });

      const user = getUserById(registered.user.id);

      expect(user).toEqual(registered.user);
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('returns undefined when the user does not exist', () => {
      expect(getUserById(9999)).toBeUndefined();
    });
  });
});