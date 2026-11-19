import * as THREE from 'three';
import ParameterProcessor from '../structural/ParameterProcessor.js';
import BeamGenerator from './BeamGenerator.js';
import ColumnGenerator from './ColumnGenerator.js';
import { mmToScene } from './GeometryUtils.js';

export class JointGenerator {
  constructor() {
    this.processor = new ParameterProcessor();
    this.beamGenerator = new BeamGenerator();
    this.columnGenerator = new ColumnGenerator();
  }

  generate(input = {}) {
    const data = this.processor.processJoint({
      id: input.id,
      type: 'beam-column-joint',
      beam: input.beam || {},
      column: input.column || {},
    });
    const group = new THREE.Group();
    group.name = data.id || 'beam-column-joint';
    group.userData.element = data;

    const column = this.columnGenerator.generate({ id: `${data.id}-column`, ...data.column });
    const beam = this.beamGenerator.generate({ id: `${data.id}-beam`, ...data.beam });
    beam.position.set(0, mmToScene(data.column.height / 2), 0);
    group.add(column);
    group.add(beam);
    return group;
  }

  build(input) { return this.generate(input); }
  create(input) { return this.generate(input); }
}

export default JointGenerator;
