import { DEFAULTS } from '../../config/defaults.js';
import { barIntervals } from '../../structural/columnBarLayout.js';

export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function isFinitePositive(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function validateInput(input) {
  const errors = [];
  if (!isRecord(input)) {
    return { valid: false, errors: ['Input must be an object'] };
  }
  if (typeof input.id !== 'string' || !input.id.trim()) errors.push('id debe ser un texto no vacío');
  if (input.units !== undefined && input.units !== 'mm') errors.push('units debe ser mm');
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
    for (const [key, type] of [['beam', 'beam'], ['column', 'column']]) {
      const member = input[key];
      if (!isRecord(member)) errors.push(`${key} debe ser un objeto`);
      else if (member.type !== undefined && member.type !== type) errors.push(`${key}.type debe ser ${type}`);
      else {
        errors.push(...validateInput({ id: `${input.id}-${key}`, ...member, type }).errors.map(error => key + ': ' + error));
      }
    }
    const beamId = input.beam?.id ?? `${input.id}-beam`;
    const columnId = input.column?.id ?? `${input.id}-column`;
    if (beamId === columnId) errors.push('beam.id y column.id deben ser distintos');
  }
  if (input.cover !== undefined && (!Number.isFinite(input.cover) || input.cover < 0)) {
    errors.push('cover must be a non-negative number');
  }
  if (input.type === 'beam' || input.type === 'column') {
    if (input.rebar !== undefined && !isRecord(input.rebar)) errors.push('rebar debe ser un objeto');
    if (input.stirrup !== undefined && !isRecord(input.stirrup)) errors.push('stirrup debe ser un objeto');
    const read = (group, key, fallback) => group?.[key] === undefined ? fallback : group[key];
    const diameter = read(input.rebar, 'diameter', read(input.rebar, 'longitudinalDiameter', DEFAULTS.rebar.diameter));
    const stirrupDiameter = read(input.stirrup, 'diameter', DEFAULTS.stirrup.diameter);
    const spacing = read(input.stirrup, 'spacing', DEFAULTS.stirrup.spacing);
    const cover = input.cover ?? DEFAULTS[input.type].cover;
    if (!isFinitePositive(diameter)) errors.push('El diámetro de barras debe ser positivo');
    if (!isFinitePositive(stirrupDiameter)) errors.push('El diámetro de estribo debe ser positivo');
    if (!isFinitePositive(spacing)) errors.push('La separación de estribos debe ser positiva');
    const inset = cover + stirrupDiameter + diameter / 2;
    const width = input.width - 2 * inset;
    const depth = input.depth - 2 * inset;
    if (width < diameter || depth < diameter) {
      errors.push('El recubrimiento y los diámetros no caben en la sección');
    }
    const minimums = { topCount: 1, bottomCount: 1, longitudinalCount: 4 };
    for (const [key, minimum] of Object.entries(minimums)) {
      const count = read(input.rebar, key, DEFAULTS.rebar[key]);
      if (!Number.isInteger(count) || count < minimum || count > 1000) {
        errors.push(`rebar.${key} debe ser un entero entre ${minimum} y 1000`);
        continue;
      }
      const relevantBeamCount = input.type === 'beam' && key !== 'longitudinalCount';
      const relevantColumnCount = input.type === 'column' && key === 'longitudinalCount';
      if ((relevantBeamCount && count > barIntervals(width, diameter) + 1) ||
          (relevantColumnCount && count > 2 * (barIntervals(width, diameter) + barIntervals(depth, diameter)))) {
        errors.push(`rebar.${key} no cabe en la sección`);
      }
    }
    const length = input.type === 'beam' ? input.length : input.height;
    if (Number.isFinite(length) && isFinitePositive(spacing) && length / spacing > 1000) {
      errors.push('La cantidad de estribos supera el límite de 1000');
    }
    if (Number.isFinite(length) && length < 2 * cover + stirrupDiameter) {
      errors.push('length / height debe permitir el recubrimiento y el diámetro del estribo');
    }
  }
  return { valid: errors.length === 0, errors };
}

export const validate = validateInput;
export default validateInput;
