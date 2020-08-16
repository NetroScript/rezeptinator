import {
  isDefined,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function fractionToString(fraction: number): string {
  switch (fraction.toFixed(3)) {
    case '0.500':
      return '½';
    case '0.333':
      return '⅓';
    case '0.667':
      return '⅔';
    case '0.250':
      return '¼';
    case '0.750':
      return '¾';
    case '0.200':
      return '⅕';
    case '0.400':
      return '⅖';
    case '0.600':
      return '⅗';
    case '0.800':
      return '⅘';
    case '0.167':
      return '⅙';
    case '0.833':
      return '⅚';
    case '0.143':
      return '⅐';
    case '0.125':
      return '⅛';
    case '0.375':
      return '⅜';
    case '0.625':
      return '⅝';
    case '0.875':
      return '⅞';
    case '0.111':
      return '⅑';
    case '0.100':
      return '⅒';
    default:
      return '';
  }
}

export function splitIntoFraction(amount: number): { number: number; fraction: string } {
  const amountFloor = Math.floor(amount);
  const fractionPart = amount - amountFloor;
  const fraction = fractionToString(fractionPart);

  return { number: !fraction ? amount : amountFloor, fraction };
}

/* #################################################################
  Code from: https://github.com/typestack/class-validator/issues/245
 */
@ValidatorConstraint({ async: false })
class IsNotSiblingOfConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (isDefined(value)) {
      return this.getFailedConstraints(args).length === 0;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${
      args.property
    } cannot exist alongside the following defined properties: ${this.getFailedConstraints(
      args,
    ).join(', ')}`;
  }

  getFailedConstraints(args: ValidationArguments) {
    return args.constraints.filter((prop) => isDefined(args.object[prop]));
  }
}

// Create Decorator for the constraint that was just created
function IsNotSiblingOf(props: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: props,
      validator: IsNotSiblingOfConstraint,
    });
  };
}

// Helper function for determining if a prop should be validated
function incompatibleSiblingsNotPresent(incompatibleSiblings: string[]) {
  return function (o, v) {
    return Boolean(
      isDefined(v) || incompatibleSiblings.every((prop) => !isDefined(o[prop])), // Validate if prop has value // Validate if all incompatible siblings are not defined
    );
  };
}

export function IncompatableWith(incompatibleSiblings: string[]) {
  const notSibling = IsNotSiblingOf(incompatibleSiblings);
  const validateIf = ValidateIf(incompatibleSiblingsNotPresent(incompatibleSiblings));
  return function (target: any, key: string) {
    notSibling(target, key);
    validateIf(target, key);
  };
}
/*
  Code from: https://github.com/typestack/class-validator/issues/245
 ################################################################# */

export function stepify(value: number, step: number): number {
  if (step != 0) {
    value = Math.floor(value / step + 0.5) * step;
  }

  return value;
}

//static _ALWAYS_INLINE_ float range_lerp(float p_value, float p_istart, float p_istop, float p_ostart, float p_ostop) { return Math::lerp(p_ostart, p_ostop, Math::inverse_lerp(p_istart, p_istop, p_value)); }

export function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
): number {
  return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
}
