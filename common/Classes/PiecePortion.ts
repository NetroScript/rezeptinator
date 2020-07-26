import { IIngredient } from '@common/Model/Ingredient';
import { LocalisationInformation } from '@common/Model/Localisation';
import {
  IPortion,
  PiecePortionModifiers,
  PiecePortionTypes,
  PortionFunctions,
  PortionTypes,
} from '@common/Model/Portion';

/**
 * A PiecePortion is used to represent n pieces of a specific thing (like an apple)
 *
 * @export
 * @class PiecePortion
 * @implements {IPortion}
 * @extends {PortionFunctions}
 */
export class PiecePortion extends PortionFunctions implements IPortion {
  static readonly types = PiecePortionTypes;
  type: PiecePortionTypes;
  readonly instanceType = PortionTypes.Piece;

  /**
   * Creates an instance of PiecePortion.
   * @param {IPortion} { amount, type, ingredient, modifier }
   * @memberof PiecePortion
   */
  constructor({ amount, type, ingredient }: IPortion) {
    super();
    this.amount = amount;
    this.type = type as PiecePortionTypes;
    this.ingredient = ingredient;
    this.servingSize = 1;
  }

  /**
   * Returns if this specific instance can be used to calculate nutritions
   *
   * @returns {boolean}
   * @memberof PiecePortion
   */
  canBeApplied(): boolean {
    if (
      this.ingredient.hasOwnProperty('portionSize') &&
      this.ingredient.hasOwnProperty('nutritions')
    ) {
      return (this.ingredient as IIngredient).portionSize !== undefined;
    }
    return false;
  }

  /**
   * Get the displayed string in the Recipe List
   *
   * @returns {LocalisationInformation}
   * @memberof PiecePortion
   */
  getPrefix(): LocalisationInformation {
    return {
      key: 'PiecePortionPrefix',
      options: {
        amount: this._cachedAmount,
        fraction: this._cachedFraction,
        size: '$t(' + PiecePortionTypes[this.type] + 'PiecePortion)',
      },
    };
  }

  /**
   * Get the Weight of this portion in g
   *
   * @returns {number}
   * @memberof PiecePortion
   */
  getWeight(): number {
    if (!this.canBeApplied()) {
      return 0;
    }

    return this.ingredient.portionSize * this.amount * PiecePortionModifiers[this.type];
  }

  /**
   * Returns all Possible types for this Portion (For example Small Egg or Large Egg)
   *
   * @static
   * @returns {LocalisationInformation[]}
   * @memberof PiecePortion
   */
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
