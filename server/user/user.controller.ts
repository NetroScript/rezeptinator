import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from '@server/user/user.service';
import { User } from '@server/common/decorators/user.decorator';
import { IOwnAccount, Roles } from '@common/Model/User';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountDto } from '@server/user/dto/accountDto';
import { CreateUserDto } from '@server/user/dto/createUser.dto';
import { LoginUserDto } from '@server/user/dto/loginUser.dto';
import { RequiredRoles } from '@server/common/decorators/roles.decorator';
import { RolesGuard } from '@server/common/guards/roles.guard';

@ApiBearerAuth()
@Controller('user')
@UseGuards(RolesGuard)
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiResponse({
    type: AccountDto,
    description: 'Returns the User Information for the currently logged in user',
  })
  async getOwnAccount(@User('username') username: string): Promise<IOwnAccount> {
    return await this.userService.getAccountTokenByUsername(username);
  }

  @Post()
  @ApiResponse({
    type: AccountDto,
    description: 'Creates a new account with the information submitted by the user',
  })
  async createAccount(@Body('user') userData: CreateUserDto): Promise<IOwnAccount> {
    return this.userService.createAccount(userData);
  }

  @Delete(':username')
  @RequiredRoles(Roles.Admin)
  @ApiResponse({ description: 'Delete a single account' })
  async deleteAccount(@Param('username') username) {
    return await this.userService.delete(username);
  }

  @Delete()
  @ApiResponse({ description: 'Delete your own account' })
  async deleteOwnAccount(@User('username') username: string) {
    return await this.userService.delete(username);
  }

  @Post('login')
  @ApiResponse({ description: 'Login to an account using a email and password combination' })
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<IOwnAccount> {
    return await this.userService.findOne(loginUserDto);
  }
}
