import { AvailableLanguages } from '@common/Localisation/Generic';
import { ICreatePortion } from '@common/Model/CreatePortion';
import { PortionTypes } from '@common/Model/Portion';
import { ICreateRecipe } from '@common/Model/Recipe';
import { CreateIngredientDto } from '@server/ingredient/dto/createIngredient.dto';
import { IncompatableWith } from '@common/Utility';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IRecipeStep, RecipeStepTypes } from '@common/Model/RecipeStep';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class createRecipeDto implements ICreateRecipe {
  @Min(0)
  cookTime: number;

  @IsPositive()
  @Min(0)
  @Max(1)
  difficulty: number;

  @ValidateNested({ each: true })
  ingredients: createPortionDto[];

  @IsEnum(AvailableLanguages)
  @ApiProperty({ enum: AvailableLanguages })
  language: AvailableLanguages;

  @ValidateNested({ each: true })
  recipeSteps: createRecipeStepDto[];

  @IsInt()
  @Min(1)
  servingSize: number;

  @IsInt({ each: true })
  tags: number[];

  @IsInt({ each: true })
  images: number[];

  @MinLength(4)
  title: string;

  @Min(0)
  totalTime: number;
}

export class createPortionDto implements ICreatePortion {
  @IsPositive()
  amount: number;

  @IsOptional()
  @IncompatableWith(['ingredient'])
  @ValidateNested()
  newIngredient?: CreateIngredientDto;

  @IsOptional()
  @IncompatableWith(['newIngredient'])
  @IsInt()
  ingredient?: number;

  @IsInt()
  @Min(0)
  ingredientNameIndex: number;

  @IsEnum(PortionTypes)
  @ApiProperty({ enum: PortionTypes })
  instanceType: PortionTypes;

  @IsInt()
  @Min(0)
  type: number;
}

export class createRecipeStepDto implements IRecipeStep {
  @IsEnum(RecipeStepTypes)
  @ApiProperty({ enum: RecipeStepTypes })
  readonly type: RecipeStepTypes;

  @MinLength(10)
  text: string;

  @Min(0)
  time: number;

  @Optional()
  @IsNumber()
  payloadNumber?: number;

  @Optional()
  @IsInt()
  payloadType?: number;
}