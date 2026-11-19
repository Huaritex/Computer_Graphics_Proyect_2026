export class VisibilityManager {
  constructor(modelRoot, state) {
    this.modelRoot = modelRoot;
    this.state = state;
  }
  setVisible(object, visible) {
    if (!object) return;
    object.visible = visible;
  }
  hideSelected(selection) {
    if (!selection?.selected) return false;
    this.setVisible(selection.selected, false);
    this.state.set('visibility', { ...this.state.get('visibility'), [selection.selected.userData.entity?.id || selection.selected.userData.partId || selection.selected.uuid]: false });
    return true;
  }
  showAll() {
    this.modelRoot.traverse((object) => { object.visible = true; });
    this.state.set('visibility', {});
  }
  applySaved() {
    const visibility = this.state.get('visibility') || {};
    this.modelRoot.traverse((object) => {
      const id = object.userData?.entity?.id || object.userData?.partId || object.uuid;
      if (Object.hasOwn(visibility, id)) object.visible = visibility[id];
    });
  }
}
