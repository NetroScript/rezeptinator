import { IUser } from '@common/Model/User';
import { IPortion } from '@common/Model/Portion';
import TagData from '../Data/Tags.json';

interface IRating {
  creator: IUser;
  rating: number;
}

interface IRecipeImage {
  path: string;
}

export interface IRecipeTag {
  group: string;
  tag: string;
}

export const TagList: IRecipeTag[] = Object.keys(TagData)
  .map((key): IRecipeTag[] => {
    return TagData[key].map(
      (tag): IRecipeTag => {
        return { group: key, tag };
      },
    );
  })
  .reduce((current, out) => {
    return [...current, ...out];
  }, []);

export interface IRecipe {
  id?: number;
  language: AvailableLanguages;
  creator: IUser;
  rating: number;
  difficulty: number;
  cookTime: number;
  totalTime: number;
  servingSize: number;
  creationDate: Date;
  recipeSteps: IRecipeStep[];
  ingredients: IPortion[];
  tags: IRecipeTag[];
}
