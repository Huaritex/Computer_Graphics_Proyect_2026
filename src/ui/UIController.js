import { ParameterPanel } from './ParameterPanel.js';
import { PropertiesPanel } from './PropertiesPanel.js';
import { SceneToolbar } from './SceneToolbar.js';
import { ValidationPanel } from './ValidationPanel.js';

export class UIController {
  constructor(root, state, actions) {
    this.root = root;
    this.state = state;
    this.actions = actions;
    this.parameterPanel = new ParameterPanel(state, actions);
    this.propertiesPanel = new PropertiesPanel(state);
    this.toolbar = new SceneToolbar(actions);
    this.validationPanel = new ValidationPanel();
  }
  render() {
    this.root.innerHTML = `
      <a class="skip-link" href="#viewport">Ir al visualizador</a>
      <header class="app-header"><button class="mobile-panel-toggle" id="mobile-panel-toggle" aria-label="Abrir panel de parámetros" aria-controls="left-panel" aria-expanded="false">☰</button><div class="brand-mark" aria-hidden="true">VT</div><div><h1>Visualizador Paramétrico 3D</h1><p>Estructuras de hormigón armado</p></div>
        <div class="header-status" role="status"><span aria-hidden="true"></span> Sesión activa</div>
      </header>
      <main class="workbench">
        <aside class="left-panel" id="left-panel"></aside>
        <section class="viewport-column">
          <nav class="scene-toolbar" id="scene-toolbar"></nav>
          <div class="viewport" id="viewport"><div class="viewport-badge">VISOR 3D</div></div>
          <footer class="validation-panel" id="validation-panel"></footer>
        </section>
        <aside class="right-panel" id="right-panel"></aside>
      </main>
      <input id="model-file-input" type="file" accept=".glb,.gltf,.bin,image/*,.png,.jpg,.jpeg,.webp" multiple hidden>
      <input id="json-file-input" type="file" accept=".json,application/json" hidden>`;
    this.parameterPanel.render(document.querySelector('#left-panel'));
    this.propertiesPanel.render(document.querySelector('#right-panel'));
    this.toolbar.render(document.querySelector('#scene-toolbar'));
    this.validationPanel.render(document.querySelector('#validation-panel'));
    const media = matchMedia('(max-width: 760px)');
    const updatePanelAccess = () => {
      const panel = document.querySelector('#left-panel');
      panel.inert = media.matches && !panel.classList.contains('mobile-open');
    };
    media.addEventListener('change', updatePanelAccess);
    updatePanelAccess();
    document.querySelector('#mobile-panel-toggle')?.addEventListener('click', () => {
      const panel = document.querySelector('#left-panel');
      const button = document.querySelector('#mobile-panel-toggle');
      const open = panel?.classList.toggle('mobile-open');
      updatePanelAccess();
      button?.setAttribute('aria-expanded', open ? 'true' : 'false');
      button?.setAttribute('aria-label', open ? 'Cerrar panel de parámetros' : 'Abrir panel de parámetros');
    });
  }
  bindFileInputs() {
    const modelInput = document.querySelector('#model-file-input');
    const jsonInput = document.querySelector('#json-file-input');
    modelInput.addEventListener('change', () => {
      if (modelInput.files?.length) this.actions.loadModelFiles(modelInput.files);
      modelInput.value = '';
    });
    jsonInput.addEventListener('change', async () => {
      if (!jsonInput.files?.length) return;
      try { await this.actions.importJSONFile(jsonInput.files[0]); }
      finally { jsonInput.value = ''; }
    });
  }
  openModelPicker() { document.querySelector('#model-file-input')?.click(); }
  openJSONPicker() { document.querySelector('#json-file-input')?.click(); }
  updateModel(modelRoot) { this.propertiesPanel.update(modelRoot); }
  bindSelection(modelRoot, selectionManager) {
    document.querySelector('#scene-tree')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-node]');
      if (!button) return;
      const object = modelRoot.getObjectByProperty('uuid', button.dataset.node);
      if (object) selectionManager.select(object);
    });
  }
  setStatus(text, kind) { this.validationPanel.setStatus(text, kind); }
  setModel(name, count) { this.validationPanel.setModel(name, count); }
  setWarnings(collisions, threshold, cameraInteraction) {
    this.propertiesPanel.updateWarnings(collisions, threshold, cameraInteraction);
  }
}
