import * as THREE from 'three';
import { AppState } from './AppState.js';
import { SceneManager } from '../core/SceneManager.js';
import { CameraManager } from '../core/CameraManager.js';
import { RendererManager } from '../core/RendererManager.js';
import { LightingManager } from '../core/LightingManager.js';
import { ResourceManager } from '../core/ResourceManager.js';
import { SelectionManager } from '../interactions/SelectionManager.js';
import { VisibilityManager } from '../interactions/VisibilityManager.js';
import { XRayManager } from '../interactions/XRayManager.js';
import { ExplodedViewManager } from '../interactions/ExplodedViewManager.js';
import { CameraInteraction } from '../interactions/CameraInteraction.js';
import { ModelLoader } from '../loaders/ModelLoader.js';
import { UIController } from '../ui/UIController.js';
import CollisionDetector from '../structural/CollisionDetector.js';
import { validateInput } from '../data/validators/inputValidator.js';
import { parseViewerJSON } from '../data/viewerJSON.js';
import { DEFAULTS } from '../config/defaults.js';

export class App {
  constructor(root) {
    this.root = root;
    this.state = new AppState();
    this.resourceManager = new ResourceManager();
  }
  init() {
    this.ui = new UIController(this.root, this.state, this.createActions());
    this.ui.render();
    this.ui.bindFileInputs();
    const viewport = document.querySelector('#viewport');
    this.sceneManager = new SceneManager(viewport);
    this.rendererManager = new RendererManager(viewport);
    this.cameraManager = new CameraManager(this.rendererManager.renderer.domElement, this.sceneManager.scene);
    this.rendererManager.resize();
    this.cameraManager.resize(viewport.clientWidth, viewport.clientHeight);
    this.lightingManager = new LightingManager(this.sceneManager.scene);
    this.selectionManager = new SelectionManager(viewport, this.sceneManager.modelRoot, this.cameraManager.camera, this.state);
    this.visibilityManager = new VisibilityManager(this.sceneManager.modelRoot, this.state);
    this.xrayManager = new XRayManager(this.sceneManager.modelRoot);
    this.explodedManager = new ExplodedViewManager(this.sceneManager.modelRoot);
    this.cameraInteraction = new CameraInteraction(this.cameraManager);
    this.modelLoader = new ModelLoader(this.resourceManager);
    this.state.subscribe((state) => { this.ui.updateModel(this.sceneManager.modelRoot); this.ui.parameterPanel.sync(state); });
    this.ui.bindSelection(this.sceneManager.modelRoot, this.selectionManager);
    this.loadExample();
    this.bindResize();
    this.animate();
  }
  createActions() {
    return {
      setMode: (mode) => this.setMode(mode),
      setXrayOpacity: (value) => { this.state.set('xrayOpacity', value); if (this.state.get('mode') === 'xray') this.applyRenderMode(); },
      setExploded: (active) => { this.state.set('exploded', active); this.explodedManager?.setExploded(active, this.state.get('explodeAmount')); },
      setExplodeAmount: (value) => { this.state.set('explodeAmount', value); this.explodedManager?.setAmount(value); },
      setClearanceThreshold: (value) => {
        this.state.set('clearanceThreshold', value);
        this.updateWarnings(this.sceneManager.modelRoot);
      },
      setCameraPreset: (preset) => { this.state.set('cameraPreset', preset); this.cameraInteraction?.animatePreset(preset); },
      setLighting: (name) => { this.state.set('lighting', name); this.lightingManager?.setPreset(name); },
      loadExample: () => this.loadExample(),
      generateModel: (type, parameters) => this.generateModel(type, parameters),
      clearModel: () => this.clearModel(),
      resetCamera: () => this.resetCamera(),
      hideSelected: () => { this.visibilityManager?.hideSelected(this.selectionManager); this.ui.updateModel(this.sceneManager.modelRoot); },
      showAll: () => { this.visibilityManager?.showAll(); this.ui.updateModel(this.sceneManager.modelRoot); },
      importModel: () => this.ui.openModelPicker(),
      loadModelFiles: (files) => this.loadModelFiles(files),
      exportJSON: () => this.exportJSON(),
      importJSON: () => this.ui.openJSONPicker(),
      importJSONFile: (file) => this.importJSONFile(file),
    };
  }
  loadExample() {
    const member = type => ({
      id: type === 'beam' ? 'V-01' : 'C-01', type, ...DEFAULTS[type],
      rebar: { ...DEFAULTS.rebar }, stirrup: { ...DEFAULTS.stirrup },
    });
    this.generateModel('joint', { beam: member('beam'), column: member('column') });
  }
  generateModel(type, parameters = {}) {
    const element = type === 'joint'
      ? { id: 'J-01', ...parameters, type: 'beam-column-joint' }
      : parameters;
    const validation = validateInput(element);
    if (!validation.valid) {
      this.ui.setStatus(validation.errors.join('. '), 'error');
      return;
    }
    const object = this.sceneManager.buildStructural(type, element);
    this.discardModel();
    this.sceneManager.modelRoot.add(object);
    const fit = this.sceneManager.fitObject(object, this.cameraManager.controls);
    this.cameraManager.fit(fit.radius);
    this.applyRenderMode();
    const names = { beam: 'Viga rectangular', column: 'Columna rectangular', joint: 'Unión viga-columna' };
    this.model = { type, parameters: structuredClone(object.userData.element) };
    this.ui.parameterPanel.setModel(type, this.model.parameters);
    this.state.set({ modelName: names[type] || 'Modelo estructural', exploded: false, visibility: {} });
    this.updateModelInfo(names[type] || 'Modelo estructural');
    this.updateWarnings(this.sceneManager.modelRoot);
    return true;
  }
  updateWarnings(root) {
    if (this.warningMarkers) {
      this.warningMarkers.removeFromParent();
      this.warningMarkers.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
    }
    this.warningMarkers = new THREE.Group();
    this.warningMarkers.name = 'Marcadores de advertencia';
    root.add(this.warningMarkers);
    const thresholdMeters = Number(this.state.get('clearanceThreshold') ?? 25) * 0.001;
    const moved = [];
    root.traverse(object => {
      const original = this.explodedManager.originalPositions.get(object);
      if (original) {
        moved.push([object, object.position.clone()]);
        object.position.copy(original);
      }
    });
    root.updateWorldMatrix(true, true);
    const collisions = new CollisionDetector({ minimumClearance: thresholdMeters }).detectObjectCollisions(
      (() => {
        const objects = [];
        root.traverse((object) => { if (object.isMesh) objects.push(object); });
        return objects;
      })(),
      thresholdMeters,
    );
    moved.forEach(([object, position]) => object.position.copy(position));
    root.updateWorldMatrix(true, true);
    collisions.forEach((collision) => {
      const point = collision.pointA?.clone().add(collision.pointB).multiplyScalar(0.5);
      if (point) {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(collision.type === 'interference' ? 0.018 : 0.014, 12, 8),
          new THREE.MeshBasicMaterial({
            color: collision.type === 'interference' ? 0xd43b3b : 0xe29a32,
            depthTest: false,
          }),
        );
        marker.position.copy(point);
        marker.renderOrder = 20;
        marker.userData.warningMarker = true;
        marker.name = collision.type === 'interference' ? 'Interferencia geométrica' : 'Separación insuficiente';
        this.warningMarkers.add(marker);
      }
    });
    this.ui.setWarnings(collisions, thresholdMeters * 1000, this.cameraInteraction);
    if (collisions.length) {
      this.ui.setStatus(`${collisions.length} posible(s) interferencia(s) geométrica(s) detectada(s)`, 'warning');
    } else {
      this.ui.setStatus('Sin separaciones insuficientes entre barras longitudinales');
    }
  }
  discardModel() {
    this.selectionManager.clear();
    this.xrayManager.reset();
    this.explodedManager.discard();
    this.sceneManager.clearModel();
    this.warningMarkers = null;
  }
  clearModel() {
    this.discardModel();
    this.model = null;
    this.state.set({ modelName: 'Sin modelo', exploded: false, visibility: {} });
    this.updateModelInfo('Sin modelo');
    this.ui.setWarnings([], Number(this.state.get('clearanceThreshold') ?? 25), this.cameraInteraction);
  }
  async loadModelFiles(files) {
    this.ui.setStatus('Cargando modelo…', 'busy');
    try {
      const object = await this.modelLoader.loadFiles(files);
      this.discardModel();
      this.sceneManager.modelRoot.add(object);
      this.model = null;
      const fit = this.sceneManager.fitObject(object, this.cameraManager.controls);
      this.cameraManager.fit(fit.radius);
      this.state.set({ modelName: object.name, exploded: false, visibility: {} });
      this.applyRenderMode();
      this.updateModelInfo(object.name);
      this.ui.setWarnings([], this.state.get('clearanceThreshold'), this.cameraInteraction);
      this.ui.setStatus('Modelo cargado correctamente');
    } catch (error) {
      console.error(error);
      this.ui.setStatus(error.message || 'No se pudo cargar el modelo', 'error');
    }
  }
  setMode(mode) {
    this.state.set('mode', mode);
    this.applyRenderMode();
  }
  applyRenderMode() {
    this.selectionManager.removeHighlight();
    this.xrayManager.setMode(this.state.get('mode'), this.state.get('xrayOpacity'));
    this.selectionManager.highlight(false);
  }
  resetCamera() {
    this.cameraManager.reset();
    this.cameraManager.controls.target.set(0, 0, 0);
  }
  exportJSON() {
    const blob = new Blob([JSON.stringify({ app: 'VisorTécnico', version: 2, state: this.state.get(), model: this.model }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'configuracion-visor.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async importJSONFile(file) {
    try {
      const { model, settings } = parseViewerJSON(JSON.parse(await file.text()));
      if (model && !this.generateModel(model.type, model.parameters)) return;
      this.state.set(settings);
      this.applyRenderMode();
      this.explodedManager.setExploded(this.state.get('exploded'), this.state.get('explodeAmount'));
      this.lightingManager.setPreset(this.state.get('lighting'));
      if (settings.visibility) this.visibilityManager.applySaved();
      if (settings.cameraPreset) this.cameraInteraction.animatePreset(settings.cameraPreset);
      this.updateWarnings(this.sceneManager.modelRoot);
      this.ui.updateModel(this.sceneManager.modelRoot);
      this.ui.setStatus(model ? 'Modelo estructural generado' : 'Configuración restaurada');
    } catch (error) {
      this.ui.setStatus(`JSON inválido: ${error.message}`, 'error');
    }
  }
  updateModelInfo(name) {
    let count = 0;
    this.sceneManager.modelRoot.traverse((object) => { if (object.isMesh) count++; });
    this.ui.setModel(name, count);
    this.ui.updateModel(this.sceneManager.modelRoot);
  }
  bindResize() {
    const viewport = document.querySelector('#viewport');
    this.resizeObserver = new ResizeObserver(() => {
      this.rendererManager.resize();
      this.cameraManager.resize(viewport.clientWidth, viewport.clientHeight);
    });
    this.resizeObserver.observe(viewport);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.cameraManager.update();
    this.rendererManager.render(this.sceneManager.scene, this.cameraManager.camera);
  }
}
