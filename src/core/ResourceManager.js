export class ResourceManager {
  constructor() { this.urls = new Set(); }
  track(url) { if (url?.startsWith('blob:')) this.urls.add(url); return url; }
  releaseAll() {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
