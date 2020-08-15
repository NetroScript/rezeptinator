import { IPortion, PortionTypes } from '@common/Model/Recipe/Portion';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('portion')
export class PortionEntity implements IPortion {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  amount: number;

  @ManyToOne((type) => IngredientEntity, { eager: true, cascade: true })
  ingredient: IngredientEntity;

  @Exclude()
  @RelationId((entity: PortionEntity) => entity.ingredient)
  ingredientId: number;

  @Column('int')
  ingredientNameIndex: number;

  @Column('enum', { enum: PortionTypes })
  @ApiProperty({ enum: PortionTypes })
  instanceType: PortionTypes;

  @Column('int')
  type: number;

  @Exclude()
  @ManyToOne((type) => RecipeEntity, (recipe) => recipe.ingredients)
  recipe: RecipeEntity;

  @Exclude()
  @RelationId((entity: PortionEntity) => entity.recipe)
  recipeId: number;

  servingSize = 1;

  constructor(data?: Omit<IPortion, 'servingSize' | 'ingredient'>) {
    if (data != undefined) {
      this.type = data.type;
      this.instanceType = data.instanceType;
      this.amount = data.amount;
      this.ingredientNameIndex = data.ingredientNameIndex;
    }
  }
}
