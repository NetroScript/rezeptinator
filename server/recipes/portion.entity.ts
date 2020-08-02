import { IPortion, PortionTypes } from '@common/Model/Portion';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { Exclude } from 'class-transformer';

@Entity('portion')
export class PortionEntity implements IPortion {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  amount: number;

  @OneToOne((type) => IngredientEntity, { eager: true })
  @JoinColumn()
  ingredient: IngredientEntity;

  @Column('int')
  ingredientNameIndex: number;

  @Column('enum', { enum: PortionTypes })
  readonly instanceType: PortionTypes;

  @Column('int')
  type: number;

  @Exclude()
  @ManyToOne((type) => RecipeEntity, (recipe) => recipe.ingredients)
  recipe: RecipeEntity;

  @Exclude()
  @RelationId((entity: PortionEntity) => entity.recipe)
  recipeId: number;

  servingSize = 1;
}
