import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { DEFAULTS } from '../../src/config/defaults.js';
import { BeamGenerator } from '../../src/geometry/BeamGenerator.js';
import { ColumnGenerator } from '../../src/geometry/ColumnGenerator.js';
import { XRayManager } from '../../src/interactions/XRayManager.js';
import { PropertiesPanel } from '../../src/ui/PropertiesPanel.js';
import { validateInput } from '../../src/data/validators/inputValidator.js';

describe('geometría estructural e inspección', () => {
  const panel = new PropertiesPanel();
  const beam = new BeamGenerator().generate({ id: 'V-01' });
  const column = new ColumnGenerator().generate({ id: 'C-01' });
  const describePiece = (owner, name) => Object.fromEntries(
    panel.describe(owner, owner.getObjectByName(name)).sections.flatMap(section => section.rows),
  );

  it('presenta unidades, material y conteos propios de cada elemento', () => {
    expect(describePiece(beam, 'V-01-concrete')).toMatchObject({
      'Luz / longitud L': '4000 mm', 'Longitud de pieza': '4000 mm',
      'Material / función': 'Hormigón', 'Barras superiores': '3', 'Barras inferiores': '3',
      'Total longitudinal': '6 barras',
    });
    expect(describePiece(beam, 'V-01-concrete')).not.toHaveProperty('Barras longitudinales');
    expect(describePiece(column, 'C-01-concrete')).toMatchObject({
      'Altura H': '3000 mm', 'Longitud de pieza': '3000 mm', 'Barras longitudinales': '4',
    });
    expect(describePiece(column, 'C-01-concrete')).not.toHaveProperty('Barras superiores');
    expect(describePiece(beam, 'V-01-top-1')).toMatchObject({
      'Pieza seleccionada': 'V-01-top-1', 'Material / función': 'Barra longitudinal',
      'Diámetro': 'Ø16 mm', 'Longitud de pieza': '3920 mm',
    });
    expect(describePiece(beam, 'V-01-stirrup-1')).toMatchObject({
      'Material / función': 'Estribo', 'Diámetro': 'Ø10 mm', 'Longitud de pieza': '1240 mm',
    });
    const bar = beam.getObjectByName('V-01-top-1');
    const stirrup = beam.getObjectByName('V-01-stirrup-1');
    expect(bar.geometry.parameters.height * 1000).toBeCloseTo(bar.userData.entity.length);
    expect(stirrup.geometry.parameters.path.getLength() * 1000).toBeCloseTo(stirrup.userData.entity.length);
  });

  it('distribuye barras adicionales sin duplicar esquinas ni superar el perímetro interior', () => {
    const input = { id: 'C-01', type: 'column', ...DEFAULTS.column, width: 320, rebar: { longitudinalCount: 11 } };
    expect(validateInput(input).valid).toBe(true);
    const generator = new ColumnGenerator();
    const positions = model => model.children[1].children.map(bar => bar.position.toArray());
    const bars = positions(generator.generate(input));
    const corners = positions(generator.generate({ ...input, rebar: { longitudinalCount: 4 } }));
    expect(bars.slice(0, 4)).toEqual(corners);
    expect(bars).toEqual(positions(generator.generate(input)));
    expect(new Set(bars.map(position => position.join(','))).size).toBe(11);
    const [xLimit, , zLimit] = corners[2];
    for (const [x, , z] of bars) {
      expect(Math.abs(x)).toBeLessThanOrEqual(xLimit);
      expect(Math.abs(z)).toBeLessThanOrEqual(zLimit);
      expect(Math.abs(x) === xLimit || Math.abs(z) === zLimit).toBe(true);
    }
    expect(validateInput({ ...input, rebar: { longitudinalCount: 98 } }).errors.join(' ')).toContain('longitudinalCount no cabe');
    expect(validateInput({ id: 'V-01', type: 'beam', ...DEFAULTS.beam, rebar: { topCount: 2.5 } }).valid).toBe(false);
  });

  it('aísla el X-Ray cuando el concreto y el acero comparten un material', () => {
    const root = new THREE.Group();
    const shared = new THREE.MeshStandardMaterial();
    const concrete = new THREE.Mesh(new THREE.BoxGeometry(), shared);
    const steel = new THREE.Mesh(concrete.geometry, shared);
    concrete.userData.entity = { kind: 'concrete' };
    steel.userData.entity = { kind: 'rebar' };
    root.add(concrete, steel);
    const manager = new XRayManager(root);
    manager.setMode('xray', 35);
    expect(concrete.material).toMatchObject({ transparent: true, opacity: 0.35, depthWrite: false });
    expect(steel.material).toMatchObject({ transparent: false, opacity: 1, depthWrite: true });
    manager.setMode('wireframe');
    expect(concrete.material).toMatchObject({ wireframe: true, opacity: 1, depthWrite: true });
    expect(steel.material.wireframe).toBe(true);
    manager.setMode('solid');
    expect(concrete.material).toBe(shared);
    expect(steel.material).toBe(shared);
  });
});
