import {
  AllergyGroups,
  IIngredient,
  IngredientCategories,
  INutrients,
  Vegan,
} from '@common/Model/Ingredient';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { NutrientDto } from '@server/ingredient/dto/createIngredient.dto';

@Entity('ingredient')
export class IngredientEntity implements IIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array', {
    nullable: true,
    default: '',
  })
  alias: string[];

  @Column('enum', {
    enum: AllergyGroups,
    default: '{' + AllergyGroups.None + '}',
    array: true,
  })
  @ApiProperty({ enum: AllergyGroups, isArray: true })
  allergies: AllergyGroups[];

  @Column('enum', {
    enum: IngredientCategories,
    default: IngredientCategories.Miscellaneous,
  })
  @ApiProperty({ enum: IngredientCategories })
  category: IngredientCategories;

  @Column('text', {
    unique: true,
  })
  name: string;

  @OneToOne((type) => NutrientEntity, { nullable: true, cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @ApiProperty({ type: NutrientDto })
  nutritions?: INutrients;

  @Column('int', { nullable: true })
  portionSize: number;

  @Column('enum', {
    enum: Vegan,
    default: Vegan.Neither,
  })
  @ApiProperty({ enum: Vegan })
  vegan: Vegan;

  @Exclude()
  @Column()
  @ApiHideProperty()
  userGenerated: boolean;

  constructor(data?: IIngredient) {
    if (data !== undefined) {
      this.alias = data.alias;
      this.allergies = data.allergies;
      this.category = data.category;
      this.name = data.name;
      this.portionSize = data.portionSize;
      this.vegan = data.vegan;
    }
  }
}
