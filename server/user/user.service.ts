import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { LoginUserDto } from './dto/loginUser.dto';
import { CreateUserDto } from './dto/createUser.dto';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { IOwnAccount, IUser } from '@common/Model/User';
import { JWTTokenSecret } from '@server/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne({ email, password }: LoginUserDto): Promise<IOwnAccount> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new HttpException({ message: 'ERROR.NOACCOUNT' }, HttpStatus.BAD_REQUEST);
    }

    if (await argon2.verify(user.password, password)) return this.getAccount(user);

    throw new HttpException({ message: 'ERROR.WRONGPASSWORD' }, HttpStatus.BAD_REQUEST);
  }

  async createAccount({ username, email, password }: CreateUserDto): Promise<IOwnAccount> {
    // If a user with this username or email already exists fail the request
    if (await this.userRepository.findOne({ where: [{ username }, { email }] })) {
      throw new HttpException({ message: 'ERROR.USEREXISTS' }, HttpStatus.BAD_REQUEST);
    }

    const user = new UserEntity();
    user.profilePicture = `https://api.adorable.io/avatars/100/${username}.png`;
    user.username = username;
    user.email = email;
    user.password = password;

    await this.userRepository.save(user);

    return this.getAccount(user);
  }

  async delete(username: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ username });
  }

  async findByID(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new HttpException({ message: 'Account not found' }, HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async findByEMail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new HttpException({ message: 'Account not found' }, HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async findByUserName(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ username });

    if (!user) {
      throw new HttpException({ message: 'Account not found' }, HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async getAccountTokenByUsername(username: string): Promise<IOwnAccount> {
    return this.getAccount(await this.findByUserName(username));
  }

  generateToken(user: UserEntity) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.role,
        // Expire after 30 days
        exp: new Date().setDate(new Date().getDate() + 30) / 1000,
      },
      JWTTokenSecret,
    );
  }

  private getAccount(user: UserEntity): IOwnAccount {
    return Object.assign({ token: this.generateToken(user) }, user.convertToIUser());
  }
}
