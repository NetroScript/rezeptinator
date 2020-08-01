import { Optional } from '@nestjs/common';
import { IsEnum, IsIn, IsInt, IsNumber, IsPositive, IsString, Max } from 'class-validator';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { AvailableLanguages } from '@common/Localisation/Generic';

export enum QueryDetailLevel {
  Overview,
  Complete,
}

export enum RecipeOrderVariants {
  Default,
  DefaultInverse,
  Rating,
  RatingInverse,
  Calories,
  CaloriesInverse,
  Difficulty,
  DifficultyInverse,
  CookTime,
  CookTimeInverse,
}

export class advancedRecipeSearchDto {
  @Optional()
  @IsString()
  name?: string;

  @Optional()
  @IsInt({ each: true })
  includeIngredients?: number[];

  @Optional()
  @IsInt({ each: true })
  excludeIngredients?: number[];

  @Optional()
  @IsEnum(IngredientCategories, { each: true })
  includeCategories?: IngredientCategories[];

  @Optional()
  @IsEnum(IngredientCategories, { each: true })
  excludeCategories?: IngredientCategories[];

  @Optional()
  @IsEnum(Vegan)
  veganLevel?: Vegan;

  @Optional()
  @IsInt()
  author?: number;

  @Optional()
  @IsNumber()
  maxDifficulty?: number;

  @Optional()
  @IsNumber()
  minDifficulty?: number;

  @Optional()
  @IsInt({ each: true })
  hasTags?: number;

  @Optional()
  @IsNumber()
  maxCookTime?: number;

  @Optional()
  @IsNumber()
  maxTotalTime?: number;

  @Optional()
  @IsNumber()
  minimalRating?: number;

  @Optional()
  @IsEnum(AllergyGroups, { each: true })
  excludeAllergies?: AllergyGroups[];

  @Optional()
  @IsEnum(AvailableLanguages)
  language?: AvailableLanguages;

  // Query Specific
  @IsInt()
  @IsPositive()
  @Max(250)
  take = 25;
  @IsInt()
  @IsPositive()
  skip = 0;

  @IsEnum(QueryDetailLevel)
  detail: QueryDetailLevel = QueryDetailLevel.Overview;

  @IsEnum(RecipeOrderVariants)
  order: RecipeOrderVariants = RecipeOrderVariants.Default;
}
