import { Injectable } from '@nestjs/common';
import { DBService } from 'src/db/db.service';
import { Role } from 'src/users/role.enum';

export interface User {
  username: string;
  password: string;
  id: string;
  roles: Role[];
}

@Injectable()
export class UsersService {
  constructor(private dbService: DBService) {}

  // TODO: store only encrypyted version of passwords
  async findUser(username: string): Promise<User | undefined> {
    const { rows } = await this.dbService.runQuery(
      `SELECT * FROM users WHERE username = '${username}';`,
    );

    const user = rows?.[0];

    if (user) {
      return { ...user, id: `${user.id}` };
    }
  }
}
