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
  // Additional names for the ingredient - this should include all the localised names
  // For example if the Name is Kartoffel it should include Potato, so that multiple languages
  // can be searched using the name search Endpoint - the problem would be an alias returning of another
  // language - so in the long run a better method would need to be added (f.e. alias including the language
  // they are for and additionally filtering for that)
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

export interface ICreateIngredient {
  alias?: string[];
  allergies: AllergyGroups[];
  category: IngredientCategories;
  name: string;
  nutritions?: INutrients;
  vegan: Vegan;
}
