import { isRecord, validateInput } from './validators/inputValidator.js';

const types = { beam: 'beam', column: 'column', 'beam-column-joint': 'joint', joint: 'joint' };
const percent = minimum => value => Number.isFinite(value) && value >= minimum && value <= 100;
const settingsValidators = {
  mode: value => ['solid', 'xray', 'wireframe'].includes(value),
  exploded: value => typeof value === 'boolean',
  explodeAmount: percent(0),
  xrayOpacity: percent(5),
  wireframeOpacity: percent(0),
  clearanceThreshold: percent(0),
  lighting: value => ['Estudio', 'Exterior', 'Tenue'].includes(value),
  cameraPreset: value => ['perspective', 'top', 'front', 'right'].includes(value),
  visibility: value => isRecord(value) && Object.values(value).every(item => typeof item === 'boolean'),
};

export function parseViewerJSON(data) {
  if (!isRecord(data)) throw new Error('se esperaba un objeto');

  let model = null;
  let saved = {};
  if (Object.hasOwn(data, 'type')) {
    if (Object.hasOwn(data, 'state') || Object.hasOwn(data, 'model')) throw new Error('formato de modelo ambiguo');
    const type = typeof data.type === 'string' && Object.hasOwn(types, data.type) ? types[data.type] : undefined;
    if (!type) throw new Error('type de modelo desconocido');
    model = { type, parameters: type === 'joint' ? { ...data, type: 'beam-column-joint' } : data };
  } else {
    saved = Object.hasOwn(data, 'state') ? data.state : data;
    if (!isRecord(saved)) throw new Error('state debe ser un objeto');
    if (data.model !== undefined && data.model !== null) {
      if (!isRecord(data.model) || !isRecord(data.model.parameters) ||
          !['beam', 'column', 'joint'].includes(data.model.type)) throw new Error('model debe contener type y parameters válidos');
      const { type, parameters } = data.model;
      model = { type, parameters: type === 'joint'
        ? { id: 'J-01', type: 'beam-column-joint', ...parameters } : parameters };
    }
  }

  const settings = {};
  for (const [key, valid] of Object.entries(settingsValidators)) {
    if (!Object.hasOwn(saved, key)) continue;
    if (!valid(saved[key])) throw new Error(`${key} tiene un valor inválido`);
    settings[key] = saved[key];
  }
  if (model) {
    const { type, parameters } = model;
    if (parameters.type !== (type === 'joint' ? 'beam-column-joint' : type)) throw new Error('type de modelo incompatible con parameters.type');
    const result = validateInput(parameters);
    if (!result.valid) throw new Error(result.errors.join('. '));
  } else if (!Object.keys(settings).length) {
    throw new Error('el archivo no contiene ajustes reconocidos');
  }
  return { model, settings };
}
