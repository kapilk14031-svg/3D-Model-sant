const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  console.log('Navigating to http://127.0.0.1:8080/e-bandobast-react.html ...');
  await page.goto('http://127.0.0.1:8080/e-bandobast-react.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Check tent count
  const count = await page.evaluate(() => {
    return globalThis.residentialTents ? globalThis.residentialTents.count : 0;
  });
  console.log('Total Residential Tents Count:', count);

  // Focus on the free space plot in front of Gate 1 / south of P2 buses
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      // Gate 1 front plot center: x = -110, z = 65, distance = 110m
      v.focus(-110, 65, 110);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/freespace_tents_verified.png' });
  console.log('Saved work/freespace_tents_verified.png');

  // Also capture overhead view
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      v.focus(0, 0, 480);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/freespace_tents_overhead.png' });
  console.log('Saved work/freespace_tents_overhead.png');

  await browser.close();
})();
