// Map IPortion objects to the classes representing them using the instanceType they carry
import { PiecePortion } from '@common/Classes/PiecePortion';
import { UnitPortion } from '@common/Classes/UnitPortion';
import { Vegan } from '@common/Model/Ingredient';
import { IPortion, PortionFunctions, PortionTypes } from '@common/Model/Recipe/Portion';
import { IRecipeSummary } from '@common/Model/Recipe/Recipe';

export function getPortionClassFromInterface(portions: IPortion[]): PortionFunctions[] {
  return portions.map<PortionFunctions>((entity) => {
    if (entity.instanceType == PortionTypes.Piece) {
      return new PiecePortion(entity);
    } else {
      return new UnitPortion(entity);
    }
  });
}

// Convenience Method which makes getting the summary easier because you don't need to supply classes
export function getRecipeSummaryFromIPortion(
  portions: IPortion[],
  servingSize = 1,
): { summary: IRecipeSummary; weight: number } {
  return getRecipeSummary(getPortionClassFromInterface(portions), servingSize);
}

// Generate the RecipeSummary based on all supplied Portions, additionally allows the usage of a serving size
export function getRecipeSummary(
  portions: PortionFunctions[],
  servingSize = 1,
): { summary: IRecipeSummary; weight: number } {
  let totalWeight = 0;

  const summary = portions.reduce<IRecipeSummary>(
    (total, current) => {
      // Determine which type of vegan the summary should be
      if (current.ingredient.vegan === Vegan.Neither || total.vegan === Vegan.Neither) {
        total.vegan = Vegan.Neither;
      } else if (current.ingredient.vegan === Vegan.Vegetarion || total.vegan == Vegan.Vegetarion) {
        total.vegan = Vegan.Vegetarion;
      }

      // Boolean giving info if there is sufficient information for all ingredients
      if (current.ingredient.nutritions == undefined) {
        total.dataForAll = false;
      }

      current.ingredient.allergies.forEach((allergy) => {
        if (!total.allergies.includes(allergy)) {
          total.allergies.push(allergy);
        }
      });

      if (!total.categories.includes(current.ingredient.category)) {
        total.categories.push(current.ingredient.category);
      }

      if (!!current.ingredient.nutritions) {
        totalWeight += current.getWeight() / servingSize;
        // Divided by 100 because the calories are based on 100g ingredients
        const weight = current.getWeight() / servingSize / 100;

        // Add the value for every sub category
        for (const key in current.ingredient.nutritions) {
          if (
            current.ingredient.nutritions.hasOwnProperty(key) &&
            total.totalNutritions.hasOwnProperty(key)
          ) {
            total.totalNutritions[key] += current.ingredient.nutritions[key] * weight;
          }
        }
      }

      return total;
    },
    {
      allergies: [],
      categories: [],
      dataForAll: true,
      totalNutritions: {
        alcohol: 0,
        calories: 0,
        carbs: 0,
        fat: 0,
        fibers: 0,
        protein: 0,
        sugar: 0,
      },
      vegan: Vegan.Vegan,
    },
  );

  return { summary, weight: totalWeight };
}

// Get a summary for exactly 100g of that Recipe
export function get100gSummaryFromIPortion(portions: IPortion[]): IRecipeSummary {
  const portionInstances = getPortionClassFromInterface(portions);
  // Get the total weight to calculate how many portions are needed to create 100g
  const totalWeight = portionInstances.reduce((out, current) => {
    return out + current.getWeight();
  }, 0);
  return getRecipeSummary(portionInstances, totalWeight / 100).summary;
}
