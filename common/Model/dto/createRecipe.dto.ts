import { IRecipe, ITag } from '@common/Model/Recipe';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { IPortion, PortionTypes } from '@common/Model/Portion';
import { CreateIngredientDto } from '@common/Model/dto/createIngredient.dto';
import { IncompatableWith } from '@common/Utility';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IRecipeStep, RecipeStepTypes } from '@common/Model/RecipeStep';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class createRecipeDto {
  @IsPositive()
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

  @MinLength(4)
  title: string;

  @IsPositive()
  totalTime: number;
}

export class createPortionDto {
  @IsPositive()
  amount: number;

  @IncompatableWith(['ingredient'])
  @ValidateNested()
  newIngredient?: CreateIngredientDto;

  @IncompatableWith(['newIngredient'])
  @IsInt()
  ingredient?: number;

  @IsInt()
  @IsPositive()
  ingredientNameIndex: number;

  @IsEnum(PortionTypes)
  @ApiProperty({ enum: PortionTypes })
  instanceType: PortionTypes;

  @IsInt()
  @IsPositive()
  type: number;
}

export class createRecipeStepDto implements IRecipeStep {
  @IsEnum(RecipeStepTypes)
  @ApiProperty({ enum: RecipeStepTypes })
  readonly type: RecipeStepTypes;

  @MinLength(10)
  text: string;

  @IsPositive()
  time: number;

  @Optional()
  @IsNumber()
  payloadNumber?: number;

  @Optional()
  @IsInt()
  payloadType?: number;
}
