import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ITag } from '@common/Model/Recipe';
import { RecipeEntity } from '@server/recipes/recipe.entity';

@Entity('tag')
export class TagEntity implements ITag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group: string;
  @Column()
  tag: string;

  @ManyToMany((type) => RecipeEntity, (recipe) => recipe.tags)
  recipe: RecipeEntity[];

  constructor(data?: ITag) {
    if (!!data) {
      if (data.id != undefined) {
        this.id = data.id;
      }
      this.group = data.group;
      this.tag = data.tag;
    }
  }
}
