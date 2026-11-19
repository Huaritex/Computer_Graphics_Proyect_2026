export const DEFAULTS = Object.freeze({
  beam: Object.freeze({
    width: 300,
    depth: 500,
    length: 4000,
    cover: 40,
  }),
  column: Object.freeze({
    width: 400,
    depth: 400,
    height: 3000,
    cover: 40,
  }),
  rebar: Object.freeze({
    diameter: 16,
    topCount: 3,
    bottomCount: 3,
    longitudinalCount: 4,
  }),
  stirrup: Object.freeze({
    diameter: 10,
    spacing: 150,
  }),
  clearance: 25,
});

export default DEFAULTS;
