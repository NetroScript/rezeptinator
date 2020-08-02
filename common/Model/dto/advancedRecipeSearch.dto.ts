import { Optional } from '@nestjs/common';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { AvailableLanguages } from '@common/Localisation/Generic';

export enum RecipeOrderVariants {
  Default,
  Rating,
  Favourites,
  Calories,
  Difficulty,
  CookTime,
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
  hasTags?: number[];

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
  @Max(100)
  pageSize = 25;
  @Optional()
  @IsPositive()
  lastValue = 0;
  lastId = 0;

  @IsEnum(RecipeOrderVariants)
  order: RecipeOrderVariants = RecipeOrderVariants.Default;

  @IsBoolean()
  ascending: boolean;
}
