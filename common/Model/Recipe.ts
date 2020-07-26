import { User } from '@common/UserInterface';
import { IPortion } from '@common/Model/Portion';
import TagData from '../Data/Tags.json';

enum RecipeTags {}

interface IRating {
  creator: User;
  rating: number;
}

interface IRecipeImage {
  path: string;
}

interface IRecipeTag {
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

interface IRecipe {
  language: AvailableLanguages;
  creator: User;
  rating: number;
  difficulty: number;
  cookTime: number;
  totalTime: number;
  servingSize: number;
  creationDate: Date;
  recipeSteps: IRecipeStep[];
  ingredients: IPortion[];
}
