// Always per 100xx
export interface INutrients {
  // Kalorien in kcal
  calories: number;
  // Proteine
  protein: number;
  // Fett
  fat: number;
  // Kohlenhydrate
  carbs: number;
  // Davon Zucker
  sugar: number;
  // Balaststoffe
  fibers: number;
  // Alcohol in Gramm -> 100ml Rum mit 65% haben 54g Alcohol, aber 65ml -> 54*1.25 = 65
  alcohol: number;
}

export enum Vegan {
  'Neither',
  'Vegetarion',
  'Vegan',
}

export enum IngredientCategories {
  'Fruit',
  'Vegetables',
  'Seeds',
  'Nuts',
  'Noodles',
  'Grain',
  'BakeryProducts',
  'Dairy',
  'Flesh',
  'Fish',
  'Poultry',
  'Fat',
  'Drinks',
  'Sweets',
  'Mushrooms',
  'Spices',
  'SeaFood',
  'Miscellaneous',
}

export enum AllergyGroups {
  'None',
  'Eggs',
  'Peanuts',
  'Fish',
  'Gluten',
  'Crustacean',
  'Lupin',
  'Lactose',
  'Nuts',
  'Sulfur dioxide / Sulfite',
  'Celery',
  'Mustard',
  'Sesame',
  'Soya',
  'Molluscs',
}

// Ingredients information
export interface IIngredient {
  // ID describing the ingredient
  id?: number;
  // Name of the Ingredient
  name: string;
  // Nutrition Table
  nutritions?: INutrients;
  // Weitere Namen unter denen die Zutat bekannt ist
  alias: string[];
  // Which type of ingredient it is
  category: IngredientCategories;
  // If this ingredient is vegan / Vegetarian / Neither
  vegan: Vegan;
  // Common Allergy groups
  allergies: AllergyGroups[];
  // If you have 1 of this ingredient - how much is that in g? for example 50g for a potato
  portionSize?: number;
}
