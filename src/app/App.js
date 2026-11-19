import * as THREE from 'three';
import { gsap } from 'gsap';
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
    this.cameraManager = new CameraManager(viewport, this.sceneManager.scene);
    this.rendererManager = new RendererManager(viewport);
    this.rendererManager.resize();
    this.cameraManager.resize(viewport.clientWidth, viewport.clientHeight);
    this.lightingManager = new LightingManager(this.sceneManager.scene);
    this.selectionManager = new SelectionManager(viewport, this.sceneManager.scene, this.cameraManager.camera, this.state);
    this.visibilityManager = new VisibilityManager(this.sceneManager.modelRoot, this.state);
    this.xrayManager = new XRayManager(this.sceneManager.modelRoot);
    this.explodedManager = new ExplodedViewManager(this.sceneManager.modelRoot);
    this.cameraInteraction = new CameraInteraction(this.cameraManager);
    this.modelLoader = new ModelLoader(this.resourceManager);
    this.state.subscribe(() => this.ui.updateModel(this.sceneManager.modelRoot));
    this.loadExample();
    this.bindResize();
    this.animate();
  }
  createActions() {
    return {
      setMode: (mode) => this.setMode(mode),
      setXrayOpacity: (value) => { this.state.set('xrayOpacity', value); if (this.state.get('mode') === 'xray') this.xrayManager?.setMode('xray', value); },
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
    const object = this.sceneManager.createStructural('joint');
    const fit = this.sceneManager.fitObject(object, this.cameraManager.controls);
    this.cameraManager.fit(fit.radius);
    this.state.set({ mode: 'solid', modelName: 'Unión viga-columna', exploded: false });
    this.xrayManager?.setMode('solid');
    this.updateModelInfo('Unión viga-columna');
    this.updateWarnings(object);
  }
  generateModel(type, parameters = {}) {
    const element = type === 'joint'
      ? { id: 'J-01', type: 'beam-column-joint', beam: parameters.beam, column: parameters.column }
      : parameters;
    const validation = validateInput(element);
    if (!validation.valid) {
      this.ui.setStatus(validation.errors.join('. '), 'error');
      this.ui.validationPanel?.setValidationErrors?.(validation.errors);
      return;
    }
    const object = this.sceneManager.createStructural(type, parameters);
    const fit = this.sceneManager.fitObject(object, this.cameraManager.controls);
    this.cameraManager.fit(fit.radius);
    this.selectionManager?.clear();
    this.explodedManager?.reset();
    this.xrayManager?.setMode(this.state.get('mode'), this.state.get('xrayOpacity'));
    const names = { beam: 'Viga rectangular', column: 'Columna rectangular', joint: 'Unión viga-columna' };
    this.state.set({ mode: 'solid', modelName: names[type] || 'Modelo estructural', exploded: false });
    this.updateModelInfo(names[type] || 'Modelo estructural');
    this.updateWarnings(object);
  }
  updateWarnings(root) {
    if (this.warningMarkers) {
      root.remove(this.warningMarkers);
      this.warningMarkers.traverse((object) => object.geometry?.dispose?.());
    }
    this.warningMarkers = new THREE.Group();
    this.warningMarkers.name = 'Marcadores de advertencia';
    root.add(this.warningMarkers);
    const thresholdMeters = Number(this.state.get('clearanceThreshold') ?? 25) * 0.001;
    const collisions = new CollisionDetector({ minimumClearance: thresholdMeters }).detectObjectCollisions(
      (() => {
        const objects = [];
        root.traverse((object) => { if (object.isMesh) objects.push(object); });
        return objects;
      })(),
      thresholdMeters,
    );
    collisions.forEach((collision) => {
      collision.objects.forEach((object) => {
        if (object.material && !Array.isArray(object.material)) {
          object.userData.conflictOriginalEmissive = object.material.emissive?.clone();
          object.material.emissive?.set(collision.type === 'interference' ? 0xb22b2b : 0xd18a25);
        }
      });
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
        marker.name = collision.type === 'interference' ? 'Interferencia geométrica' : 'Separación insuficiente';
        this.warningMarkers.add(marker);
      }
    });
    this.ui.setWarnings(collisions, thresholdMeters * 1000, this.cameraInteraction);
    if (collisions.length) {
      this.ui.setStatus(`${collisions.length} posible(s) interferencia(s) geométrica(s) detectada(s)`, 'warning');
    } else {
      this.ui.setStatus('Sin interferencias geométricas cercanas detectadas');
    }
  }
  clearModel() {
    this.selectionManager?.clear();
    this.sceneManager.clearModel();
    this.state.set({ modelName: 'Sin modelo', selectedId: null });
    this.updateModelInfo('Sin modelo');
    this.ui.setWarnings([], Number(this.state.get('clearanceThreshold') ?? 25), this.cameraInteraction);
  }
  async loadModelFiles(files) {
    this.ui.setStatus('Cargando modelo…', 'busy');
    try {
      const object = await this.modelLoader.loadFiles(files);
      this.selectionManager.clear();
      this.sceneManager.clearModel();
      this.sceneManager.modelRoot.add(object);
      const fit = this.sceneManager.fitObject(object, this.cameraManager.controls);
      this.cameraManager.fit(fit.radius);
      this.state.set({ modelName: object.name, selectedId: null, exploded: false });
      this.explodedManager.reset();
      this.xrayManager.setMode(this.state.get('mode'), this.state.get('xrayOpacity'));
      this.updateModelInfo(object.name);
      this.ui.setStatus('Modelo cargado correctamente');
    } catch (error) {
      console.error(error);
      this.ui.setStatus(error.message || 'No se pudo cargar el modelo', 'error');
    }
  }
  setMode(mode) {
    this.state.set('mode', mode);
    this.xrayManager?.setMode(mode, this.state.get('xrayOpacity'));
  }
  resetCamera() {
    this.cameraManager.reset();
    this.cameraManager.controls.target.set(0, 0, 0);
  }
  exportJSON() {
    const blob = new Blob([this.state.snapshot()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'configuracion-visor.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async importJSONFile(file) {
    try {
      this.state.restore(await file.text());
      this.xrayManager?.setMode(this.state.get('mode'), this.state.get('xrayOpacity'));
      this.explodedManager?.setExploded(this.state.get('exploded'), this.state.get('explodeAmount'));
      this.lightingManager?.setPreset(this.state.get('lighting'));
      this.visibilityManager?.applySaved();
      this.ui.setStatus('Configuración restaurada');
    } catch (error) {
      this.ui.setStatus('JSON inválido', 'error');
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
