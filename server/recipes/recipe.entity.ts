import { IRecipe, ITag } from '@common/Model/Recipe';
import { ImagesEntity } from '@server/images/images.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { Exclude } from 'class-transformer';
import { UserRatingEntity } from '../user/userRating.entity';
import { UserEntity } from '../user/user.entity';
import { PortionEntity } from '@server/recipes/portion.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { TagEntity } from '@server/recipes/tag.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';

type RecipeEntityType = Omit<IRecipe, 'favorites' | 'images' | 'isFavorited'>;

@Entity('recipe')
export class RecipeEntity implements RecipeEntityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Exclude()
  @ManyToMany((type) => ImagesEntity, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  imageEntities: ImagesEntity[];

  @Column('float')
  cookTime: number;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  lastUpdated: Date;

  @ManyToOne((type) => UserEntity, (user) => user.recipes, { eager: true })
  creator: UserEntity;

  @Column('float')
  difficulty: number;

  @OneToMany((type) => PortionEntity, (ingredient) => ingredient.recipe, {
    eager: true,
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  ingredients: PortionEntity[];

  @Column('enum', {
    enum: AvailableLanguages,
    default: AvailableLanguages.English,
  })
  @ApiProperty({ enum: AvailableLanguages })
  language: AvailableLanguages;

  @Column('float')
  rating: number;

  @OneToMany((type) => RecipeStepEntity, (step) => step.recipe, {
    eager: true,
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  recipeSteps: RecipeStepEntity[];

  @Column('int')
  servingSize: number;

  @ManyToMany((type) => TagEntity, (tag) => tag.recipe, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  tags: TagEntity[];

  @Column('float')
  totalTime: number;

  @OneToMany((type) => UserRatingEntity, (rating) => rating.recipe)
  ratings: UserRatingEntity[];

  @ManyToMany((type) => UserEntity, (user) => user.favorites)
  favorites: UserEntity[];

  favoriteAmount: number;

  @OneToOne((type) => RecipeSummaryEntity, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  recipeSummary: RecipeSummaryEntity;
}
