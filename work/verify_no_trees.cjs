const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  console.log('Navigating to http://127.0.0.1:8080/e-bandobast-react.html ...');
  await page.goto('http://127.0.0.1:8080/e-bandobast-react.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Focus directly on Gate 1 and the area between VIP road and Main Pandal (where trees were)
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      // Focus on Gate 1 / Pandal front: x = -60, z = 70, distance = 75m
      v.focus(-60, 70, 75);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/trees_removed_verified.png' });
  console.log('Saved work/trees_removed_verified.png');

  // Also capture wider angle matching the user's screenshot
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      v.focus(-65, 60, 110);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/trees_removed_wide_verified.png' });
  console.log('Saved work/trees_removed_wide_verified.png');

  await browser.close();
})();
