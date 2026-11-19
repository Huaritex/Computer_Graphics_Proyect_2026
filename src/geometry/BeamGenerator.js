import * as THREE from 'three';
import ParameterProcessor from '../structural/ParameterProcessor.js';
import ConcreteFactory from './ConcreteFactory.js';
import RebarFactory from './RebarFactory.js';
import StirrupFactory from './StirrupFactory.js';

export class BeamGenerator {
  constructor() {
    this.processor = new ParameterProcessor();
    this.concrete = new ConcreteFactory();
    this.rebar = new RebarFactory();
    this.stirrups = new StirrupFactory();
  }

  generate(input = {}) {
    const data = this.processor.process({ type: 'beam', ...input });
    const group = new THREE.Group();
    group.name = data.id || 'beam';
    group.userData.element = data;
    group.add(this.concrete.createBeam(data));
    group.add(this.rebar.createBeamBars(data));
    group.add(this.stirrups.createBeamStirrups(data));
    return group;
  }

  build(input) { return this.generate(input); }
  create(input) { return this.generate(input); }
}

export default BeamGenerator;
