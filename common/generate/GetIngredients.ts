import * as fs from 'fs';
import {
  AllergyGroups,
  IIngredient,
  IngredientCategories,
  INutrients,
  Vegan,
} from '@common/Model/Ingredient';

import nuts from './ingredient_data/nuts.json';
import fruits from './ingredient_data/fruits.json';
import seeds from './ingredient_data/seeds.json';
import bakeryproducts from './ingredient_data/bakeryproducts.json';
import grain from './ingredient_data/grain.json';
import seafood from './ingredient_data/seafood.json';
import fish from './ingredient_data/fish.json';
import poultry from './ingredient_data/poultry.json';
import misc from './ingredient_data/misc.json';
import mushrooms from './ingredient_data/mushrooms.json';
import vegetables from './ingredient_data/vegetables.json';
import sweets from './ingredient_data/sweets.json';
import spices from './ingredient_data/spices.json';
import drinks from './ingredient_data/drinks.json';
import fat from './ingredient_data/fat.json';
import flesh from './ingredient_data/flesh.json';
import dairy from './ingredient_data/dairy.json';
import noodles from './ingredient_data/noodles.json';

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
    portionSize: entry.portion !== undefined ? entry.portion : undefined,
    alias: entry.alias !== undefined ? entry.alias : [],
    nutritions: getNutrients(entry),
    vegan:
      entry.vegan == 'vegan'
        ? Vegan.Vegan
        : entry.vegan == 'vegetarisch'
        ? Vegan.Vegetarion
        : Vegan.Neither,
  };
}

/*
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
*/

const categories: readonly { data: DataEntry[]; category: IngredientCategories }[] = [
  {
    category: IngredientCategories.Fruit,
    data: fruits,
  },
  {
    category: IngredientCategories.Nuts,
    data: nuts,
  },
  {
    category: IngredientCategories.Seeds,
    data: seeds,
  },
  {
    category: IngredientCategories.BakeryProducts,
    data: bakeryproducts,
  },
  {
    category: IngredientCategories.Grain,
    data: grain,
  },
  {
    category: IngredientCategories.SeaFood,
    data: seafood,
  },
  {
    category: IngredientCategories.Fish,
    data: fish,
  },
  {
    category: IngredientCategories.Poultry,
    data: poultry,
  },
  {
    category: IngredientCategories.Noodles,
    data: noodles,
  },
  {
    category: IngredientCategories.Dairy,
    data: dairy,
  },
  {
    category: IngredientCategories.Flesh,
    data: flesh,
  },
  {
    category: IngredientCategories.Fat,
    data: fat,
  },
  {
    category: IngredientCategories.Drinks,
    data: drinks,
  },
  {
    category: IngredientCategories.Spices,
    data: spices,
  },
  {
    category: IngredientCategories.Sweets,
    data: sweets,
  },
  {
    category: IngredientCategories.Vegetables,
    data: vegetables,
  },
  {
    category: IngredientCategories.Mushrooms,
    data: mushrooms,
  },
  {
    category: IngredientCategories.Miscellaneous,
    data: misc,
  },
] as const;

export const collectedIngredients: IIngredient[] = categories
  .map((entry) => {
    return entry.data.map((ingredient) => getIngredient(ingredient, entry.category));
  })
  .reduce((current, total) => {
    return [...current, ...total];
  }, [] as IIngredient[]);

/*
categories.forEach((key) => {
  collectedIngredients.concat(
    key.data.map((ingredient) => getIngredient(ingredient, key.category)),
  );
});
*/
