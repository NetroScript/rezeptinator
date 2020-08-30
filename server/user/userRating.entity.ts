import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { RecipeEntity } from '../recipes/recipe.entity';
import { UserEntity } from '../user/user.entity';

@Entity('rating')
@Unique(['user', 'recipe'])
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
