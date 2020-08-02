import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { IRecipeStep, RecipeStepTypes } from '@common/Model/RecipeStep';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { Exclude } from 'class-transformer';

@Entity('recipestep')
export class RecipeStepEntity implements IRecipeStep {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('enum', { enum: RecipeStepTypes, default: RecipeStepTypes.Normal })
  readonly type: RecipeStepTypes;

  @Column()
  text: string;

  @Column('float', { default: 0 })
  time: number;

  @Column('int', { nullable: true })
  payloadNumber?: number;

  @Column('int', { nullable: true })
  payloadType?: number;

  @Exclude()
  @ManyToOne((type) => RecipeEntity, (recipe) => recipe.recipeSteps)
  recipe: RecipeEntity;

  @Exclude()
  @RelationId((entity: RecipeStepEntity) => entity.recipe)
  recipeId: number;
}
