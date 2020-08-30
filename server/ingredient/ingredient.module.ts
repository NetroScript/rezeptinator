import { Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientController } from '@server/ingredient/ingredient.controller';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { IngredientService } from '@server/ingredient/ingredient.service';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NutrientEntity, IngredientEntity])],
  providers: [IngredientService],
  controllers: [IngredientController],
  exports: [IngredientService],
})
export class IngredientModule implements NestModule {
  configure(): void {}
}
