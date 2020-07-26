import { splitIntoFraction } from '../common/Utility';
import { TagList } from '../common/Model/Recipe';

describe('Utility Functions | Fractions', function () {
  test('Correct fraction for 1.5', () => {
    console.log(TagList);
    const { number, fraction } = splitIntoFraction(1.5);
    expect(number).toBe(1);
    expect(fraction).toBe('½');
  });
  test('Correct fraction for 2.84', () => {
    const { number, fraction } = splitIntoFraction(2.84);
    expect(number).toBe(2.84);
    expect(fraction).toBe('');
  });
  test('Correct fraction for 50.333', () => {
    const { number, fraction } = splitIntoFraction(50 + 1 / 3);
    expect(number).toBe(50);
    expect(fraction).toBe('⅓');
  });
});
