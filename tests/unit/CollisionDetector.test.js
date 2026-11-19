import { describe, expect, it } from 'vitest';
import { CollisionDetector, segmentDistance } from '../../src/core/CollisionDetector.js';

const horizontal = (y) => ({
  start: [0, y, 0],
  end: [1, y, 0],
});

describe('CollisionDetector', () => {
  it('mide cero para segmentos que se cruzan', () => {
    const a = { start: [-1, 0, 0], end: [1, 0, 0] };
    const b = { start: [0, -1, 0], end: [0, 1, 0] };
    expect(segmentDistance(a, b)).toBeCloseTo(0);
  });

  it('detecta distancia menor al recubrimiento mínimo', () => {
    const detector = new CollisionDetector(0.2);
    expect(detector.detect([horizontal(0), horizontal(0.1)])).toHaveLength(1);
  });

  it('no reporta separación suficiente', () => {
    const detector = new CollisionDetector(0.05);
    expect(detector.detect([horizontal(0), horizontal(0.1)])).toHaveLength(0);
  });
});
