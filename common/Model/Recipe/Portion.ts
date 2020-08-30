import { IIngredient } from '@common/Model/Ingredient';
import { LocalisationInformation } from '@common/Model/Localisation';
import { splitIntoFraction } from '@common/utils/general';

export enum Unit {
  Milligram,
  Gram,
  Pound,
  Kilogram,
  Millilitre,
  Centiliter,
  Deciliter,
  Liter,
  Drop,
  Dash,
  Shot,
  Cup,
  TeaSpoon,
  TableSpoon,
  KnifeTip,
  Pinch,
}

export enum PiecePortionTypes {
  'Small',
  'Medium',
  'Large',
  'ExtraLarge',
}

export enum PortionTypes {
  'Unit',
  'Piece',
}

export interface IPortion {
  // Needed so we know which class to restore from the Database Data
  readonly instanceType: PortionTypes;
  // Amount of X -> Turn Fractions into 1/2, 1/3, 2/3 and so on
  amount: number;
  // The specific type of this Portion, this could be either a unit or a size
  type: number;
  // How many servings should be created - is just another modifier with can be submitted
  servingSize: number;
  // The ingredient the portion references
  ingredient: IIngredient;
  // Describes which name is used for the ingredient - 0 normal name 1-n a specific index
  ingredientNameIndex: number;
}

// Functions needed to interpret the Data of IPortion
export abstract class PortionFunctions implements IPortion {
  abstract type: number;

  // private data used for calculations, doesn't need to be exposed
  private _servingSize: number;
  protected _cachedAmount = 1;
  protected _cachedFraction = '';

  abstract readonly instanceType: PortionTypes;
  ingredient: IIngredient;
  amount: number;
  ingredientNameIndex = 0;

  // Get the serving size
  get servingSize(): number {
    return this._servingSize;
  }

  // change the serving size, do additional calculations when doing so
  set servingSize(value: number) {
    ({ number: this._cachedAmount, fraction: this._cachedFraction } = splitIntoFraction(
      this.amount * value,
    ));

    this._servingSize = value;
  }

  protected constructor({ amount, ingredient }: IPortion) {
    this.amount = amount;
    this.ingredient = ingredient;
    this.servingSize = 1;
  }

  // Abstract static function not possible with current Typescript
  static getCandidates(): LocalisationInformation[] {
    return [];
  }
  // Returns weight in gram
  abstract getWeight(): number;
  abstract getText(): LocalisationInformation;
  // If it is possible for this specific ingredient to use this type of portion
  abstract canBeApplied(): boolean;
}

export const Units: { [key in Unit]: number } = {
  [Unit.Milligram]: 0.001,
  [Unit.Gram]: 1,
  [Unit.Pound]: 500,
  [Unit.Kilogram]: 1000,
  [Unit.Millilitre]: 1,
  [Unit.Centiliter]: 10,
  [Unit.Deciliter]: 100,
  [Unit.Liter]: 1000,
  [Unit.Drop]: 0.033333,
  [Unit.Dash]: 0.6,
  [Unit.Shot]: 10,
  [Unit.Cup]: 200,
  [Unit.TeaSpoon]: 5,
  [Unit.TableSpoon]: 15,
  [Unit.KnifeTip]: 0.3,
  [Unit.Pinch]: 0.15,
};

export const PiecePortionModifiers: { [key in PiecePortionTypes]: number } = {
  [PiecePortionTypes.Small]: 0.85,
  [PiecePortionTypes.Medium]: 1,
  [PiecePortionTypes.Large]: 1.18,
  [PiecePortionTypes.ExtraLarge]: 1.35,
};
