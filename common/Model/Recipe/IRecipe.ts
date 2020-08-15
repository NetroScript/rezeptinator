import { AvailableLanguages } from '@common/Localisation/Generic';
import { IRecipeStep } from '@common/Model/Recipe/IRecipeStep';
import { IPortion } from '@common/Model/Recipe/Portion';
import { IRecipeSummary, ITag } from '@common/Model/Recipe/Recipe';
import { IUser } from '@common/Model/User';

// This now got its own file, because it generated non existant errors
// See the following links for reference:
// https://github.com/webpack/webpack/issues/7378
// https://github.com/TypeStrong/ts-loader/issues/653
// https://github.com/webpack/webpack/issues/2977
// https://github.com/angular/angular-cli/issues/2034#issuecomment-302666897

export interface IRecipe {
  id?: number;
  title: string;
  images: number[];
  language: AvailableLanguages;
  creator: IUser;
  rating: number;
  ratingAmount: number;
  favorites: number;
  difficulty: number;
  cookTime: number;
  totalTime: number;
  servingSize: number;
  creationDate: Date;
  recipeSteps: IRecipeStep[];
  ingredients: IPortion[];
  tags: ITag[];
  recipeSummary: IRecipeSummary;
  // If a user is logged in, and has it favourited this is set to true, otherwise false
  isFavorited: boolean;
  // The rating the user gave, or undefined if there is none or the user is not logged in
  userRating?: number;
}
