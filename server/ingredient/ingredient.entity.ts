import {
  AllergyGroups,
  IIngredient,
  IngredientCategories,
  INutrients,
  Vegan,
} from '@common/Model/Ingredient';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { NutrientDto } from '@server/ingredient/dto/createIngredient.dto';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AfterLoad, BeforeInsert } from 'typeorm/index';

@Entity('ingredient')
export class IngredientEntity implements IIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array', {
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

  @OneToOne((type) => NutrientEntity, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  @ApiProperty({ type: NutrientDto })
  nutritions?: INutrients | null;

  @Column('int', { nullable: true })
  portionSize?: number | null;

  @Column('enum', {
    enum: Vegan,
    default: Vegan.Neither,
  })
  @ApiProperty({ enum: Vegan })
  vegan: Vegan;

  @Exclude()
  @Column('boolean', { default: false })
  @ApiHideProperty()
  userGenerated: boolean;

  @AfterLoad()
  onLoaded() {
    this.alias = this.alias.map((alias) => alias.replace(/\[comma\]/g, ','));
  }

  @BeforeInsert()
  beforeInsert() {
    this.alias = this.alias.map((alias) => alias.replace(/,/g, '[comma]'));
  }

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
