const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1500, height: 950}});
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.waitForTimeout(3000);

  console.log('Clicking Download scene GLB...');
  await page.getByRole('button', {name: 'Download scene GLB'}).click();
  await page.waitForTimeout(6000);

  const statusText = await page.locator('header, aside, main, div').evaluateAll(els => {
    return els.map(e => e.innerText).filter(t => t && t.includes('Export'));
  });
  console.log('Status containing Export:', statusText);

  await browser.close();
})();
