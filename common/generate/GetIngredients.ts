import * as fs from 'fs';
import {
  AllergyGroups,
  Ingredient,
  IngredientCategories,
  Nutrients,
  Vegan,
} from '@common/Ingredient';

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
}

function getNutrients(entry: DataEntry): Nutrients {
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

function getIngredient(entry: DataEntry, category: IngredientCategories): Ingredient {
  return {
    allergies: AllergyGroups.None,
    category: category,
    name: entry.name,
    portionSize: 30,
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
  fruits: IngredientCategories.Obst,
  nuts: IngredientCategories.Nüsse,
  seeds: IngredientCategories.Samen,
  bakeryproducts: IngredientCategories.Backwaren,
  grain: IngredientCategories.Getreide,
  seafood: IngredientCategories.Meeresfrüchte,
  fish: IngredientCategories.Fisch,
  poultry: IngredientCategories.Geflügel,
  noodles: IngredientCategories.Nudeln,
  dairy: IngredientCategories.Milchprodukte,
  flesh: IngredientCategories.Fleisch,
  fat: IngredientCategories.FetteÖle,
  drinks: IngredientCategories.Getränke,
  spices: IngredientCategories.GewürzeKräuterSaucen,
  sweets: IngredientCategories.Süßwaren,
  vegetables: IngredientCategories.Gemüse,
  mushrooms: IngredientCategories.Pilze,
  misc: IngredientCategories.Sonstiges,
};

export const collectedIngredients: Ingredient[] = [].concat(
  Object.keys(categories).map((file): Ingredient[] => {
    const data: DataEntry[] = JSON.parse(
      fs.readFileSync(`./ingredient_data/${file}.json`, { encoding: 'utf8' }),
    );
    return data.map(
      (entry): Ingredient => {
        return getIngredient(entry, categories[file]);
      },
    );
  }),
);
