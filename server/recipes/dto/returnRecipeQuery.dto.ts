import { IRecipeQueryResult } from '@common/Model/Recipe';
import { returnRecipeDto } from '@server/recipes/dto/returnRecipe.dto';

// Use a DTO to correctly exclude sensitive data using the transformer
export class returnRecipeQueryDto implements IRecipeQueryResult {
  lastId: number;
  lastValue: number;
  recipes: returnRecipeDto[];
  totalCount: number;

  constructor(data?: IRecipeQueryResult) {
    if (data != undefined) {
      this.lastId = data.lastId;
      this.lastValue = data.lastValue;
      this.totalCount = data.totalCount;
      this.recipes = data.recipes.map((recipe) => new returnRecipeDto(recipe));
    }
  }
}
