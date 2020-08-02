import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { INutrients } from '@common/Model/Ingredient';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity('nutrient')
export class NutrientEntity implements INutrients {
  @Exclude()
  @PrimaryGeneratedColumn()
  @ApiHideProperty()
  id: number;

  @Column('float')
  alcohol = 0;

  @Column('float')
  calories = 0;

  @Column('float')
  carbs = 0;

  @Column('float')
  fat = 0;

  @Column('float')
  fibers = 0;

  @Column('float')
  protein = 0;

  @Column('float')
  sugar = 0;

  constructor(data?: INutrients) {
    if (data !== undefined) {
      Object.assign(this, data);
    }
  }
}
