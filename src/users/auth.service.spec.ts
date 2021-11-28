import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create fake copy of users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password
        } as User;
        users.push(user);
        return Promise.resolve(user);
      }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if uses signs up with email that is in use', (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'email', password: '1' } as User]);
    service.signup('emailadress', 'asdf').catch(() => done());
  });

  it('throws up if signin is called with an unused email', async () => {
    try {
      await service.signin('email', 'asdf');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toBe('User not found');
    }
  });

  it('throws up if invalid password is provided', async () => {
    await service.signup('email@email.com', '123452');
    try {
      await service.signin('email@email.com', '12345');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toBe('Invalid password');
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdfg@asdf.com', 'asdf');
    const user = await service.signin('asdfg@asdf.com', 'asdf');
    expect(user).toBeDefined();
  });
});
