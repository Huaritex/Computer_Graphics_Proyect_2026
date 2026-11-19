import { describe, expect, it } from 'vitest';
import { mmToWorld, distributeLongitudinalBars, rectangularPerimeterPoints } from '../../src/core/geometry.js';

describe('geometry', () => {
  it('convierte milímetros a unidades Three.js', () => {
    expect(mmToWorld(500)).toBeCloseTo(0.5);
  });

  it('genera las cuatro esquinas de un rectángulo', () => {
    expect(rectangularPerimeterPoints(300, 500)).toHaveLength(4);
  });

  it('distribuye cuatro barras simétricas', () => {
    const bars = distributeLongitudinalBars(300, 500, 35, 16, 4);
    expect(bars).toHaveLength(4);
    expect(bars[0][0]).toBeLessThan(0);
    expect(bars[1][0]).toBeGreaterThan(0);
  });

  it('rechaza barras que exceden la sección', () => {
    expect(() => distributeLongitudinalBars(50, 50, 30, 16, 4)).toThrow(RangeError);
  });
});
