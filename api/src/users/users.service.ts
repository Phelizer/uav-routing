import { Injectable } from '@nestjs/common';

export interface User {
  username: string;
  password: string;
  id: string;
}

@Injectable()
export class UsersService {
  // TODO: store only encrypyted version of passwords
  private readonly users: User[] = [
    {
      id: 'user1',
      username: 'user',
      password: '1111',
    },
    {
      id: 'iser2',
      username: 'researcher',
      password: '1111',
    },
  ];

  async findUser(username: string): Promise<User | undefined> {
    return this.users.find((usr) => usr.username === username);
  }
}
