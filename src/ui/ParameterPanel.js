export class ParameterPanel {
  constructor(state, actions) {
    this.state = state;
    this.actions = actions;
  }
  render(container) {
    container.innerHTML = `
      <div class="panel-heading"><span>Parámetros</span><button class="icon-button" title="Contraer">‹</button></div>
      <div class="panel-scroll">
        <section class="control-section"><h3>Visualización</h3>
          <div class="segmented three" id="mode-controls">
            <button data-mode="solid" class="active">Sólido</button>
            <button data-mode="xray">X-Ray</button>
            <button data-mode="wireframe">Malla</button>
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
          <select id="lighting-select"><option>Estudio</option><option>Exterior</option><option>Tenue</option></select>
        </section>
        <section class="control-section"><h3>Ejemplos</h3>
          <label for="element-type">Tipo de elemento
            <select id="element-type" name="elementType"><option value="beam">Viga</option><option value="column">Columna</option><option value="joint" selected>Unión viga-columna</option></select>
          </label>
          <div class="parameter-grid">
            <label>Ancho (mm)<input id="param-width" type="number" min="100" value="300"></label>
            <label>Alto/prof. (mm)<input id="param-depth" type="number" min="100" value="500"></label>
            <label>Longitud/altura (mm)<input id="param-length" type="number" min="500" value="4000"></label>
            <label>Recubrimiento (mm)<input id="param-cover" type="number" min="10" value="40"></label>
            <label>Diám. barras (mm)<input id="param-rebar" type="number" min="6" value="16"></label>
            <label>Diám. estribo (mm)<input id="param-stirrup" type="number" min="6" value="10"></label>
            <label>Separación (mm)<input id="param-spacing" type="number" min="50" value="150"></label>
          </div>
          <button class="wide-button" id="generate-button">Generar modelo</button>
          <button class="wide-button secondary" id="example-button">Escena de unión</button>
          <button class="wide-button secondary" id="clear-button">Limpiar modelo</button>
        </section>
      </div>`;
    container.querySelectorAll('#mode-controls button').forEach((button) => button.addEventListener('click', () => {
      container.querySelectorAll('#mode-controls button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
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
    container.querySelector('#generate-button').addEventListener('click', () => {
      const type = container.querySelector('#element-type').value;
      const width = Number(container.querySelector('#param-width').value);
      const depth = Number(container.querySelector('#param-depth').value);
      const longitudinal = Number(container.querySelector('#param-length').value);
      const cover = Number(container.querySelector('#param-cover').value);
      const rebarDiameter = Number(container.querySelector('#param-rebar').value);
      const stirrupDiameter = Number(container.querySelector('#param-stirrup').value);
      const spacing = Number(container.querySelector('#param-spacing').value);
      const element = {
        id: type === 'beam' ? 'V-01' : type === 'column' ? 'C-01' : 'J-01',
        type,
        width,
        depth,
        length: type === 'column' ? longitudinal : longitudinal,
        height: longitudinal,
        cover,
        rebar: { diameter: rebarDiameter, longitudinalCount: 4, topCount: 3, bottomCount: 3 },
        stirrup: { diameter: stirrupDiameter, spacing },
      };
      const parameters = type === 'joint'
        ? { beam: { ...element, id: 'V-01', type: 'beam' }, column: { ...element, id: 'C-01', type: 'column' } }
        : element;
      this.actions.generateModel(type, parameters);
    });
  }
}
