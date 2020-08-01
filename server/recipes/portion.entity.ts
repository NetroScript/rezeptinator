import { IPortion, PortionTypes } from '@common/Model/Portion';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';

@Entity('portion')
export class PortionEntity implements IPortion {
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

  @ManyToOne((type) => RecipeEntity, (recipe) => recipe.ingredients)
  recipe: RecipeEntity;

  servingSize = 1;
}
