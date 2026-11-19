import { DEFAULTS } from '../config/defaults.js';

export class ParameterPanel {
  constructor(state, actions) {
    this.state = state;
    this.actions = actions;
  }
  render(container) {
    container.innerHTML = `
      <div class="panel-heading"><span>Parámetros</span></div>
      <div class="panel-scroll">
        <section class="control-section"><h3>Visualización</h3>
          <div class="segmented three" id="mode-controls">
            <button data-mode="solid" class="active" aria-pressed="true">Sólido</button>
            <button data-mode="xray" aria-pressed="false">X-Ray</button>
            <button data-mode="wireframe" aria-pressed="false">Malla</button>
          </div>
          <label class="range-row"><span>Opacidad X-Ray</span><output id="xray-output">35%</output>
            <input id="xray-opacity" type="range" min="5" max="100" value="35">
          </label>
        </section>
        <section class="control-section"><h3>Vista de despiece</h3>
          <label class="switch-row"><span>Activar despiece</span><input id="exploded-toggle" type="checkbox"><i></i></label>
          <label class="range-row"><span>Distancia</span><output id="explode-output">18%</output>
            <input id="explode-amount" type="range" min="0" max="100" value="18">
          </label>
        </section>
        <section class="control-section"><h3>Comprobación geométrica</h3>
          <label class="range-row"><span>Umbral mínimo</span><output id="clearance-output">25 mm</output>
            <input id="clearance-threshold" type="range" min="0" max="100" value="25">
          </label>
        </section>
        <section class="control-section"><h3>Orientación</h3>
          <div class="view-grid" id="camera-presets">
            <button data-preset="perspective" title="Perspectiva">Iso</button>
            <button data-preset="top" title="Superior">Sup.</button>
            <button data-preset="front" title="Frontal">Fr.</button>
            <button data-preset="right" title="Derecha">Der.</button>
          </div>
        </section>
        <section class="control-section"><h3>Iluminación</h3>
          <select id="lighting-select" aria-label="Iluminación"><option>Estudio</option><option>Exterior</option><option>Tenue</option></select>
        </section>
        <section class="control-section"><h3>Ejemplos</h3>
          <label for="element-type">Tipo de elemento
            <select id="element-type" name="elementType"><option value="beam">Viga</option><option value="column">Columna</option><option value="joint" selected>Unión viga-columna</option></select>
          </label>
          ${['beam', 'column'].map(type => `
            <fieldset class="member-fields" data-member="${type}">
              <legend>${type === 'beam' ? 'Viga' : 'Columna'}</legend>
              <div class="parameter-grid">
                <label>Ancho (mm)<input id="${type}-width" type="number" min="1"></label>
                <label>${type === 'beam' ? 'Peralte' : 'Profundidad'} (mm)<input id="${type}-depth" type="number" min="1"></label>
                <label>${type === 'beam' ? 'Longitud' : 'Altura'} (mm)<input id="${type}-length" type="number" min="1"></label>
                <label>Recubrimiento (mm)<input id="${type}-cover" type="number" min="0"></label>
                <label>Diám. barras (mm)<input id="${type}-rebar" type="number" min="1"></label>
                <label>Diám. estribo (mm)<input id="${type}-stirrup" type="number" min="1"></label>
                <label>Paso de estribos (mm)<input id="${type}-spacing" type="number" min="1"></label>
              </div>
            </fieldset>`).join('')}
          <button class="wide-button" id="generate-button">Generar modelo</button>
          <button class="wide-button secondary" id="example-button">Escena de unión</button>
          <button class="wide-button secondary" id="clear-button">Limpiar modelo</button>
        </section>
      </div>`;
    container.querySelectorAll('#mode-controls button').forEach((button) => button.addEventListener('click', () => {
      container.querySelectorAll('#mode-controls button').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      this.actions.setMode(button.dataset.mode);
    }));
    container.querySelector('#xray-opacity').addEventListener('input', (event) => {
      container.querySelector('#xray-output').textContent = `${event.target.value}%`;
      this.actions.setXrayOpacity(Number(event.target.value));
    });
    container.querySelector('#exploded-toggle').addEventListener('change', (event) => this.actions.setExploded(event.target.checked));
    container.querySelector('#explode-amount').addEventListener('input', (event) => {
      container.querySelector('#explode-output').textContent = `${event.target.value}%`;
      this.actions.setExplodeAmount(Number(event.target.value));
    });
    container.querySelector('#clearance-threshold').addEventListener('input', (event) => {
      container.querySelector('#clearance-output').textContent = `${event.target.value} mm`;
      this.actions.setClearanceThreshold(Number(event.target.value));
    });
    container.querySelectorAll('#camera-presets button').forEach((button) => button.addEventListener('click', () => this.actions.setCameraPreset(button.dataset.preset)));
    container.querySelector('#lighting-select').addEventListener('change', (event) => this.actions.setLighting(event.target.value));
    container.querySelector('#example-button').addEventListener('click', () => this.actions.loadExample());
    container.querySelector('#clear-button').addEventListener('click', () => this.actions.clearModel());
    this.container = container;
    this.setModel('joint', {
      beam: { ...DEFAULTS.beam, rebar: DEFAULTS.rebar, stirrup: DEFAULTS.stirrup },
      column: { ...DEFAULTS.column, rebar: DEFAULTS.rebar, stirrup: DEFAULTS.stirrup },
    });
    container.querySelector('#element-type').addEventListener('change', () => this.updateMemberVisibility());
    container.querySelector('#generate-button').addEventListener('click', () => {
      const type = container.querySelector('#element-type').value;
      const read = (member) => {
        const value = (field) => {
          const input = container.querySelector(`#${member}-${field}`);
          return input.value.trim() === '' ? NaN : Number(input.value);
        };
        return {
          id: member === 'beam' ? 'V-01' : 'C-01', type: member,
          width: value('width'), depth: value('depth'),
          [member === 'beam' ? 'length' : 'height']: value('length'),
          cover: value('cover'),
          rebar: { diameter: value('rebar'), longitudinalCount: 4, topCount: 3, bottomCount: 3 },
          stirrup: { diameter: value('stirrup'), spacing: value('spacing') },
        };
      };
      this.actions.generateModel(type, type === 'joint' ? { beam: read('beam'), column: read('column') } : read(type));
    });
  }
  updateMemberVisibility() {
    const type = this.container.querySelector('#element-type').value;
    this.container.querySelectorAll('[data-member]').forEach(fieldset => {
      fieldset.hidden = type !== 'joint' && fieldset.dataset.member !== type;
    });
  }
  setModel(type, parameters) {
    this.container.querySelector('#element-type').value = type;
    for (const member of ['beam', 'column']) {
      const data = type === 'joint' ? parameters[member] : type === member ? parameters : null;
      if (!data) continue;
      const values = {
        width: data.width, depth: data.depth, length: member === 'beam' ? data.length : data.height,
        cover: data.cover, rebar: data.rebar?.diameter, stirrup: data.stirrup?.diameter,
        spacing: data.stirrup?.spacing,
      };
      for (const [field, value] of Object.entries(values)) {
        if (value !== undefined) this.container.querySelector(`#${member}-${field}`).value = value;
      }
    }
    this.updateMemberVisibility();
  }
  sync(state) {
    const c = this.container;
    c.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    for (const [id, value] of Object.entries({
      'xray-opacity': state.xrayOpacity, 'explode-amount': state.explodeAmount,
      'clearance-threshold': state.clearanceThreshold, 'lighting-select': state.lighting,
    })) c.querySelector('#' + id).value = value;
    c.querySelector('#exploded-toggle').checked = state.exploded;
    c.querySelector('#xray-output').textContent = state.xrayOpacity + '%';
    c.querySelector('#explode-output').textContent = state.explodeAmount + '%';
    c.querySelector('#clearance-output').textContent = state.clearanceThreshold + ' mm';
  }
}
