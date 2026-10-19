const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  const errors = [];
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
    errors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  console.log('Navigating to http://127.0.0.1:8080/e-bandobast-react.html ...');
  await page.goto('http://127.0.0.1:8080/e-bandobast-react.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // 1. Inspect residential tents object in scene
  const tentStats = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    const rt = globalThis.residentialTents;
    return {
      hasTents: !!rt,
      totalCount: rt ? rt.count : 0,
      visible: rt ? rt.visible : false
    };
  });
  console.log('Tent Stats:', JSON.stringify(tentStats, null, 2));

  // 2. High overhead top-down view showing all filled sectors
  console.log('Capturing overhead view with filled tents...');
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      v.focus(0, 0, 480);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/tents_verified_overhead.png' });
  console.log('Saved work/tents_verified_overhead.png');

  // 3. Ground B Medium / Close view (Ground B residential tents)
  console.log('Capturing Ground B accommodation view...');
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      // Focus on Ground B: x = -130, z = 0, distance = 80m
      v.focus(-120, 0, 80);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/tents_verified_ground_b.png' });
  console.log('Saved work/tents_verified_ground_b.png');

  // 4. Ground B Close-Up view (very close to tents: distance = 35m)
  console.log('Capturing close-up view of tents in Ground B...');
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      v.focus(-110, 20, 35);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/tents_verified_ground_b_close.png' });
  console.log('Saved work/tents_verified_ground_b_close.png');

  // 5. Ground C & Langar area view (distance = 75m)
  console.log('Capturing Ground C & D accommodation view...');
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      v.focus(10, -50, 75);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/tents_verified_ground_c.png' });
  console.log('Saved work/tents_verified_ground_c.png');

  // 6. Perspective overview showing whole venue with tents
  console.log('Capturing perspective overview...');
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (v && v.focus) {
      v.focus(0, 25, 260);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/tents_verified_overview_perspective.png' });
  console.log('Saved work/tents_verified_overview_perspective.png');

  console.log('Total errors:', errors.length);
  await browser.close();
})();
