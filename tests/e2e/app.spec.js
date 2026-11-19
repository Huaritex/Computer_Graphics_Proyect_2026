import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe('Visualizador paramétrico', () => {
  test('carga y permite las operaciones principales', async ({ page }, testInfo) => {
    const jsErrors = [];
    page.on('pageerror', (error) => jsErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') jsErrors.push(message.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle('Visualizador Paramétrico 3D');
    await expect(page.locator('h1')).toHaveText('Visualizador Paramétrico 3D');

    const canvas = page.locator('#viewport canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('#left-panel')).toContainText('Parámetros');
    await expect(page.locator('#right-panel')).toContainText('Propiedades');
    await expect(page.locator('#validation-panel')).toBeVisible();

    await page.getByRole('button', { name: 'X-Ray' }).click();
    await expect(page.getByRole('button', { name: 'X-Ray' })).toHaveClass(/active/);

    await page.locator('#exploded-toggle').check();
    await expect(page.locator('#exploded-toggle')).toBeChecked();

    await page.locator('#element-type').selectOption('column');
    await page.locator('#generate-button').click();
    await expect(page.locator('#model-name')).toHaveText('Columna rectangular');

    await page.locator('#element-type').selectOption('beam');
    await page.locator('#generate-button').click();
    await expect(page.locator('#model-name')).toHaveText('Viga rectangular');

    await page.locator('#element-type').selectOption('joint');
    await page.locator('#generate-button').click();
    await expect(page.locator('#model-name')).toHaveText('Unión viga-columna');

    await page.locator('#clearance-threshold').evaluate((input) => {
      input.value = '40';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('#clearance-output')).toHaveText('40 mm');
    await page.locator('#left-panel .panel-scroll').evaluate((panel) => {
      panel.scrollTop = 0;
    });

    await page.screenshot({
      path: testInfo.outputPath('desktop.png'),
      fullPage: true,
    });

    expect(jsErrors, `Errores JS: ${jsErrors.join(' | ')}`).toEqual([]);
  });

  test('mantiene el visor usable en móvil y genera captura', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#viewport canvas')).toBeVisible();
    await expect(page.locator('#left-panel')).not.toHaveClass(/mobile-open/);
    await page.locator('#mobile-panel-toggle').click();
    await expect(page.locator('#left-panel')).toHaveClass(/mobile-open/);
    await page.locator('#mobile-panel-toggle').click();
    await expect(page.locator('#left-panel')).not.toHaveClass(/mobile-open/);
    await page.screenshot({
      path: testInfo.outputPath('mobile.png'),
      fullPage: true,
    });
  });
});

test('conserva los parámetros y el análisis al guardar y restaurar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#beam-width')).toHaveValue('300');
  await expect(page.locator('#column-width')).toHaveValue('400');
  await page.locator('#beam-width').fill('320');
  await page.locator('#column-width').fill('450');
  await page.locator('#beam-top-count').fill('5');
  await page.locator('#beam-bottom-count').fill('4');
  await page.locator('#column-longitudinal-count').fill('8');
  await page.locator('#generate-button').click();
  await expect(page.locator('#model-name')).toHaveText('Unión viga-columna');
  const before = await page.locator('#interference-list').innerText();
  await page.locator('#exploded-toggle').check();
  await page.locator('#clearance-threshold').evaluate(input => input.dispatchEvent(new Event('input', { bubbles: true })));
  expect(await page.locator('#interference-list').innerText()).toBe(before);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-json').click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.locator('#beam-width').fill('380');
  await page.locator('#generate-button').click();
  await page.locator('#json-file-input').setInputFiles(path);
  await expect(page.locator('#beam-width')).toHaveValue('320');
  await expect(page.locator('#column-width')).toHaveValue('450');
  await expect(page.locator('#beam-top-count')).toHaveValue('5');
  await expect(page.locator('#beam-bottom-count')).toHaveValue('4');
  await expect(page.locator('#column-longitudinal-count')).toHaveValue('8');
  await expect(page.locator('#exploded-toggle')).toBeChecked();
  await expect(page.locator('#validation-text')).toHaveText('Modelo estructural generado');
});

test('rechaza un paso de estribos vacío sin reemplazar el modelo', async ({ page }) => {
  await page.goto('/');
  await page.locator('#beam-spacing').fill('');
  await page.locator('#generate-button').click();
  await expect(page.locator('#validation-text')).toContainText('separación de estribos');
  await expect(page.locator('#model-name')).toHaveText('Unión viga-columna');
  await page.locator('#beam-spacing').fill('150');
  await page.locator('#beam-top-count').fill('2.5');
  await page.locator('#generate-button').click();
  await expect(page.locator('#validation-text')).toContainText('topCount debe ser un entero');
  await expect(page.locator('#object-count')).toHaveText('59 objetos');
});

test('importa JSON directo y mantiene intacta la escena ante un archivo inválido', async ({ page }) => {
  await page.goto('/');
  const status = page.locator('#validation-text');
  const importer = page.locator('#json-file-input');
  const upload = data => importer.setInputFiles({
    name: 'modelo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)),
  });
  await importer.setInputFiles('public/models/union-demostracion.json');
  await expect(status).toHaveText('Modelo estructural generado');
  await expect(page.locator('#beam-top-count')).toHaveValue('4');
  await expect(page.locator('#column-longitudinal-count')).toHaveValue('8');

  await page.getByRole('button', { name: 'X-Ray', exact: true }).click();
  const model = { type: 'beam', id: 'V-02', width: 360, depth: 500, length: 4200 };
  await upload({
    state: { mode: 'solid', xrayOpacity: 75 },
    model: { type: 'beam', parameters: { ...model, rebar: { topCount: 20 } } },
  });
  await expect(status).toContainText('topCount no cabe');
  await expect(page.locator('[data-mode=xray]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#xray-opacity')).toHaveValue('35');
  await expect(page.locator('#beam-width')).toHaveValue('320');
  await expect(page.getByRole('button', { name: 'J-DEMO', exact: true })).toBeVisible();

  await upload({ state: { mode: 'solid', xrayOpacity: 101 }, model: { type: 'beam', parameters: model } });
  await expect(status).toContainText('xrayOpacity');
  await expect(page.locator('[data-mode=xray]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'J-DEMO', exact: true })).toBeVisible();

  await upload(model);
  await expect(page.locator('#model-name')).toHaveText('Viga rectangular');
  await expect(page.locator('#beam-top-count')).toHaveValue('3');
  await expect(page.locator('#beam-length')).toHaveValue('4200');
  await upload({ type: 'column', id: 'C-02', width: 400, depth: 450, height: 3200 });
  await expect(page.locator('#model-name')).toHaveText('Columna rectangular');
  await expect(page.locator('#column-longitudinal-count')).toHaveValue('4');
  await upload({ state: { mode: 'wireframe', xrayOpacity: 55 }, model: null });
  await expect(status).toHaveText('Configuración restaurada');
  await expect(page.locator('[data-mode=wireframe]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'C-02', exact: true })).toBeVisible();
});

test('inspecciona y alterna la visibilidad de piezas desde la jerarquía', async ({ page }) => {
  await page.goto('/');
  const part = page.getByRole('button', { name: 'V-01-concrete', exact: true });
  const card = page.getByRole('dialog');
  const row = label => card.locator('dl > div').filter({ has: page.getByText(label, { exact: true }) });
  await expect(page.locator('#object-count')).toHaveText('59 objetos');
  await part.click();
  await expect(row('Longitud de pieza')).toContainText('4000 mm');
  await expect(row('Barras longitudinales')).toHaveCount(0);
  await page.locator('#hide-selected').click();
  await expect(row('Estado')).toContainText('Oculto');
  await page.locator('#show-all-properties').click();
  await expect(row('Estado')).toContainText('Visible');
  await card.getByRole('button', { name: 'Cerrar detalles' }).click();
  await expect(card).toHaveCount(0);
  await page.locator('#hide-selected').click();
  await expect(part.locator('.dot-on')).toHaveCount(1);
  await page.getByRole('button', { name: 'C-01-concrete', exact: true }).click();
  await expect(row('Longitud de pieza')).toContainText('3000 mm');
  await expect(row('Barras longitudinales')).toContainText('4');
});

test('selecciona la viga desde el lienzo y conserva materiales y posiciones', async ({ page }, testInfo) => {
  await page.route(/\/src\/main\.js(?:\?|$)/, async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: await response.text() + '\nwindow.viewerApp = app;' });
  });
  await page.goto('/');
  await page.locator('[data-preset=front]').click();
  const camera = () => page.evaluate(() => window.viewerApp.cameraManager.camera.position.toArray());
  await expect.poll(async () => Math.round((await camera())[2])).toBe(12);
  const point = await page.evaluate(() => {
    const { sceneManager, cameraManager, rendererManager } = window.viewerApp;
    const beam = sceneManager.modelRoot.getObjectByName('V-01-concrete');
    const target = beam.localToWorld(beam.position.clone().set(1.3, 0, 0.15)).project(cameraManager.camera);
    const rect = rendererManager.renderer.domElement.getBoundingClientRect();
    return { x: rect.left + (target.x + 1) * rect.width / 2, y: rect.top + (1 - target.y) * rect.height / 2 };
  });
  await page.mouse.click(point.x, point.y);
  const card = page.getByRole('dialog');
  await expect(card.getByText('V-01-concrete').first()).toBeVisible();
  await expect(card.locator('dl > div').filter({ hasText: 'Longitud de pieza' })).toContainText('4000 mm');
  await page.screenshot({ path: testInfo.outputPath('viga-lienzo.png') });

  const material = name => page.evaluate(name => {
    const { material } = window.viewerApp.sceneManager.modelRoot.getObjectByName(name);
    return { transparent: material.transparent, opacity: material.opacity, depthWrite: material.depthWrite, wireframe: material.wireframe };
  }, name);
  const solid = { transparent: false, opacity: 1, depthWrite: true, wireframe: false };
  await page.locator('[data-mode=xray]').click();
  expect(await material('V-01-concrete')).toEqual({ ...solid, transparent: true, opacity: 0.35, depthWrite: false });
  expect(await material('V-01-top-1')).toEqual(solid);
  expect(await material('V-01-stirrup-1')).toEqual(solid);
  await page.locator('[data-mode=wireframe]').click();
  expect(await material('V-01-concrete')).toEqual({ ...solid, wireframe: true });
  await page.locator('[data-mode=solid]').click();
  expect(await material('V-01-concrete')).toEqual(solid);
  await expect(card).toBeVisible();

  const positions = () => page.evaluate(() => {
    const positions = [];
    window.viewerApp.sceneManager.modelRoot.traverse(object => {
      if (object.userData.entity) positions.push(object.position.toArray());
    });
    return positions;
  });
  const initial = await positions();
  await page.locator('#exploded-toggle').check();
  await expect.poll(positions).not.toEqual(initial);
  await page.locator('#exploded-toggle').uncheck();
  await expect.poll(positions).toEqual(initial);
  await page.locator('[data-preset=top]').click();
  await expect.poll(async () => Math.round((await camera())[1])).toBe(12);
  await page.locator('[data-preset=right]').click();
  await expect.poll(async () => Math.round((await camera())[0])).toBe(12);
});

test('carga el recurso externo en GLB y como GLTF con su BIN', async ({ page }) => {
  await page.goto('/');
  const filePath = 'public/models/external/Box.glb';
  const input = page.locator('#model-file-input');
  await input.setInputFiles(filePath);
  await expect(page.locator('#model-name')).toHaveText('Box');
  await expect(page.locator('#object-count')).toHaveText('1 objetos');

  const glb = await readFile(filePath);
  const jsonEnd = 20 + glb.readUInt32LE(12);
  const json = JSON.parse(glb.toString('utf8', 20, jsonEnd));
  json.buffers[0].uri = 'box-mesh.bin';
  await input.setInputFiles([
    { name: 'Box-separado.gltf', mimeType: 'model/gltf+json', buffer: Buffer.from(JSON.stringify(json)) },
    { name: 'box-mesh.bin', mimeType: 'application/octet-stream', buffer: glb.subarray(jsonEnd + 8) },
  ]);
  await expect(page.locator('#model-name')).toHaveText('Box-separado');
  await expect(page.locator('#validation-text')).toHaveText('Modelo cargado correctamente');
});
