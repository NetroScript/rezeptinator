import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ITag } from '@common/Model/Recipe';

@Entity('tag')
export class TagEntity implements ITag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group: string;
  @Column()
  tag: string;
}
