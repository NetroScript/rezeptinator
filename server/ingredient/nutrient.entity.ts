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
  alcohol: number;

  @Column('float')
  calories: number;

  @Column('float')
  carbs: number;

  @Column('float')
  fat: number;

  @Column('float')
  fibers: number;

  @Column('float')
  protein: number;

  @Column('float')
  sugar: number;

  constructor(data?: INutrients) {
    if (data !== undefined) {
      Object.assign(this, data);
    }
  }
}
