import { describe, expect, it } from 'vitest';
import { validateInput, validatePositiveNumber } from '../../src/validators/inputValidator.js';

describe('inputValidator', () => {
  it('acepta dimensiones positivas', () => {
    expect(validateInput({ length: 3000, width: 300, height: 500 }).valid).toBe(true);
  });

  it('rechaza cero, negativos y valores no finitos', () => {
    expect(validatePositiveNumber(0, 'length').valid).toBe(false);
    expect(validatePositiveNumber(-1, 'width').valid).toBe(false);
    expect(validatePositiveNumber(Infinity, 'height').valid).toBe(false);
  });

  it('devuelve errores legibles', () => {
    const result = validateInput({ length: -3000, width: '300' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
