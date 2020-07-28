import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { IngredientService } from '@server/ingredient/ingredient.service';
import { IIngredient } from '@common/Model/Ingredient';
import { collectedIngredients } from '@common/generate/GetIngredients';
import { CreateIngredientDto } from '@server/ingredient/dto/createIngredient.dto';

@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  async findAll(@Query() query): Promise<IIngredient[]> {
    return await this.ingredientService.findAll(query);
  }

  @Get('generateData')
  async generateData(): Promise<{ data: IIngredient[]; time: number }> {
    const now = Date.now();
    await this.ingredientService.clearData();
    await this.ingredientService.addIngredients(collectedIngredients);
    return { data: collectedIngredients, time: Date.now() - now };
  }

  @Get(':name')
  async findIngredient(@Param('name') name): Promise<IIngredient[]> {
    return await this.ingredientService.findByNameStarting(name);
  }

  @Delete(':id')
  async deleteIngredient(@Param('id', ParseIntPipe) number: number): Promise<boolean> {
    const data = await this.ingredientService.deleteIngredient(number);
    if (data.affected == 1) {
      return true;
    }
    return false;
  }

  @Post()
  async createIngredient(@Body() IngredientDto: CreateIngredientDto): Promise<IngredientEntity> {
    return await this.ingredientService.addIngredient(
      Object.assign({ id: -1, alias: [] }, IngredientDto),
    );
  }
}
