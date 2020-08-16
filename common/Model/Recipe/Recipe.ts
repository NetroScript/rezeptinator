import { AvailableLanguages } from '@common/Localisation/Generic';
import { AllergyGroups, IngredientCategories, INutrients, Vegan } from '@common/Model/Ingredient';
import { ICreatePortion } from '@common/Model/Recipe/ICreatePortion';
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { IRecipeStep } from '@common/Model/Recipe/IRecipeStep';
import { IUser } from '@common/Model/User';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import TagData from '../../Data/Tags.json';

interface IRating {
  creator: IUser;
  rating: number;
}

interface IRecipeImage {
  path: string;
}

// The Tag model would also need to be adjusted to work with localisation
// Meaning additionally a language entry which then also gets filterd on tag search
export interface ITag {
  id?: number;
  group: string;
  tag: string;
}

export const TagList: ITag[] = Object.keys(TagData)
  .map((key): ITag[] => {
    return TagData[key].map(
      (tag): ITag => {
        return { group: key, tag };
      },
    );
  })
  .reduce((current, out) => {
    return [...current, ...out];
  }, []);

export interface IRecipeSummary {
  // If this recipe is vegan / Vegetarian / Neither
  vegan: Vegan;
  // All the possible allergies this recipes contains
  allergies: AllergyGroups[];
  // All ingredient categories of this recipe
  categories: IngredientCategories[];
  // The total nutrients for the base recipes (for a single serving)
  totalNutritions: INutrients;
  // If nutrients are available for every single ingredient
  dataForAll: boolean;
}

export enum RecipeOrderVariants {
  Default,
  Rating,
  Favourites,
  Calories,
  Difficulty,
  CookTime,
}

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

export interface ICreateRecipe {
  cookTime: number;
  difficulty: number;
  images: number[];
  ingredients: ICreatePortion[];
  language: AvailableLanguages;
  recipeSteps: IRecipeStep[];
  servingSize: number;
  tags: number[];
  title: string;
  totalTime: number;
}

export interface IRecipeQueryResult {
  totalCount: number;
  recipes: IRecipe[];
  lastId?: number;
  lastValue?: number;
}