export class ValidationPanel {
  constructor() { this.element = null; }
  render(container) {
    container.innerHTML = `
      <div class="validation-status" aria-live="polite"><span class="status-dot" aria-hidden="true"></span><span id="validation-text">Sistema listo</span></div>
      <div class="model-status"><span id="object-count">0 objetos</span><span id="model-name">Sin modelo</span></div>`;
  }
  setStatus(text, kind = 'ok') {
    const status = document.querySelector('#validation-text');
    const dot = document.querySelector('.status-dot');
    if (status) status.textContent = text;
    if (dot) dot.className = `status-dot ${kind}`;
  }
  setModel(name, count) {
    const objectCount = document.querySelector('#object-count');
    const modelName = document.querySelector('#model-name');
    if (objectCount) objectCount.textContent = `${count} objetos`;
    if (modelName) modelName.textContent = name;
  }
}
