export const elementSchema = {
  type: 'object',
  required: ['id', 'type'],
  properties: {
    id: { type: 'string' },
    type: { enum: ['beam', 'column', 'beam-column-joint'] },
  },
};

export const beamSchema = {
  type: 'object',
  required: ['id', 'type', 'width', 'depth', 'length'],
  properties: {
    id: { type: 'string' },
    type: { const: 'beam' },
    width: { type: 'number', minimum: 1 },
    depth: { type: 'number', minimum: 1 },
    length: { type: 'number', minimum: 1 },
    cover: { type: 'number', minimum: 0 },
  },
};

export const columnSchema = {
  type: 'object',
  required: ['id', 'type', 'width', 'depth', 'height'],
  properties: {
    id: { type: 'string' },
    type: { const: 'column' },
    width: { type: 'number', minimum: 1 },
    depth: { type: 'number', minimum: 1 },
    height: { type: 'number', minimum: 1 },
    cover: { type: 'number', minimum: 0 },
  },
};

export const structuralSchema = Object.freeze({
  element: elementSchema,
  beam: beamSchema,
  column: columnSchema,
  joint: {
    type: 'object',
    required: ['id', 'type', 'beam', 'column'],
  },
});

export default structuralSchema;
