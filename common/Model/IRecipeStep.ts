import { RecipeStepTypes } from '@common/Model/RecipeStep';

// This now got its own file, because it generated non existant errors
// See the following links for reference:
// https://github.com/webpack/webpack/issues/7378
// https://github.com/TypeStrong/ts-loader/issues/653
// https://github.com/webpack/webpack/issues/2977
// https://github.com/angular/angular-cli/issues/2034#issuecomment-302666897

export interface IRecipeStep {
  readonly type: RecipeStepTypes;
  text: string;
  time: number;
  payloadType?: number;
  payloadNumber?: number;
}
