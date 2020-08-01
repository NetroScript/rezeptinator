import { IRecipe, ITag } from '@common/Model/Recipe';
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

@Entity('recipe')
export class RecipeEntity implements IRecipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('float')
  cookTime: number;

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  lastUpdated: Date;

  @ManyToOne((type) => UserEntity, (user) => user.recipes)
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

  @Column('json')
  recipeSteps: IRecipeStep[];

  @Column('int')
  servingSize: number;

  @ManyToMany((type) => TagEntity, {
    eager: true,
  })
  @JoinTable()
  tags: TagEntity[];

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
