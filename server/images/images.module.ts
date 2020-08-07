import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesEntity } from '@server/images/images.entity';
import { UserEntity } from '@server/user/user.entity';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';

@Module({
  providers: [ImagesService],
  controllers: [ImagesController],
  imports: [TypeOrmModule.forFeature([UserEntity, ImagesEntity])],
})
export class ImagesModule {}
