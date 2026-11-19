import * as THREE from 'three';
import ParameterProcessor from '../structural/ParameterProcessor.js';
import ConcreteFactory from './ConcreteFactory.js';
import RebarFactory from './RebarFactory.js';
import StirrupFactory from './StirrupFactory.js';

export class ColumnGenerator {
  constructor() {
    this.processor = new ParameterProcessor();
    this.concrete = new ConcreteFactory();
    this.rebar = new RebarFactory();
    this.stirrups = new StirrupFactory();
  }

  generate(input = {}) {
    const data = this.processor.process({ type: 'column', ...input });
    const group = new THREE.Group();
    group.name = data.id || 'column';
    group.userData.element = data;
    group.add(this.concrete.createColumn(data));
    group.add(this.rebar.createColumnBars(data));
    group.add(this.stirrups.createColumnStirrups(data));
    return group;
  }

  build(input) { return this.generate(input); }
  create(input) { return this.generate(input); }
}

export default ColumnGenerator;
