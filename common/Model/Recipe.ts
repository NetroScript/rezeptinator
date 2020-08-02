import { IUser } from '@common/Model/User';
import { IPortion } from '@common/Model/Portion';
import TagData from '../Data/Tags.json';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { IRecipeStep } from '@common/Model/RecipeStep';

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
}
