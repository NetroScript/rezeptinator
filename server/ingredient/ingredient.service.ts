import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { IIngredient } from '@common/Model/Ingredient';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { CreateIngredientDto } from '@server/ingredient/dto/createIngredient.dto';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepository: Repository<IngredientEntity>,
    @InjectRepository(NutrientEntity)
    private readonly nutrientRepository: Repository<NutrientEntity>,
  ) {}

  async findAll(query): Promise<IIngredient[]> {
    return this.ingredientRepository.find();
  }

  async findByNameStarting(name: string): Promise<IIngredient[]> {
    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('LOWER(name) LIKE :name', { name: `%${name.toLowerCase()}%` })
      .orWhere('LOWER(alias) LIKE :name', { name: `%${name.toLowerCase()}%` })
      .getMany();
  }

  async findInList(idList: number[]): Promise<IIngredient[]> {
    return getRepository(IngredientEntity)
      .createQueryBuilder('ingredient')
      .where('ingredient.id IN (:ingredients)', { ingredients: idList })
      .getMany();
  }

  async deleteIngredient(id: number): Promise<DeleteResult> {
    return await this.ingredientRepository.delete({ id: id });
  }

  async clearData(): Promise<void> {
    await this.ingredientRepository.delete({});
    await this.nutrientRepository.delete({});
  }

  async addIngredient(ingredientData: IIngredient): Promise<IngredientEntity> {
    const ingredient = new IngredientEntity(ingredientData);
    if (ingredientData.nutritions !== undefined) {
      const nutrients = new NutrientEntity(ingredientData.nutritions);
      await this.nutrientRepository.save(nutrients);
      ingredient.nutritions = nutrients;
    }
    return await this.ingredientRepository.save(ingredient);
  }

  async addIngredients(ingredientData: IIngredient[]): Promise<IngredientEntity[]> {
    const ingredients: IngredientEntity[] = [];
    const nutrients: (NutrientEntity | unknown)[] = [];

    for (const ingredient in ingredientData) {
      ingredients.push(new IngredientEntity(ingredientData[ingredient]));
      nutrients.push(
        ingredientData[ingredient].nutritions !== undefined
          ? new NutrientEntity(ingredientData[ingredient].nutritions)
          : undefined,
      );
    }

    await this.nutrientRepository.save(
      nutrients.filter<NutrientEntity>((element): element is NutrientEntity => {
        return element !== undefined;
      }),
    );

    ingredients.forEach((element, index) => {
      if (nutrients[index] instanceof NutrientEntity) {
        element.nutritions = nutrients[index] as NutrientEntity;
      }
    });

    await this.ingredientRepository.save(ingredients);

    return ingredients;
  }
}
