import structuralSchema from '../structuralSchema.js';

function isFinitePositive(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function validateInput(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Input must be an object'] };
  }
  if (!input.id) errors.push('id is required');
  if (!input.type) errors.push('type is required');
  if (input.type && !['beam', 'column', 'beam-column-joint'].includes(input.type)) {
    errors.push(`Unsupported structural type: ${input.type}`);
  }

  if (input.type === 'beam') {
    for (const key of ['width', 'depth', 'length']) {
      if (!isFinitePositive(input[key])) errors.push(`${key} must be a positive number`);
    }
  } else if (input.type === 'column') {
    for (const key of ['width', 'depth', 'height']) {
      if (!isFinitePositive(input[key])) errors.push(`${key} must be a positive number`);
    }
  } else if (input.type === 'beam-column-joint') {
    if (!input.beam || typeof input.beam !== 'object') errors.push('beam is required');
    if (!input.column || typeof input.column !== 'object') errors.push('column is required');
  }
  if (input.cover !== undefined && (!Number.isFinite(input.cover) || input.cover < 0)) {
    errors.push('cover must be a non-negative number');
  }
  return { valid: errors.length === 0, errors };
}

export const validate = validateInput;
export default validateInput;
