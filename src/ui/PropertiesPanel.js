const escapeHTML = (value) => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

export class PropertiesPanel {
  constructor(state) { this.state = state; }
  render(container) {
    container.innerHTML = `
      <div class="panel-heading"><span>Propiedades</span><button class="icon-button" id="show-all" title="Mostrar todo" aria-label="Mostrar todos los componentes">◉</button></div>
      <div class="panel-scroll">
        <section class="control-section"><h3>Interferencias y separación</h3><div id="interference-list" class="interference-list"><p class="muted">Sin análisis disponible</p></div></section>
        <section class="control-section"><h3>Jerarquía del modelo</h3><div id="scene-tree" class="scene-tree"></div></section>
      </div>`;
  }
  update(modelRoot) {
    const tree = document.querySelector('#scene-tree');
    if (!tree) return;
    const selectedId = this.state.get('selectedId');
    const selectedObjectId = this.state.get('selectedObjectId');
    const nodes = [];
    modelRoot.traverse((object) => {
      if (!object.parent || (!object.isMesh && object.type !== 'Group')) return;
      const id = object.userData.entity?.id || object.userData.partId || object.name || object.uuid;
      const depth = this.depth(object);
      nodes.push(`<button class="tree-node ${selectedId === id || selectedObjectId === object.uuid ? 'active' : ''}" data-node="${object.uuid}" style="padding-left:${8 + depth * 10}px">
        <span class="${object.visible ? 'dot-on' : 'dot-off'}"></span>${escapeHTML(object.name || (object.isMesh ? 'Pieza' : 'Grupo'))}
      </button>`);
    });
    tree.innerHTML = nodes.join('') || '<p class="muted">No hay modelo cargado</p>';
    this.bindTreeNodes(modelRoot);
    this.renderInspector(modelRoot);
  }
  bindTreeNodes(modelRoot) {
    document.querySelectorAll('[data-node]').forEach((button) => {
      button.addEventListener('click', () => {
        const object = modelRoot.getObjectByProperty('uuid', button.dataset.node);
        if (object) this.state.set({ selectedId: object.userData.element?.id || object.userData.entity?.elementId || object.userData.entity?.id || object.name, selectedObjectId: object.uuid });
      });
    });
  }
  renderInspector(modelRoot) {
    const id = this.state.get('selectedObjectId');
    let card = document.querySelector('.object-inspector');
    const selected = id ? modelRoot.getObjectByProperty('uuid', id) : null;
    if (!selected) { card?.remove(); return; }
    const owner = this.findOwner(selected, modelRoot);
    if (!card) {
      card = document.createElement('section');
      card.className = 'object-inspector';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-label', 'Detalles del elemento estructural');
      document.querySelector('#viewport')?.append(card);
    }
    const details = this.describe(owner, selected);
    card.innerHTML = `<header class="inspector-header"><div><span class="inspector-kicker">INSPECCIÓN ESTRUCTURAL</span><h2>${escapeHTML(details.title)}</h2><p>${escapeHTML(details.subtitle)}</p></div><button type="button" class="inspector-close" aria-label="Cerrar detalles">×</button></header>
      <div class="inspector-body"><div class="inspector-summary"><span><small>Identificador</small><strong>${escapeHTML(details.id)}</strong></span><span><small>Tipo</small><strong>${escapeHTML(details.kind)}</strong></span></div>
      ${details.sections.map(section => `<section class="inspector-section"><h3>${escapeHTML(section.title)}</h3><dl>${section.rows.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl></section>`).join('')}</div>`;
    card.querySelector('.inspector-close')?.addEventListener('click', () => this.state.set({ selectedId: null, selectedObjectId: null }));
  }
  findOwner(object, root) {
    let current = object;
    while (current && current !== root) {
      if (current.userData?.element) return current;
      current = current.parent;
    }
    return object;
  }
  describe(owner, selected) {
    const element = owner.userData?.element;
    const entity = selected.userData?.entity || {};
    const isJoint = element?.type === 'beam-column-joint';
    const kindLabels = { concrete: 'Hormigón', rebar: 'Barra longitudinal', stirrup: 'Estribo' };
    const title = element?.id || entity.elementId || selected.name || 'Elemento';
    const sections = [];
    const addDimensions = (member, label) => {
      if (!member) return;
      const rows = [];
      if (member.width != null) rows.push(['Ancho b', `${member.width} mm`]);
      if (member.depth != null) rows.push(['Canto / profundidad h', `${member.depth} mm`]);
      if (member.length != null) rows.push(['Luz / longitud L', `${member.length} mm`]);
      if (member.height != null) rows.push(['Altura H', `${member.height} mm`]);
      if (member.cover != null) rows.push(['Recubrimiento nominal', `${member.cover} mm`]);
      if (rows.length) sections.push({ title: label, rows });
    };
    const addReinforcement = (member, label) => {
      if (!member?.rebar && !member?.stirrup) return;
      const longitudinal = member.rebar || {};
      const transverse = member.stirrup || {};
      const rows = [];
      if (longitudinal.diameter != null) rows.push(['Diámetro longitudinal', `Ø${longitudinal.diameter} mm`]);
      if (longitudinal.topCount != null || longitudinal.bottomCount != null) {
        rows.push(['Barras superiores', `${longitudinal.topCount ?? 0}`]);
        rows.push(['Barras inferiores', `${longitudinal.bottomCount ?? 0}`]);
        rows.push(['Total longitudinal', `${Number(longitudinal.topCount ?? 0) + Number(longitudinal.bottomCount ?? 0)} barras`]);
      }
      if (longitudinal.longitudinalCount != null) rows.push(['Barras longitudinales', `${longitudinal.longitudinalCount}`]);
      if (transverse.diameter != null) rows.push(['Diámetro de estribo', `Ø${transverse.diameter} mm`]);
      if (transverse.spacing != null) rows.push(['Separación de estribos', `${transverse.spacing} mm`]);
      if (rows.length) sections.push({ title: label, rows });
    };
    if (isJoint) {
      addDimensions(element.column, 'Columna'); addReinforcement(element.column, 'Armadura de columna');
      addDimensions(element.beam, 'Viga'); addReinforcement(element.beam, 'Armadura de viga');
    } else if (element && ['beam', 'column'].includes(element.type)) {
      addDimensions(element, element.type === 'beam' ? 'Geometría de viga' : 'Geometría de columna');
      addReinforcement(element, 'Armadura');
    }
    const instanceRows = [
      ['Pieza seleccionada', selected.name || selected.type],
      ['Material / función', kindLabels[entity.kind] || selected.type],
      ['Diámetro', entity.diameter != null ? `Ø${entity.diameter} mm` : 'No aplica'],
      ['Longitud de pieza', Number.isFinite(entity.length) ? `${Number(entity.length).toFixed(0)} mm` : 'No disponible'],
      ['Estado', selected.visible ? 'Visible' : 'Oculto'],
    ];
    if (!isJoint && !element?.type) instanceRows.push(['Geometría', 'Modelo importado; los parámetros estructurales no están disponibles']);
    sections.push({ title: 'Pieza seleccionada', rows: instanceRows });
    return { title, id: entity.id || element?.id || selected.name || '—', kind: isJoint ? 'Unión viga-columna' : (element?.type === 'beam' ? 'Viga' : element?.type === 'column' ? 'Columna' : kindLabels[entity.kind] || selected.type), subtitle: isJoint ? 'Conjunto estructural · dimensiones en mm' : `${entity.elementId || title} · dimensiones en mm`, sections };
  }
  depth(object) { let d = 0; while (object.parent && object.parent.type !== 'Scene') { d++; object = object.parent; } return d; }
  updateWarnings(collisions, threshold, cameraInteraction) {
    const container = document.querySelector('#interference-list');
    if (!container) return;
    if (!collisions.length) {
      container.innerHTML = `<p class="muted">Sin separaciones entre barras longitudinales bajo ${threshold.toFixed(0)} mm.</p>`;
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
        <p>${escapeHTML(entityA?.id || 'Barra A')} ↔ ${escapeHTML(entityB?.id || 'Barra B')}</p>
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
