export function validatePositiveNumber(value, name = 'value') {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return { valid: false, errors: [`${name} debe ser un número positivo`] };
  }
  return { valid: true, errors: [] };
}

export function validateInput(input = {}) {
  const errors = [];
  for (const [key, value] of Object.entries({
    length: input.length,
    width: input.width,
    height: input.height,
  })) {
    if (value === undefined) continue;
    const result = validatePositiveNumber(value, key);
    if (!result.valid) errors.push(...result.errors);
  }
  return { valid: errors.length === 0, errors };
}

export default validateInput;
