import { AvailableLanguages } from '@common/Localisation/Generic';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { IAdvancedRecipeSearch } from '@common/Model/Recipe/IAdvacedRecipeSearch';
import { RecipeOrderVariants } from '@common/Model/Recipe/Recipe';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class advancedRecipeSearchDto implements IAdvancedRecipeSearch {
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
  @Min(0)
  maxCookTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTotalTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
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
  @IsOptional()
  @Max(100)
  pageSize = 25;
  @IsOptional()
  @Min(0)
  lastValue?: number;
  @IsOptional()
  @Min(0)
  lastId?: number;

  @IsOptional()
  @IsEnum(RecipeOrderVariants)
  @ApiProperty({ enum: RecipeOrderVariants })
  order: RecipeOrderVariants = RecipeOrderVariants.Default;

  @IsOptional()
  @IsBoolean()
  ascending = true;
}
