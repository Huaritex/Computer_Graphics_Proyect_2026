export class PropertiesPanel {
  constructor(state) { this.state = state; }
  render(container) {
    container.innerHTML = `
      <div class="panel-heading"><span>Propiedades</span><button class="icon-button" id="show-all" title="Mostrar todo" aria-label="Mostrar todos los componentes">◉</button></div>
      <div class="panel-scroll">
        <section class="control-section"><h3>Objeto seleccionado</h3><div id="selection-info" class="selection-info">Sin selección</div></section>
        <section class="control-section"><h3>Interferencias y separación</h3><div id="interference-list" class="interference-list"><p class="muted">Sin análisis disponible</p></div></section>
        <section class="control-section"><h3>Jerarquía del modelo</h3><div id="scene-tree" class="scene-tree"></div></section>
      </div>`;
  }
  update(modelRoot) {
    const tree = document.querySelector('#scene-tree');
    if (!tree) return;
    const selectedId = this.state.get('selectedId');
    const selectionInfo = document.querySelector('#selection-info');
    const nodes = [];
    modelRoot.traverse((object) => {
      if (!object.parent || (!object.isMesh && object.type !== 'Group')) return;
      const id = object.userData.entity?.id || object.userData.partId || object.name || object.uuid;
      const depth = this.depth(object);
      nodes.push(`<button class="tree-node ${selectedId === id ? 'active' : ''}" data-node="${object.uuid}" style="padding-left:${8 + depth * 10}px">
        <span class="${object.visible ? 'dot-on' : 'dot-off'}"></span>${object.name || (object.isMesh ? 'Pieza' : 'Grupo')}
      </button>`);
    });
    tree.innerHTML = nodes.join('') || '<p class="muted">No hay modelo cargado</p>';
    const selected = this.findById(modelRoot, selectedId);
    if (selectionInfo) {
      if (selected) {
        const entity = selected.userData.entity;
        selectionInfo.innerHTML = entity
          ? `<strong>${entity.id}</strong><span>Elemento: ${entity.elementId}</span><span>Tipo: ${entity.kind}</span><span>Diámetro: ${entity.diameter ? `${entity.diameter} mm` : 'No aplica'}</span><span>Cantidad asociada: ${entity.count}</span><span>Longitud: ${entity.length ? `${Number(entity.length).toFixed(1)} mm` : 'No calculada'}</span><span>Visible: ${selected.visible ? 'Sí' : 'No'}</span>`
          : `<strong>${selected.name || 'Pieza'}</strong><span>Tipo: ${selected.type}</span><span>Visible: ${selected.visible ? 'Sí' : 'No'}</span>`;
      } else {
        selectionInfo.textContent = 'Sin selección';
      }
    }
  }
  depth(object) { let d = 0; while (object.parent && object.parent.type !== 'Scene') { d++; object = object.parent; } return d; }
  updateWarnings(collisions, threshold, cameraInteraction) {
    const container = document.querySelector('#interference-list');
    if (!container) return;
    if (!collisions.length) {
      container.innerHTML = `<p class="muted">Sin interferencias ni separaciones bajo ${threshold.toFixed(0)} mm.</p>`;
      return;
    }
    container.innerHTML = collisions.slice(0, 30).map((collision, index) => {
      const entityA = collision.objects[0].userData.entity;
      const entityB = collision.objects[1].userData.entity;
      const label = collision.type === 'interference'
        ? 'Interferencia geométrica'
        : 'Separación insuficiente';
      const freeDistance = collision.distance * 1000;
      const point = collision.pointA;
      const location = point
        ? `x ${point.x.toFixed(2)}, y ${point.y.toFixed(2)}, z ${point.z.toFixed(2)}`
        : 'Ubicación no disponible';
      return `<article class="warning-card ${collision.type}" data-warning="${index}">
        <div><strong>${label}</strong><span>${freeDistance.toFixed(1)} mm libres</span></div>
        <p>${entityA?.id || 'Barra A'} ↔ ${entityB?.id || 'Barra B'}</p>
        <p class="warning-location">Ubicación aprox.: ${location}</p>
        <button type="button" data-focus="${index}">Enfocar región</button>
      </article>`;
    }).join('');
    container.querySelectorAll('[data-focus]').forEach((button) => {
      button.addEventListener('click', () => {
        const collision = collisions[Number(button.dataset.focus)];
        const point = collision.pointA?.clone().add(collision.pointB).multiplyScalar(0.5);
        if (point && cameraInteraction?.focusPoint) cameraInteraction.focusPoint(point);
      });
    });
  }
  findById(root, id) {
    let found = null;
    root.traverse((object) => { if (!found && (object.userData.entity?.id || object.userData.partId || object.name || object.uuid) === id) found = object; });
    return found;
  }
}
