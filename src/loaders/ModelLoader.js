import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoader {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;
  }
  async loadFiles(files) {
    const list = Array.from(files || []);
    const primary = list.find((file) => /\.glb$/i.test(file.name))
      || list.find((file) => /\.gltf$/i.test(file.name));
    if (!primary) throw new Error('Seleccione un archivo .glb o .gltf');
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    const urls = new Map();
    list.forEach((file) => {
      const url = URL.createObjectURL(file);
      this.resourceManager.track(url);
      urls.set(file.name, url);
      urls.set(file.name.replace(/^.*[\\/]/, ''), url);
    });
    manager.setURLModifier((resource) => {
      if (typeof resource !== 'string') return resource;
      return urls.get(resource) || urls.get(resource.replace(/^.*[\\/]/, '')) || resource;
    });
    let result;
    if (/\.glb$/i.test(primary.name)) {
      const buffer = await primary.arrayBuffer();
      result = await loader.parseAsync(buffer, '');
    } else {
      const text = await primary.text();
      const json = JSON.parse(text);
      result = await loader.parseAsync(json, '');
    }
    const object = result.scene || result.scenes?.[0];
    if (!object) throw new Error('El modelo no contiene una escena');
    object.name = primary.name.replace(/\.[^.]+$/, '');
    object.userData.sourceFile = primary.name;
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.userData.partId) child.userData.partId = child.name || child.uuid;
      }
    });
    return object;
  }
  async loadUrl(url) {
    const loader = new GLTFLoader();
    const result = await loader.loadAsync(url);
    return result.scene;
  }
}
