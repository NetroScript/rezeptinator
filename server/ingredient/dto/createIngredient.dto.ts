import {
  AllergyGroups,
  IIngredient,
  IngredientCategories,
  INutrients,
  Vegan,
} from '@common/Model/Ingredient';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateIngredientDto {
  @IsOptional()
  @IsArray()
  alias?: string[];

  @IsEnum(AllergyGroups, { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  allergies: AllergyGroups[];

  @IsEnum(IngredientCategories)
  category: IngredientCategories;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ValidateNested()
  nutritions?: NutrientDTO;

  @IsOptional()
  portionSize?: number;

  @IsEnum(Vegan)
  vegan: Vegan;
}

class NutrientDTO implements INutrients {
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
