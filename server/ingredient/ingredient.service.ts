import { IIngredient } from '@common/Model/Ingredient';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import { Brackets } from 'typeorm/index';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepository: Repository<IngredientEntity>,
    @InjectRepository(NutrientEntity)
    private readonly nutrientRepository: Repository<NutrientEntity>,
  ) {}

  async findAll(): Promise<IIngredient[]> {
    return this.ingredientRepository.find();
  }

  async findByNameStarting(name: string, ignoreUserGenerated = true): Promise<IIngredient[]> {
    const query = this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.nutritions', 'nutrient')
      .where(
        new Brackets((qb) => {
          qb.where('LOWER(name) LIKE :name', {
            name: `%${name.toLowerCase()}%`,
          }).orWhere('LOWER(alias) LIKE :name', { name: `%${name.toLowerCase()}%` });
        }),
      );

    if (ignoreUserGenerated) {
      query.andWhere('ingredient.userGenerated = false');
    }

    return await query.getMany();
  }

  async findInList(idList: number[]): Promise<IngredientEntity[]> {
    if (idList.length == 0) {
      return [];
    }
    return this.ingredientRepository.find({ id: In(idList) });
  }

  async deleteIngredient(id: number): Promise<DeleteResult> {
    return await this.ingredientRepository.delete({ id: id });
  }

  async deleteUserCreatedList(ids: number[]): Promise<DeleteResult> {
    return await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .delete()
      .where('ingredient."userGenerated" = true')
      .andWhere('ingredient.id IN (:...ids)', { ids })
      .execute();
  }

  async clearData(): Promise<void> {
    await this.ingredientRepository.delete({});
    await this.nutrientRepository.delete({});
  }

  async addIngredient(
    ingredientData: IIngredient,
    userGenerated = true,
  ): Promise<IngredientEntity> {
    const ingredient = new IngredientEntity(ingredientData);
    ingredient.userGenerated = userGenerated;
    if (ingredientData.nutritions !== undefined) {
      const nutrients = new NutrientEntity(ingredientData.nutritions);
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

    ingredients.forEach((element, index) => {
      if (nutrients[index] instanceof NutrientEntity) {
        element.nutritions = nutrients[index] as NutrientEntity;
      }
    });

    await this.ingredientRepository.save(ingredients);

    return ingredients;
  }
}
