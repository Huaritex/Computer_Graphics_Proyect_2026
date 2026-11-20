import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const bundlePath = process.argv[2];
if (!bundlePath) throw new Error('Indica la ruta de spector.bundle.js');
const bundle = await readFile(bundlePath, 'utf8');
const reportOutput = process.argv[3];
const output = reportOutput ?? fileURLToPath(new URL('./evidence/spector/', import.meta.url));
const baseURL = 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => console.error(error.message));
  await page.route(`${baseURL}/spector-for-capture.js`, route => route.fulfill({
    contentType: 'application/javascript',
    body: bundle + '\nwindow.spector = new SPECTOR.Spector(); window.spector.spyCanvases();',
  }));
  await page.route(`${baseURL}/`, async route => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({
      response,
      body: html.replace('<div id="app"></div>', '<div id="app"></div><script src="/spector-for-capture.js"></script>'),
    });
  });
  await page.route(/\/src\/main\.js(?:\?|$)/, async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + '\nwindow.viewerApp = app;' });
  });
  await page.goto(baseURL);
  await page.waitForFunction(() => window.viewerApp && window.spector);
  await page.evaluate(() => {
    window.viewerApp.sceneManager.modelRoot.traverse(mesh => {
      if (!mesh.userData.entity) return;
      mesh.onBeforeRender = () => window.spector.setMarker(mesh.userData.entity.id);
      mesh.onAfterRender = () => window.spector.clearMarker();
    });
  });

  await mkdir(output, { recursive: true });
  const results = [];
  for (const [fileName, mode] of [['solido', 'solid'], ['xray', 'xray']]) {
    await page.locator(`[data-mode=${mode}]`).click();
    await page.evaluate(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));
    const { capture, scene } = await page.evaluate(() => new Promise((resolve, reject) => {
      const app = window.viewerApp;
      const canvas = app.rendererManager.renderer.domElement;
      const scene = {
        browser: navigator.userAgent,
        viewport: [innerWidth, innerHeight],
        canvas: [canvas.width, canvas.height],
        cameraPosition: app.cameraManager.camera.position.toArray(),
        cameraTarget: app.cameraManager.controls.target.toArray(),
        objects: document.querySelector('#object-count').textContent,
        mode: app.state.get('mode'),
        xrayOpacity: app.state.get('xrayOpacity'),
        exploded: app.state.get('exploded'),
        lighting: app.state.get('lighting'),
        selectedId: app.state.get('selectedId'),
        visibility: app.state.get('visibility'),
        model: app.model.type,
      };
      const timer = setTimeout(() => reject(new Error('La captura excedió 45 s')), 45_000);
      const listener = window.spector.onCapture.add(capture => {
        clearTimeout(timer);
        window.spector.onCapture.remove(listener);
        resolve({ capture, scene });
      });
      window.spector.captureCanvas(canvas);
    }));
    const draws = capture.commands.filter(command => /^draw(?:Arrays|Elements|RangeElements)/.test(command.name));
    const piece = draws.find(command => command.marker === 'V-01-concrete');
    if (!piece) throw new Error('Spector.js no identificó V-01-concrete');
    results.push({
      file: `${fileName}.json.gz`, scene, draws: draws.length,
      drawCommands: draws.reduce((counts, { name }) => {
        counts[name] = (counts[name] ?? 0) + 1;
        return counts;
      }, {}),
      analyses: capture.analyses,
      piece: { id: piece.id, marker: piece.marker, name: piece.name, arguments: piece.commandArguments },
    });
    await writeFile(join(output, `${fileName}.json.gz`), gzipSync(JSON.stringify(capture)));
    if (reportOutput) {
      await page.locator('#viewport canvas').screenshot({ path: join(output, `${fileName}.png`) });
      const attachment = capture.endState.VisualState.Attachments.find(item => item.attachmentName === 'Canvas COLOR_ATTACHMENT');
      const encoded = attachment?.src.match(/^data:image\/png;base64,(.+)$/)?.[1];
      if (!encoded) throw new Error(`Falta la imagen capturada por Spector.js en ${fileName}`);
      await writeFile(join(output, `${fileName}-fotograma.png`), Buffer.from(encoded, 'base64'));
    }
  }
  const summary = JSON.stringify(results, null, 2);
  await writeFile(join(output, 'resumen.json'), summary + '\n');
  console.log(summary);
} finally {
  await browser.close();
}
