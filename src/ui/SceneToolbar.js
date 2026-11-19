export class SceneToolbar {
  constructor(actions) { this.actions = actions; }
  render(container) {
    container.innerHTML = `
      <div class="toolbar-group"><button id="reset-camera" title="Restablecer cámara" aria-label="Restablecer cámara">⌖<span>Restablecer</span></button></div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button id="hide-selected" title="Ocultar seleccionado" aria-label="Ocultar componente seleccionado">◌<span>Ocultar</span></button>
        <button id="show-all" title="Mostrar todo" aria-label="Mostrar todos los componentes">◉<span>Mostrar todo</span></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button id="import-model" title="Importar GLB/GLTF" aria-label="Importar modelo GLB o GLTF">⇧<span>Importar 3D</span></button>
        <button id="export-json" title="Exportar configuración" aria-label="Exportar configuración JSON">⇩<span>Exportar JSON</span></button>
        <button id="import-json" title="Importar configuración" aria-label="Importar configuración JSON">⇄<span>Importar JSON</span></button>
      </div>`;
    container.querySelector('#reset-camera').addEventListener('click', () => this.actions.resetCamera());
    container.querySelector('#hide-selected').addEventListener('click', () => this.actions.hideSelected());
    container.querySelector('#show-all').addEventListener('click', () => this.actions.showAll());
    container.querySelector('#import-model').addEventListener('click', () => this.actions.importModel());
    container.querySelector('#export-json').addEventListener('click', () => this.actions.exportJSON());
    container.querySelector('#import-json').addEventListener('click', () => this.actions.importJSON());
  }
}
