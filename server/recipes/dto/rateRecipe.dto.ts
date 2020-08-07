import { Max, Min } from 'class-validator';

export class rateRecipeDto {
  @Min(0)
  @Max(5)
  rating: number;
}
