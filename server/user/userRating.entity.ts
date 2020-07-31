import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { RecipeEntity } from '../recipes/recipe.entity';

@Entity('rating')
export class UserRatingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  rating: number;

  @ManyToOne((type) => UserEntity, (user) => user.ratings)
  user: UserEntity;

  @ManyToOne((type) => RecipeEntity, (recipe) => recipe.ratings)
  recipe: RecipeEntity;
}
