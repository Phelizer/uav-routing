import { HttpException, Injectable } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { DBService } from 'src/db/db.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private dbService: DBService,
  ) {}

  // TODO: rewrite
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUser(username);
    if (user && user.password === pass) {
      const { password, ...rest } = user;
      return rest;
    }

    return null;
  }

  // TODO: rewrite
  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    return {
      roles: user.roles,
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(userData: Exclude<User, 'id'>) {
    const usernameIsAvailable = await this.isUsernameAvailable(
      userData.username,
    );

    if (!usernameIsAvailable) {
      return new UsernameIsTakenError();
    }

    const createdUser = await this.saveUserToDB(userData);
    return await this.login(createdUser);
  }

  private async saveUserToDB(userData: Exclude<User, 'id'>) {
    const { rows } = await this.dbService.runQuery(`
      INSERT INTO users (username, password, roles)
      VALUES (
        '${userData.username}',
        '${userData.password}',
        ARRAY${this.sqlFormatStrArray(userData.roles)})
        RETURNING id, username, password, roles;
    `);

    const createdUser = rows[0];
    return createdUser;
  }

  private sqlFormatStrArray(arr: string[]) {
    let str = '';
    for (const [i, elem] of arr.entries()) {
      str += `'${elem}'`;
      if (i < arr.length - 1) {
        str += ', ';
      }
    }

    return `[${str}]`;
  }

  private async isUsernameAvailable(username: string) {
    const { rows } = await this.dbService.runQuery(`
      SELECT * from users
      WHERE username = '${username}'
    `);

    if (rows.length === 0) {
      return true;
    }

    return false;
  }
}

export class UsernameIsTakenError extends HttpException {
  constructor() {
    super('Username is already taken', 409);
  }
}
