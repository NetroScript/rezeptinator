import { IIngredient } from '@common/Model/Ingredient';
import { LocalisationInformation } from '@common/Model/Localisation';
import {
  IUnitPortion,
  PortionFunctions,
  PortionModifiers,
  PortionModifierSizes,
  Unit,
  Units,
} from '@common/Model/Portion';

export class UnitPortion implements IUnitPortion, PortionFunctions {
  static readonly Units = Unit;

  amount: number;
  ingredient: IIngredient;
  modifier?: PortionModifierSizes;

  unit: Unit;

  constructor({ amount, unit, ingredient, modifier }: IUnitPortion) {
    this.amount = amount;
    this.unit = unit;
    this.ingredient = ingredient;
    if (modifier != undefined) {
      this.modifier = modifier;
    }
  }

  canBeApplied(): boolean {
    return this.ingredient.hasOwnProperty('nutritions');
  }

  static getCandidates(): LocalisationInformation[] {
    return Object.keys(Unit).map(
      (entry): LocalisationInformation => {
        return {
          key: entry + 'Unit',
        };
      },
    );
  }

  getPrefix(): LocalisationInformation {
    return {
      key: 'UnitPortionPrefix',
      options: {
        amount: this.amount,
        unit: '$t(' + Unit[this.unit] + 'UnitShort)',
        modifier: this.modifier != undefined ? this.modifier : '',
      },
    };
  }

  getWeight(): number {
    return (
      this.amount *
      Units[this.unit] *
      (this.modifier != undefined ? PortionModifiers[this.modifier] : 1)
    );
  }
}
