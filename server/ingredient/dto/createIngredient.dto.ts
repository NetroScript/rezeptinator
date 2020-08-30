import {
  AllergyGroups,
  ICreateIngredient,
  IngredientCategories,
  INutrients,
  Vegan,
} from '@common/Model/Ingredient';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NutrientDto implements INutrients {
  @IsPositive()
  alcohol: number;
  @IsPositive()
  calories: number;
  @IsPositive()
  carbs: number;
  @IsPositive()
  fat: number;
  @IsPositive()
  fibers: number;
  @IsPositive()
  protein: number;
  @IsPositive()
  sugar: number;
}

export class CreateIngredientDto implements ICreateIngredient {
  @IsOptional()
  @IsString({ each: true })
  alias?: string[];

  @IsEnum(AllergyGroups, { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  @ApiProperty({ enum: AllergyGroups, isArray: true })
  allergies: AllergyGroups[];

  @IsEnum(IngredientCategories)
  @ApiProperty({ enum: IngredientCategories })
  category: IngredientCategories;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ValidateNested()
  nutritions?: NutrientDto;

  @IsEnum(Vegan)
  @ApiProperty({ enum: Vegan })
  vegan: Vegan;
}
