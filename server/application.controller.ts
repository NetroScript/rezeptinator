import { Get, Controller } from '@nestjs/common';
import { IUser } from '@common/Model/User';

@Controller()
export class AppController {
  @Get('/ping')
  ping(): string {
    return 'pong';
  }

  /*
  @Get('/users')
  async fetchAll(): Promise<User[]> {
    return [
      { name: 'John' },
      { name: 'Joe' },
      { name: 'Peter' },
      { name: 'Potato' },
      { name: 'Gustav' },
    ];
  }
  */
}
