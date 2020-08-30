import { IRecipeStep } from '@common/Model/Recipe/IRecipeStep';

export enum RecipeStepTypes {
  Normal,
  Oven,
  Cooking,
  Rest,
}

export enum OvenTypes {
  LowerHeat,
  UpperHeat,
  LowerUpperHeat,
  Fan,
  FulLGrill,
  PartGrill,
  GrilLAndFan,
}

// For the case that specific functionality is added later to RecipeSteps we already
// implement a class per type, currently unusued

abstract class RecipeStep implements IRecipeStep {
  abstract readonly type: RecipeStepTypes;

  text: string;
  time: number;

  constructor(data?: IRecipeStep) {
    if (data !== undefined) {
      this.text = data.text;
      this.time = data.time;
    }
  }
}

export class NormalRecipeStep extends RecipeStep implements IRecipeStep {
  readonly type: RecipeStepTypes = RecipeStepTypes.Normal;
}

export class CookingRecipeStep extends RecipeStep implements IRecipeStep {
  readonly type: RecipeStepTypes = RecipeStepTypes.Cooking;
}

export class RestRecipeStep extends RecipeStep implements IRecipeStep {
  readonly type: RecipeStepTypes = RecipeStepTypes.Rest;
}

export class OvenRecipeStep extends RecipeStep implements IRecipeStep {
  readonly type: RecipeStepTypes = RecipeStepTypes.Oven;
  payloadNumber: number;
  payloadType: OvenTypes;

  constructor(data: IRecipeStep) {
    super();
    Object.assign(this, data);
    this.payloadType = data.payloadType % Object.keys(OvenTypes).length;
  }
}
