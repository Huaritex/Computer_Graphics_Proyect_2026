import { test, expect } from '@playwright/test';

test.describe('Visualizador paramétrico', () => {
  test('carga y permite las operaciones principales', async ({ page }) => {
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
      path: 'tests/e2e/screenshots/desktop.png',
      fullPage: true,
    });

    expect(jsErrors, `Errores JS: ${jsErrors.join(' | ')}`).toEqual([]);
  });

  test('mantiene el visor usable en móvil y genera captura', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#viewport canvas')).toBeVisible();
    await expect(page.locator('#left-panel')).not.toHaveClass(/mobile-open/);
    await page.locator('#mobile-panel-toggle').click();
    await expect(page.locator('#left-panel')).toHaveClass(/mobile-open/);
    await page.locator('#mobile-panel-toggle').click();
    await expect(page.locator('#left-panel')).not.toHaveClass(/mobile-open/);
    await page.screenshot({
      path: 'tests/e2e/screenshots/mobile.png',
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
  await expect(page.locator('#exploded-toggle')).toBeChecked();
});

test('rechaza un paso de estribos vacío sin reemplazar el modelo', async ({ page }) => {
  await page.goto('/');
  await page.locator('#beam-spacing').fill('');
  await page.locator('#generate-button').click();
  await expect(page.locator('#validation-text')).toContainText('separación de estribos');
  await expect(page.locator('#model-name')).toHaveText('Unión viga-columna');
});
