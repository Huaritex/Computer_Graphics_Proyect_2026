import { MM_TO_M } from '../../config/constants.js';

export function validateGeometry(input, group) {
  const errors = [];
  if (!input || typeof input !== 'object') errors.push('Structural input is missing');
  if (!group || typeof group.isGroup !== 'boolean') errors.push('A THREE.Group is required');

  if (input) {
    for (const key of ['width', 'depth', 'length', 'height']) {
      if (input[key] !== undefined && (!Number.isFinite(input[key]) || input[key] <= 0)) {
        errors.push(`${key} must be positive`);
      }
    }
  }

  if (group) {
    let concreteFound = false;
    group.traverse((object) => {
      const entity = object.userData?.entity;
      if (entity?.kind === 'concrete') concreteFound = true;
      if (entity?.diameter !== undefined && (!Number.isFinite(entity.diameter) || entity.diameter <= 0)) {
        errors.push(`Invalid reinforcement diameter on ${entity.id}`);
      }
    });
    if (!concreteFound) errors.push('Generated geometry has no concrete entity');
  }
  return { valid: errors.length === 0, errors };
}

export const validate = validateGeometry;
export default validateGeometry;
