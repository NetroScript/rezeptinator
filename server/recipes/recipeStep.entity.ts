import { Entity } from 'typeorm';

@Entity('recipestep')
export class RecipeStepEntity implements IRecipeStep {
  icon: IRecipeStepIcon;
  text: string;
  readonly type: RecipeStepTypes;
}
