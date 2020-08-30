// Always per 100g for ingredients, other data structures keep track how
// much it is in relation themselves
// Improvement would be to also support fluids, but then also the density would be needed
// on the referencing object
export interface INutrients {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fibers: number;
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

// Interface for the API Request
export interface ICreateIngredient {
  alias?: string[];
  allergies: AllergyGroups[];
  category: IngredientCategories;
  name: string;
  nutritions?: INutrients;
  vegan: Vegan;
}
