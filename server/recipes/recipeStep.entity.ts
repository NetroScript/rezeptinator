import { IRecipeStep } from '@common/Model/IRecipeStep';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { RecipeStepTypes } from '@common/Model/RecipeStep';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PortionTypes } from '@common/Model/Portion';

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
