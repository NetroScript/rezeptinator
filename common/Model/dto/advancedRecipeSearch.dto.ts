import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { ApiProperty } from '@nestjs/swagger';

export enum RecipeOrderVariants {
  Default,
  Rating,
  Favourites,
  Calories,
  Difficulty,
  CookTime,
}

export class advancedRecipeSearchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt({ each: true })
  includeIngredients?: number[];

  @IsOptional()
  @IsInt({ each: true })
  excludeIngredients?: number[];

  @IsOptional()
  @IsEnum(IngredientCategories, { each: true })
  @ApiProperty({ enum: IngredientCategories, isArray: true })
  includeCategories?: IngredientCategories[];

  @IsOptional()
  @IsEnum(IngredientCategories, { each: true })
  @ApiProperty({ enum: IngredientCategories, isArray: true })
  excludeCategories?: IngredientCategories[];

  @IsOptional()
  @IsEnum(Vegan)
  veganLevel?: Vegan;

  @IsOptional()
  @IsInt()
  author?: number;

  @IsOptional()
  @IsNumber()
  maxDifficulty?: number;

  @IsOptional()
  @IsNumber()
  minDifficulty?: number;

  @IsOptional()
  @IsInt({ each: true })
  hasTags?: number[];

  @IsOptional()
  @IsNumber()
  maxCookTime?: number;

  @IsOptional()
  @IsNumber()
  maxTotalTime?: number;

  @IsOptional()
  @IsNumber()
  minimalRating?: number;

  @IsOptional()
  @IsEnum(AllergyGroups, { each: true })
  @ApiProperty({ enum: AllergyGroups, isArray: true })
  excludeAllergies?: AllergyGroups[];

  @IsOptional()
  @IsEnum(AvailableLanguages)
  @ApiProperty({ enum: AvailableLanguages })
  language?: AvailableLanguages;

  // Query Specific
  @IsInt()
  @IsPositive()
  @Max(100)
  pageSize = 25;
  @IsOptional()
  @Min(0)
  lastValue?;
  @IsOptional()
  @Min(0)
  lastId?;

  @IsOptional()
  @IsEnum(RecipeOrderVariants)
  @ApiProperty({ enum: RecipeOrderVariants })
  order: RecipeOrderVariants = RecipeOrderVariants.Default;

  @IsOptional()
  @IsBoolean()
  ascending = true;
}

export type IAdvancedRecipeSearch = advancedRecipeSearchDto;
