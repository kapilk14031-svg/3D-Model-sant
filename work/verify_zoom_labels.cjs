const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  let errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('Browser Error:', msg.text());
  });

  console.log('Navigating to http://127.0.0.1:8080/e-bandobast-react.html ...');
  await page.goto('http://127.0.0.1:8080/e-bandobast-react.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Overview shot
  await page.screenshot({ path: 'work/zoom_verified_overview.png' });
  console.log('Saved work/zoom_verified_overview.png');

  // 2. Select VIP Gate 1 from Jump dropdown
  console.log('Selecting VIP Gate 1...');
  await page.selectOption('#pdfIndex', { label: 'VIP GATE 1 (VIP Gate)' }).catch(async () => {
    // If exact label differs, select by value containing GATE 1
    const options = await page.$$eval('#pdfIndex option', opts => opts.map(o => ({ value: o.value, text: o.text })));
    const gate1 = options.find(o => /GATE 1/i.test(o.text));
    if (gate1) {
      await page.selectOption('#pdfIndex', gate1.value);
    }
  });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'work/zoom_verified_jump_gate1.png' });
  console.log('Saved work/zoom_verified_jump_gate1.png');

  // Inspect the focusLabel scale and distance
  const focusStats = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (!v) return { error: 'no venue' };
    if (globalThis.smartVenueLabels) globalThis.smartVenueLabels();
    let fl = null;
    let cameraPos = v.camera.position;
    let flScale = null;
    let flPos = null;
    let flDist = null;

    v.scene.traverse(o => {
      if (o.isSprite && o.userData && o.userData.isFocusBadge) {
        fl = o;
        flScale = { x: o.scale.x, y: o.scale.y };
        flPos = { x: o.position.x, y: o.position.y, z: o.position.z };
        flDist = v.camera.position.distanceTo(o.position);
      }
    });

    return { flScale, flPos, flDist, cameraPos: { x: cameraPos.x, y: cameraPos.y, z: cameraPos.z } };
  });
  console.log('Focus badge at jump:', JSON.stringify(focusStats, null, 2));

  // 3. Zoom camera close to VIP Gate 1 (distance = 25m) using v.focus
  console.log('Zooming camera close to VIP Gate 1 (25m)...');
  await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    let fl = null;
    v.scene.traverse(o => {
      if (o.isSprite && o.userData && o.userData.isFocusBadge) fl = o;
    });
    if (fl && v.focus) {
      v.focus(fl.position.x, fl.position.z, 25);
    }
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    if (globalThis.smartVenueLabels) globalThis.smartVenueLabels();
  });
  await page.screenshot({ path: 'work/zoom_verified_jump_gate1_close.png' });
  console.log('Saved work/zoom_verified_jump_gate1_close.png');

  // Inspect close zoom scale
  const closeStats = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (globalThis.smartVenueLabels) globalThis.smartVenueLabels();
    let fl = null;
    v.scene.traverse(o => {
      if (o.isSprite && o.userData && o.userData.isFocusBadge) {
        fl = o;
      }
    });
    return fl ? { scale: { x: fl.scale.x, y: fl.scale.y }, dist: v.camera.position.distanceTo(fl.position) } : null;
  });
  console.log('Focus badge at close zoom:', JSON.stringify(closeStats, null, 2));

  // 4. Zoom to Main Pandal to inspect duty point badges and facility labels
  console.log('Selecting MAIN PANDAL...');
  const options = await page.$$eval('#pdfIndex option', opts => opts.map(o => ({ value: o.value, text: o.text })));
  const pandal = options.find(o => /PANDAL/i.test(o.text));
  if (pandal) {
    await page.selectOption('#pdfIndex', pandal.value);
    await page.waitForTimeout(2000);
    // Zoom close to pandal
    await page.evaluate(() => {
      const v = window.__bandobast?.venue;
      if (v && v.target && v.focus) {
        v.focus(v.target.x, v.target.z, 40);
      }
    });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      if (globalThis.smartVenueLabels) globalThis.smartVenueLabels();
    });
    await page.screenshot({ path: 'work/zoom_verified_pandal_close.png' });
    console.log('Saved work/zoom_verified_pandal_close.png');
  }

  console.log('Page Errors:', errors);
  await browser.close();
})();
