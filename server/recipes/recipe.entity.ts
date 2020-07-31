import { IRecipe, IRecipeTag } from '@common/Model/Recipe';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { IPortion } from '@common/Model/Portion';
import { Exclude } from 'class-transformer';
import { UserRatingEntity } from '../user/userRating.entity';
import { UserEntity } from '../user/user.entity';

@Entity('recipe')
export class RecipeEntity implements IRecipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  cookTime: number;

  @Column('timestamp')
  creationDate: Date;

  @ManyToOne((type) => UserEntity, (user) => user.recipes)
  creator: UserEntity;
  @Column('float')
  difficulty: number;
  ingredients: IPortion[];
  language: AvailableLanguages;
  @Column('float')
  rating: number;
  recipeSteps: IRecipeStep[];
  @Column('int')
  servingSize: number;
  tags: IRecipeTag[];
  @Column('float')
  totalTime: number;

  @OneToMany((type) => UserRatingEntity, (rating) => rating.recipe)
  ratings: UserRatingEntity[];

  @Exclude()
  @OneToOne((type) => RecipeSummaryEntity, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  recipeSummary: RecipeSummaryEntity;
}
