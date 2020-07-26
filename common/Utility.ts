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
