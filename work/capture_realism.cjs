const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1550, height: 950}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  console.log('Navigating to realistic HTML viewer...');
  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.locator('#c').waitFor({timeout: 30000});
  await page.waitForTimeout(3000);

  console.log('Capturing overview screenshot...');
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/realistic_overview.png'});

  console.log('Switching to Street-level view...');
  await page.getByRole('button', {name: 'Street-level view', exact: true}).click();
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/realistic_street.png'});

  console.log('Focusing on Main Pandal...');
  await page.locator('#searchPdf').fill('Main Pandal');
  await page.waitForTimeout(500);
  if (await page.locator('#pdfIndex option').count() > 0) {
    await page.locator('#pdfIndex option').first().click();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/realistic_pandal.png'});

  const renderInfo = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    return {
      drawCalls: v?.renderer?.info?.render?.calls,
      geometries: v?.renderer?.info?.memory?.geometries,
      textures: v?.renderer?.info?.memory?.textures,
      features: v?.pdfFeatures?.length
    };
  });
  console.log('Render Info:', renderInfo);
  console.log('Errors:', errors);

  await browser.close();
  console.log('Done captures!');
})();
