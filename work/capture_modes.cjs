const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1550, height: 950}});

  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.waitForTimeout(3000);

  // Switch to Audit tab to access lighting controls
  await page.getByRole('button', {name: 'Audit', exact: true}).click();
  await page.waitForTimeout(500);

  // Golden Sunset
  console.log('Capturing Golden Sunset...');
  await page.locator('#envMode').selectOption('sunset');
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sunset_mode.png'});

  // Night Bandobast
  console.log('Capturing Night Bandobast...');
  await page.locator('#envMode').selectOption('night');
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/night_mode.png'});

  await browser.close();
  console.log('Captured sunset and night modes!');
})();
