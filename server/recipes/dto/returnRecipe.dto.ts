import { AvailableLanguages } from '@common/Localisation/Generic';
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { PortionEntity } from '@server/recipes/portion.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { TagEntity } from '@server/recipes/tag.entity';
import { UserEntity } from '@server/user/user.entity';

// Use a DTO to correctly exclude sensitive data using the transformer
export class returnRecipeDto implements IRecipe {
  cookTime: number;
  creationDate: Date;
  creator: UserEntity;
  difficulty: number;
  favorites: number;
  id: number;
  images: number[];
  ingredients: PortionEntity[];
  isFavorited: boolean;
  language: AvailableLanguages;
  rating: number;
  ratingAmount: number;
  recipeSteps: RecipeStepEntity[];
  recipeSummary: RecipeSummaryEntity;
  servingSize: number;
  tags: TagEntity[];
  title: string;
  totalTime: number;

  constructor(data?: IRecipe) {
    if (data != undefined) {
      Object.assign(this, data);
    }
  }
}
