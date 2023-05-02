import { Injectable } from '@nestjs/common';
import { Role } from 'src/users/role.enum';

export interface User {
  username: string;
  password: string;
  id: string;
  roles: Role[];
}

@Injectable()
export class UsersService {
  // TODO: store only encrypyted version of passwords
  private readonly users: User[] = [
    {
      id: 'user1',
      username: 'user',
      password: '1111',
      roles: [Role.User],
    },
    {
      id: 'user2',
      username: 'researcher',
      password: '1111',
      roles: [Role.Researcher],
    },
  ];

  async findUser(username: string): Promise<User | undefined> {
    return this.users.find((usr) => usr.username === username);
  }
}
