export const SCALE = 0.001;
export const MM_TO_M = SCALE;
export const UNITS = Object.freeze({
  INPUT: 'mm',
  SCENE: 'm',
  SCALE,
});

export const ENTITY_KINDS = Object.freeze({
  CONCRETE: 'concrete',
  REBAR: 'rebar',
  STIRRUP: 'stirrup',
});

export const DEFAULT_MATERIALS = Object.freeze({
  concrete: 0xbfc5ca,
  rebar: 0x2f6b8a,
  stirrup: 0x55aaff,
});
