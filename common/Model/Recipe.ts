import { ICreatePortion } from '@common/Model/CreatePortion';
import { IUser } from '@common/Model/User';
import { IPortion } from '@common/Model/Portion';
import TagData from '../Data/Tags.json';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { IRecipeStep } from '@common/Model/RecipeStep';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';

interface IRating {
  creator: IUser;
  rating: number;
}

interface IRecipeImage {
  path: string;
}

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

export interface IRecipe {
  id?: number;
  title: string;
  images: number[];
  language: AvailableLanguages;
  creator: IUser;
  rating: number;
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
}

export interface IRecipeSummary {
  // If this recipe is vegan / Vegetarian / Neither
  vegan: Vegan;
  // All the possible allergies this recipes contains
  allergies: AllergyGroups[];
  // All ingredient categories of this recipe
  categories: IngredientCategories[];
  // The total nutrients for the base recipes (for a single serving)
  totalNutritions: NutrientEntity;
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
