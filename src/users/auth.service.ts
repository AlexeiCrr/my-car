import { UsersService } from './users.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // see if email is in use
    const users = await this.usersService.find(email);

    if (users.length) {
      throw new BadRequestException('Email already in use');
    }
    // hash password/salt
    // Generate a salt
    const salt = randomBytes(8).toString('hex');
    // Hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Join the salt and password together
    const result = `${salt}.${hash.toString('hex')}`;
    // create new user and save to db
    const user = await this.usersService.create(email, result);
    // return user
    console.log('Signed up successfully');
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid password');
    }
    console.log('Signed in successfully');
    return user;
  }
}
