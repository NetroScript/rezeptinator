import { IngredientCategories } from '@common/Model/Ingredient';
import { OvenTypes } from '@common/Model/RecipeStep';

export const IconsForIngredientCategories: { [key in IngredientCategories]: string } = {
  0: 'mdi-food-apple',
  1: 'mdi-corn',
  2: 'mdi-seed',
  3: 'mdi-peanut',
  4: 'mdi-noodles',
  5: 'mdi-barley',
  6: 'mdi-cupcake',
  7: 'mdi-cow',
  8: 'mdi-food-steak',
  9: 'mdi-fish',
  10: 'mdi-egg',
  11: 'mdi-food',
  12: 'mdi-beer',
  13: 'mdi-candycane',
  14: 'mdi-mushroom',
  15: 'mdi-chili-mild',
  16: 'mdi-waves',
  17: 'mdi-silverware-variant',
};

export const IconsForOvenTypes: { [key in OvenTypes]: string } = {
  0: '$lowerheat',
  1: '$upperheat',
  2: '$lowerupperheat',
  3: '$fan',
  4: '$fullgrill',
  5: '$partgrill',
  6: '$grillfan',
};
