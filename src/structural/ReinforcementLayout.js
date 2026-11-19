import * as THREE from 'three';
import { MM_TO_M } from '../config/constants.js';

export class ReinforcementLayout {
  rectangularPositions(width, depth, cover, diameter, count) {
    const w = width * MM_TO_M;
    const d = depth * MM_TO_M;
    const inset = (cover + diameter / 2) * MM_TO_M;
    const usableW = Math.max(0, w - 2 * inset);
    const usableD = Math.max(0, d - 2 * inset);
    const positions = [];
    const corners = [
      [-usableW / 2, -usableD / 2],
      [usableW / 2, -usableD / 2],
      [usableW / 2, usableD / 2],
      [-usableW / 2, usableD / 2],
    ];
    for (let i = 0; i < count; i++) {
      if (i < 4) positions.push(new THREE.Vector3(corners[i][0], corners[i][1], 0));
      else {
        const t = (i - 3) / Math.max(1, count - 3);
        positions.push(new THREE.Vector3(-usableW / 2 + usableW * t, usableD / 2, 0));
      }
    }
    return positions;
  }

  beamBars(width, depth, cover, diameter, topCount, bottomCount) {
    const sideInset = (cover + diameter / 2) * MM_TO_M;
    const maxZ = (depth / 2 - cover - diameter / 2) * MM_TO_M;
    const minZ = -maxZ;
    const bars = [];
    for (const [z, count] of [[maxZ, topCount], [minZ, bottomCount]]) {
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        bars.push(new THREE.Vector3((width * MM_TO_M) * (t - 0.5) + sideInset * (0.5 - t), z, 0));
      }
    }
    return bars;
  }

  getStirrupPositions(length, spacing) {
    const count = Math.max(1, Math.ceil(length / spacing));
    return Array.from({ length: count }, (_, i) => i * spacing * MM_TO_M);
  }
}

export default ReinforcementLayout;
