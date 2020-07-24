import { IIngredient } from '@common/Model/Ingredient';
import { LocalisationInformation } from '@common/Model/Localisation';
import {
  IPiecePortion,
  PiecePortionModifiers,
  PiecePortionTypes,
  PortionFunctions,
  PortionModifiers,
  PortionModifierSizes,
} from '@common/Model/Portion';

export class PiecePortion implements IPiecePortion, PortionFunctions {
  static readonly types = PiecePortionTypes;

  amount: number;
  type: PiecePortionTypes;
  ingredient: IIngredient;
  modifier?: PortionModifierSizes;

  constructor({ amount, type, ingredient, modifier }: IPiecePortion) {
    this.amount = amount;
    this.type = type;
    this.ingredient = ingredient;
    if (modifier != undefined) {
      this.modifier = modifier;
    }
  }

  canBeApplied(): boolean {
    if (
      this.ingredient.hasOwnProperty('portionSize') &&
      this.ingredient.hasOwnProperty('nutritions')
    ) {
      return (this.ingredient as IIngredient).portionSize !== undefined;
    }
    return false;
  }

  getPrefix(): LocalisationInformation {
    return {
      key: 'PiecePortionPrefix',
      options: {
        amount: this.amount,
        size: '$t(' + PiecePortionTypes[this.type] + 'PiecePortion)',
        modifier: this.modifier != undefined ? this.modifier : '',
      },
    };
  }

  getWeight(): number {
    if (!this.canBeApplied()) {
      return 0;
    }

    return (
      this.ingredient.portionSize *
      this.amount *
      PiecePortionModifiers[this.type] *
      (this.modifier != undefined ? PortionModifiers[this.modifier] : 1)
    );
  }

  static getCandidates(): LocalisationInformation[] {
    return Object.keys(PiecePortionTypes).map(
      (entry): LocalisationInformation => {
        return {
          key: entry + 'PiecePortion',
        };
      },
    );
  }
}
