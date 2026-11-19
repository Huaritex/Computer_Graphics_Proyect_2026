import { describe, expect, it } from 'vitest';
import validateGeometryConfig from '../../src/validators/geometryValidator.js';

describe('geometryValidator', () => {
  it('valida una sección rectangular válida', () => {
    expect(validateGeometryConfig({ length: 3000, width: 300, height: 500, cover: 35 }).valid).toBe(true);
  });

  it('rechaza recubrimiento excesivo', () => {
    expect(validateGeometryConfig({ length: 3000, width: 100, height: 100, cover: 60 }).valid).toBe(false);
  });

  it('rechaza cantidad de barras no entera', () => {
    expect(validateGeometryConfig({ length: 3000, width: 300, height: 500, cover: 35, count: 4.5 }).valid).toBe(false);
  });
});
