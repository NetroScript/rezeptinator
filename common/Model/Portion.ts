import { IIngredient } from '@common/Model/Ingredient';
import { LocalisationInformation } from '@common/Model/Localisation';

export enum PortionModifierSizes {
  'Half' = 'Half',
  'Quarter' = 'Quarter',
  'Eighth' = 'Eighth',
}

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

export interface IPortion {
  amount: number;
  modifier?: PortionModifierSizes;
  ingredient: IIngredient;
}

export interface IUnitPortion extends IPortion {
  unit: Unit;
}

export interface IPiecePortion extends IPortion {
  type: PiecePortionTypes;
}

// Functions needed to interpret the Data of IPortion
export abstract class PortionFunctions {
  static getCandidates: () => LocalisationInformation[];
  // Returns weight in gram
  getWeight: () => number;
  getPrefix: () => LocalisationInformation;
  // If it is possible for this specific ingredient to use this type of portion
  canBeApplied: () => boolean;
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

export const PortionModifiers: { [key in PortionModifierSizes]: number } = {
  Half: 0.5,
  Quarter: 0.25,
  Eighth: 0.125,
};

export const PiecePortionModifiers: { [key in PiecePortionTypes]: number } = {
  [PiecePortionTypes.Small]: 0.85,
  [PiecePortionTypes.Medium]: 1,
  [PiecePortionTypes.Large]: 1.18,
  [PiecePortionTypes.ExtraLarge]: 1.35,
};
