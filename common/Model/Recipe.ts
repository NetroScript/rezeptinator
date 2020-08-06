import { IUser } from '@common/Model/User';
import { IPortion } from '@common/Model/Portion';
import TagData from '../Data/Tags.json';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { IRecipeStep } from '@common/Model/RecipeStep';
import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  language: AvailableLanguages;
  creator: IUser;
  rating: number;
  favourites: number;
  difficulty: number;
  cookTime: number;
  totalTime: number;
  servingSize: number;
  creationDate: Date;
  recipeSteps: IRecipeStep[];
  ingredients: IPortion[];
  tags: ITag[];
  recipeSummary: IRecipeSummary;
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

export interface IRecipeQueryResult {
  totalCount: number;
  recipes: IRecipe[];
  lastId?: number;
  lastValue?: number;
}
