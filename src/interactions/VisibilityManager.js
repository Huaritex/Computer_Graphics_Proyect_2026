export class VisibilityManager {
  constructor(modelRoot, state) {
    this.modelRoot = modelRoot;
    this.state = state;
    this.originalVisibility = new WeakMap();
  }
  getId(object) { return object.userData.entity?.id || object.userData.element?.id || object.userData.partId || object.uuid; }
  setVisible(object, visible) {
    if (!object) return;
    if (!this.originalVisibility.has(object)) this.originalVisibility.set(object, object.visible);
    object.visible = visible;
  }
  hideSelected(selection) {
    if (!selection?.selected) return false;
    this.setVisible(selection.selected, false);
    this.state.set('visibility', { ...this.state.get('visibility'), [this.getId(selection.selected)]: false });
    return true;
  }
  showAll() {
    this.modelRoot.traverse((object) => this.setVisible(object, true));
    this.state.set('visibility', {});
  }
  applySaved() {
    const visibility = this.state.get('visibility') || {};
    this.modelRoot.traverse((object) => {
      const id = this.getId(object);
      if (Object.hasOwn(visibility, id)) this.setVisible(object, visibility[id]);
      else if (Object.hasOwn(visibility, object.uuid)) this.setVisible(object, visibility[object.uuid]);
      else if (this.originalVisibility.has(object)) object.visible = this.originalVisibility.get(object);
    });
  }
}
