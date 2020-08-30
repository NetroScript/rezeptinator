import { IRecipeStep } from '@common/Model/Recipe/IRecipeStep';
import { RecipeStepTypes } from '@common/Model/Recipe/RecipeStep';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';

@Entity('recipestep')
export class RecipeStepEntity implements IRecipeStep {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('enum', { enum: RecipeStepTypes, default: RecipeStepTypes.Normal })
  @ApiProperty({ enum: RecipeStepTypes })
  type: RecipeStepTypes;

  @Column()
  text: string;

  @Column('float', { default: 0 })
  time: number;

  @Column('int', { nullable: true })
  payloadNumber?: number | null;

  @Column('int', { nullable: true })
  payloadType?: number | null;

  @Exclude()
  @ManyToOne((type) => RecipeEntity, (recipe) => recipe.recipeSteps)
  recipe: RecipeEntity;

  @Exclude()
  @RelationId((entity: RecipeStepEntity) => entity.recipe)
  recipeId: number;

  constructor(data?: IRecipeStep) {
    if (data !== undefined) {
      Object.assign(this, data);
    }
  }
}
