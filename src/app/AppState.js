export class AppState {
  constructor(initial = {}) {
    this.state = {
      mode: 'solid',
      exploded: false,
      explodeAmount: 18,
      visibility: {},
      selectedId: null,
      cameraPreset: 'perspective',
      wireframeOpacity: 100,
      xrayOpacity: 35,
      lighting: 'Estudio',
      modelName: 'Unión de ejemplo',
      clearanceThreshold: 25,
      ...initial,
    };
    this.listeners = new Set();
  }
  get(key) { return key ? this.state[key] : this.state; }
  set(key, value) {
    if (typeof key === 'object') Object.assign(this.state, key);
    else this.state[key] = value;
    this.emit();
  }
  subscribe(listener) { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
  emit() { this.listeners.forEach((listener) => listener(this.state)); }
  snapshot() { return JSON.stringify({ app: 'VisorTécnico', version: 1, state: this.state }, null, 2); }
  restore(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (!parsed || typeof parsed !== 'object') throw new Error('Formato JSON no válido');
    Object.assign(this.state, parsed.state || parsed);
    this.emit();
  }
}
