import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  JoinTable,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import * as argon2 from 'argon2';
import { IUser, Roles } from '@common/Model/User';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { UserRatingEntity } from '@server/user/userRating.entity';

@Entity('user')
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ default: '' })
  profilePicture: string;

  @CreateDateColumn()
  joinDate: Date;

  @UpdateDateColumn()
  lastUpdated: Date;

  @Column('enum', {
    enum: Roles,
    default: '{' + Roles.User + '}',
    array: true,
  })
  role: Roles[];

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @OneToMany((type) => UserRatingEntity, (rating) => rating.user)
  ratings: UserRatingEntity[];

  @ManyToMany((type) => RecipeEntity)
  @JoinTable()
  favorites: RecipeEntity[];

  @OneToMany((type) => RecipeEntity, (recipe) => recipe.creator)
  recipes: RecipeEntity[];

  convertToIUser(): IUser {
    const { id, password, ratings, favorites, recipes, lastUpdated, ...data } = this;
    return data;
  }

  constructor(data?: IUser) {
    if (data != undefined) {
      Object.assign(this, data);
    }
  }
}
