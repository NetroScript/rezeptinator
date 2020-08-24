import { AvailableLanguages } from '@common/Localisation/Generic';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { RecipeOrderVariants } from '@common/Model/Recipe/Recipe';

// This now got its own file, because it generated non existant errors
// See the following links for reference:
// https://github.com/webpack/webpack/issues/7378
// https://github.com/TypeStrong/ts-loader/issues/653
// https://github.com/webpack/webpack/issues/2977
// https://github.com/angular/angular-cli/issues/2034#issuecomment-302666897

export interface IAdvancedRecipeSearch {
  ascending?: boolean;
  author?: number;
  excludeAllergies?: AllergyGroups[];
  excludeCategories?: IngredientCategories[];
  excludeIngredients?: number[];
  hasTags?: number[];
  includeCategories?: IngredientCategories[];
  includeIngredients?: number[];
  language?: AvailableLanguages;
  lastId?: number;
  lastValue?: number;
  maxCookTime?: number;
  maxDifficulty?: number;
  maxTotalTime?: number;
  minDifficulty?: number;
  minimalRating?: number;
  name?: string;
  order?: RecipeOrderVariants;
  pageSize?: number;
  veganLevel?: Vegan;
}
