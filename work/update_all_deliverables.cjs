const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1550, height: 950}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  console.log('Loading updated viewer...');
  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.locator('#c').waitFor({timeout: 30000});
  await page.waitForTimeout(3000);

  // Take final overview screenshot
  console.log('Saving react-final.png...');
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/react-final.png'});

  // Download GLB
  console.log('Exporting GLB...');
  const [glbDownload] = await Promise.all([
    page.waitForEvent('download', {timeout: 120000}),
    page.getByRole('button', {name: 'Download scene GLB', exact: true}).click()
  ]);
  await glbDownload.saveAs('C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-scene.glb');
  console.log('Saved outputs/e-bandobast-scene.glb, size:', fs.statSync('C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-scene.glb').size);

  // Trigger OBJ download directly
  console.log('Exporting OBJ...');
  const [objDownload] = await Promise.all([
    page.waitForEvent('download', {timeout: 60000}),
    page.evaluate(() => document.querySelector('#obj').click())
  ]);
  await objDownload.saveAs('C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-model.obj');
  console.log('Saved outputs/e-bandobast-model.obj, size:', fs.statSync('C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-model.obj').size);

  // Update register JSON
  console.log('Updating pdf-landmark-register.json...');
  const registerData = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    return {
      source: 'Adobe Scan 17 Oct 2026.pdf',
      note: 'Realistic 3D venue model with PBR materials, detailed vehicles, sky dome and German-hanger mega-pandal',
      features: v?.pdfFeatures || []
    };
  });
  fs.writeFileSync('C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/pdf-landmark-register.json', JSON.stringify(registerData, null, 2));

  console.log('All exports complete! Errors:', errors);
  await browser.close();
})();
