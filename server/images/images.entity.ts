import { ITag } from '@common/Model/Recipe';
import { UserEntity } from '@server/user/user.entity';
import fs from 'fs';
import path from 'path';
import {
  AfterRemove,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm/index';

@Entity('image')
export class ImagesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  path: string;

  @Column()
  originalName: string;

  @ManyToOne((type) => UserEntity, (user) => user.images, { eager: true })
  uploader: UserEntity;

  getPath(): string {
    return path.join('images', this.path + '.jpg');
  }

  getPreviewPath(): string {
    return path.join('images', this.path + '.thumb.jpg');
  }

  @AfterRemove()
  onDelete() {
    try {
      fs.unlinkSync(this.getPath());
      fs.unlinkSync(this.getPreviewPath());
    } catch (e) {
      // Silent fail if files don't exust
    }
  }

  constructor(data?: { id?: number; path?: string; originaLName?: string }) {
    if (!!data) {
      if (data.id != undefined) {
        this.id = data.id;
      }
      this.path = data.path;
      this.originalName = data.originaLName;
    }
  }
}
