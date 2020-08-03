import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { IngredientService } from '@server/ingredient/ingredient.service';
import { IIngredient } from '@common/Model/Ingredient';
import { collectedIngredients } from '@common/generate/GetIngredients';
import { CreateIngredientDto } from '@common/Model/dto/createIngredient.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@server/common/guards/roles.guard';
import { RequiredRoles } from '@server/common/decorators/roles.decorator';
import { Roles } from '@common/Model/User';

@Controller('ingredients')
@UseGuards(RolesGuard)
@ApiTags('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    type: [IngredientEntity],
    description: 'Returns all ingredients stored in the database',
  })
  async findAll(): Promise<IIngredient[]> {
    return await this.ingredientService.findAll();
  }

  @Get('generateData')
  @ApiBearerAuth()
  @RequiredRoles(Roles.Admin)
  @ApiResponse({
    type: [IngredientEntity],
    description: 'Fill database with ingredients -> used for the presentation of the application.',
  })
  async generateData(): Promise<{ data: IIngredient[]; time: number }> {
    const now = Date.now();
    await this.ingredientService.clearData();
    await this.ingredientService.addIngredients(collectedIngredients);
    return { data: collectedIngredients, time: Date.now() - now };
  }

  @Get(':name')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    type: [IngredientEntity],
    description:
      'Find all ingredients containing this sub string. This API also returns if an alias contains the substring',
  })
  async findIngredient(@Param('name') name): Promise<IIngredient[]> {
    return await this.ingredientService.findByNameStarting(name);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequiredRoles(Roles.Admin)
  @ApiResponse({ description: 'Delete a single ingredient' })
  async deleteIngredient(@Param('id', ParseIntPipe) number: number): Promise<boolean> {
    const data = await this.ingredientService.deleteIngredient(number);
    if (data.affected == 1) {
      return true;
    }
    return false;
  }

  @Post()
  @ApiBearerAuth()
  @RequiredRoles(Roles.User)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    type: IngredientEntity,
    description: 'Create a single user generated ingredient. They will be stored as user generated',
  })
  async createIngredient(@Body() IngredientDto: CreateIngredientDto): Promise<IngredientEntity> {
    return await this.ingredientService.addIngredient(
      Object.assign({ id: undefined, alias: [], portionSize: 1 }, IngredientDto),
    );
  }
}
