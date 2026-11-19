import { MM_TO_M } from '../config/constants.js';
import { DEFAULTS } from '../config/defaults.js';

export class ParameterProcessor {
  constructor(defaults = DEFAULTS) {
    this.defaults = defaults;
  }

  toScene(value) {
    return value * MM_TO_M;
  }

  process(input = {}) {
    const typeDefaults = this.defaults[input.type] || {};
    const result = { ...typeDefaults, ...input };
    result.cover = result.cover ?? typeDefaults.cover ?? this.defaults.column.cover;
    result.rebar = { ...this.defaults.rebar, ...(input.rebar || {}) };
    result.stirrup = { ...this.defaults.stirrup, ...(input.stirrup || {}) };

    for (const key of ['width', 'depth', 'length', 'height', 'cover']) {
      if (typeof result[key] === 'number') result[key] = Number(result[key]);
    }
    return result;
  }

  processJoint(input) {
    return {
      ...input,
      beam: this.process({ type: 'beam', ...input.beam }),
      column: this.process({ type: 'column', ...input.column }),
    };
  }
}

export default ParameterProcessor;
