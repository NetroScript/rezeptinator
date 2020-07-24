import * as fs from 'fs';
import {
  AllergyGroups,
  IIngredient,
  IngredientCategories,
  INutrients,
  Vegan,
} from '@common/Model/Ingredient';

interface DataEntry {
  name: string;
  kalorien: number;
  eiweiß: number;
  fett: number;
  kohlenhydrate: number;
  zucker: number;
  ballaststoffe: number;
  alkohol: number;
  vegan: string;
  allergien: string;
  alias?: string[];
  portion?: number;
}

function getNutrients(entry: DataEntry): INutrients {
  return {
    alcohol: entry.alkohol,
    calories: entry.kalorien,
    carbs: entry.kohlenhydrate,
    fat: entry.fett,
    fibers: entry.ballaststoffe,
    protein: entry.eiweiß,
    sugar: entry.zucker,
  };
}

const allergyCategories: { [key: string]: AllergyGroups } = {
  nuss: AllergyGroups.Nuts,
  erdnuss: AllergyGroups.Peanuts,
  ei: AllergyGroups.Eggs,
  sesam: AllergyGroups.Sesame,
  gluten: AllergyGroups.Gluten,
  fisch: AllergyGroups.Fish,
  soja: AllergyGroups.Soya,
  lupine: AllergyGroups.Lupin,
  milch: AllergyGroups.Lactose,
  senf: AllergyGroups.Mustard,
  weichtiere: AllergyGroups.Molluscs,
  krebstiere: AllergyGroups.Crustacean,
  sellerie: AllergyGroups.Celery,
};

function getIngredient(entry: DataEntry, category: IngredientCategories): IIngredient {
  const allergy: AllergyGroups[] = [];

  if (category == IngredientCategories.Nuts) {
    allergy.push(AllergyGroups.Nuts);
  }

  Object.entries(allergyCategories).forEach(([key, value]) => {
    if (entry.allergien.includes(key)) {
      allergy.push(value);
    }
  });

  if (category == IngredientCategories.Fish) {
    allergy.push(AllergyGroups.Fish);
  }

  if (entry.name.toLowerCase().includes('käse') || entry.name.toLowerCase().includes('joghurt')) {
    allergy.push(AllergyGroups.Lactose);
  }

  if (allergy.length == 0) {
    allergy.push(AllergyGroups.None);
  }

  return {
    allergies: allergy,
    category: category,
    name: entry.name,
    portionSize: !entry.portion ? entry.portion : undefined,
    alias: !entry.alias ? entry.alias : [],
    nutritions: getNutrients(entry),
    vegan:
      entry.vegan == 'vegan'
        ? Vegan.Vegan
        : entry.vegan == 'vegetarisch'
        ? Vegan.Vegetarion
        : Vegan.Neither,
  };
}

const categories: { [key: string]: IngredientCategories } = {
  fruits: IngredientCategories.Fruit,
  nuts: IngredientCategories.Nuts,
  seeds: IngredientCategories.Seeds,
  bakeryproducts: IngredientCategories.BakeryProducts,
  grain: IngredientCategories.Grain,
  seafood: IngredientCategories.SeaFood,
  fish: IngredientCategories.Fish,
  poultry: IngredientCategories.Poultry,
  noodles: IngredientCategories.Noodles,
  dairy: IngredientCategories.Dairy,
  flesh: IngredientCategories.Flesh,
  fat: IngredientCategories.Fat,
  drinks: IngredientCategories.Drinks,
  spices: IngredientCategories.Spices,
  sweets: IngredientCategories.Sweets,
  vegetables: IngredientCategories.Vegetables,
  mushrooms: IngredientCategories.Mushrooms,
  misc: IngredientCategories.Miscellaneous,
};

export const collectedIngredients: IIngredient[] = [].concat(
  Object.keys(categories).map((file): IIngredient[] => {
    const data: DataEntry[] = JSON.parse(
      fs.readFileSync(`./ingredient_data/${file}.json`, { encoding: 'utf8' }),
    );
    return data.map(
      (entry): IIngredient => {
        return getIngredient(entry, categories[file]);
      },
    );
  }),
);
