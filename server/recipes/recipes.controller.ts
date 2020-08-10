import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@server/common/guards/roles.guard';
import { rateRecipeDto } from '@server/recipes/dto/rateRecipe.dto';
import { returnRecipeDto } from '@server/recipes/dto/returnRecipe.dto';
import { returnRecipeQueryDto } from '@server/recipes/dto/returnRecipeQuery.dto';
import { RecipesService } from '@server/recipes/recipes.service';
import { TagEntity } from '@server/recipes/tag.entity';
import { IRecipe, ITag } from '@common/Model/Recipe';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { advancedRecipeSearchDto } from '@common/Model/dto/advancedRecipeSearch.dto';
import { RequiredRoles } from '@server/common/decorators/roles.decorator';
import { Roles } from '@common/Model/User';
import { User, UserNoError } from '@server/common/decorators/user.decorator';
import { DeleteResult } from 'typeorm';
import { createRecipeDto } from '@common/Model/dto/createRecipe.dto';

@Controller('recipes')
@UseGuards(RolesGuard)
@ApiTags('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post('find')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    type: [RecipeEntity],
    description:
      'Return recipes based on supplied filters -> this should actually be a get, but validation and parsing of the query would be a pain, so this is implemented as post',
  })
  async findAll(@Body() search: advancedRecipeSearchDto): Promise<returnRecipeQueryDto> {
    return new returnRecipeQueryDto(await this.recipesService.advancedSearchOverview(search));
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    type: RecipeEntity,
    description: 'Return a single recipe based on supplied its id',
  })
  async find(
    @Param('id', ParseIntPipe) recipeID: number,
    @UserNoError('id') userID: number,
  ): Promise<returnRecipeDto> {
    return new returnRecipeDto(await this.recipesService.findById(recipeID, userID));
  }

  @Get('generateData')
  @ApiBearerAuth()
  @RequiredRoles(Roles.Admin)
  @ApiResponse({
    type: [RecipeEntity],
    description: 'Fill database with recipes -> used for the presentation of the application.',
  })
  async generateData(): Promise<{ data: IRecipe[]; time: number }> {
    // TODO: Implement
    const now = Date.now();
    return { data: [], time: Date.now() - now };
  }

  @Get('tags/:name')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    type: [TagEntity],
    description: 'Find all tags containing this substring',
  })
  async findTags(@Param('name') name): Promise<ITag[]> {
    return await this.recipesService.findTagsByName(name);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequiredRoles(Roles.User)
  @ApiResponse({
    description: 'Delete a single recipe (either requires admin or owning the recipe',
  })
  async deleteRecipe(
    @Param('id', ParseIntPipe) id: number,
    @User('roles') roles: Roles[],
    @User('id') userID: number,
  ): Promise<{ success: boolean }> {
    let result: DeleteResult;

    if (roles.some((role) => role == Roles.Admin || role == Roles.Owner)) {
      result = await this.recipesService.delete(id);
    } else {
      const owner = await this.recipesService.getOwner(id);
      if (owner.id == userID) {
        result = await this.recipesService.delete(id);
      } else {
        throw new HttpException(
          { message: 'You need to be the creator of a recipe to delete it.' },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    return { success: result.affected == 1 };
  }

  @Post()
  @ApiBearerAuth()
  @RequiredRoles(Roles.User)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    description: 'Create a recipe - the ID of the created recipe will be returned',
  })
  async createRecipe(
    @Body() createData: createRecipeDto,
    @User('id') userID: number,
  ): Promise<{ success: boolean; id: number }> {
    const id = await this.recipesService.create(createData, userID);
    return { success: true, id };
  }

  @Post('favorite/:id')
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    description:
      'Toggle the favorite on a recipe. The property result is true when favorited, false when removed',
  })
  async setFavourite(
    @Param('id', ParseIntPipe) recipeID: number,
    @User('id') userID: number,
  ): Promise<{ success: boolean; result: boolean }> {
    return await this.recipesService.toggleFavourite(recipeID, userID);
  }

  @Get('favorite/:id')
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    description: 'Returns if a recipe is favorited',
  })
  async getFavourite(
    @Param('id', ParseIntPipe) recipeID: number,
    @User('id') userID: number,
  ): Promise<{ favorited: boolean }> {
    return { favorited: await this.recipesService.isFavourited(recipeID, userID) };
  }

  @Get('rating/:id')
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    description: 'Returns the rating which a user gave for a recipe or null',
  })
  async getRating(
    @Param('id', ParseIntPipe) recipeID: number,
    @User('id') userID: number,
  ): Promise<{ rating: number | null }> {
    return await this.recipesService.getRating(recipeID, userID);
  }

  @Post('rating/:id')
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    description: 'Returns the rating which a user gave for a recipe or null',
  })
  async rate(
    @Param('id', ParseIntPipe) recipeID: number,
    @User('id') userID: number,
    @Body() rating: rateRecipeDto,
  ): Promise<{ success: boolean }> {
    return await this.recipesService.rate(recipeID, userID, rating.rating);
  }
}
