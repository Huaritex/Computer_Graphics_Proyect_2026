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
    for (const [key, type] of [['beam', 'beam'], ['column', 'column']]) {
      if (input[key] && typeof input[key] === 'object') {
        errors.push(...validateInput({ ...input[key], id: input[key].id || key, type }).errors.map(error => key + ': ' + error));
      }
    }
  }
  if (input.cover !== undefined && (!Number.isFinite(input.cover) || input.cover < 0)) {
    errors.push('cover must be a non-negative number');
  }
  if (input.type === 'beam' || input.type === 'column') {
    const diameter = input.rebar?.diameter ?? 16;
    const stirrupDiameter = input.stirrup?.diameter ?? 10;
    const spacing = input.stirrup?.spacing ?? 150;
    const cover = input.cover ?? 40;
    if (!isFinitePositive(diameter)) errors.push('El diámetro de barras debe ser positivo');
    if (!isFinitePositive(stirrupDiameter)) errors.push('El diámetro de estribo debe ser positivo');
    if (!isFinitePositive(spacing)) errors.push('La separación de estribos debe ser positiva');
    if (Number.isFinite(input.width) && Number.isFinite(input.depth) &&
        2 * (cover + stirrupDiameter + diameter) >= Math.min(input.width, input.depth)) {
      errors.push('El recubrimiento y los diámetros no caben en la sección');
    }
    const length = input.type === 'beam' ? input.length : input.height;
    if (Number.isFinite(length) && isFinitePositive(spacing) && length / spacing > 1000) {
      errors.push('La cantidad de estribos supera el límite de 1000');
    }
    if (Number.isFinite(length) && length <= 2 * cover) errors.push('La longitud debe superar dos veces el recubrimiento');
  }
  return { valid: errors.length === 0, errors };
}

export const validate = validateInput;
export default validateInput;
