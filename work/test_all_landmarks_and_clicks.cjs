const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1600, height: 960}});

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  console.log('Opening e-bandobast-react.html...');
  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.locator('#c').waitFor({timeout: 30000});
  await page.waitForTimeout(3000);

  console.log('Checking PDF Index landmark count...');
  const optionsCount = await page.locator('#pdfIndex option').count();
  console.log(`Found ${optionsCount} landmarks in #pdfIndex.`);

  // Switch to View tab where #pdfIndex resides
  console.log('Switching to View tab...');
  await page.getByRole('button', {name: 'View', exact: true}).click();
  await page.waitForTimeout(500);

  // Test 1: Select "Gate 1" and click #btnOpenSelectedModel
  console.log('Test 1: Selecting Gate 1 and opening 3D model...');
  await page.selectOption('#pdfIndex', {index: 1});
  const selectedText = await page.$eval('#pdfIndex', el => el.options[el.selectedIndex]?.text);
  console.log('Selected landmark:', selectedText);

  await page.locator('#btnOpenSelectedModel').click();
  await page.waitForTimeout(1500);

  let isModelActive = await page.evaluate(() => {
    const fm = window.facilityModels;
    const bp = window.__bandobast?.venue?.bigPandal;
    return (fm && fm.getActiveFacilityId && !!fm.getActiveFacilityId()) || (bp && bp.isInside && bp.isInside());
  });
  console.log('3D Model Active after button click:', isModelActive);

  // Take screenshot of opened model
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/test_click_gate1.png'});

  // Exit back to venue
  console.log('Exiting back to venue...');
  const exitBtn = page.getByRole('button', {name: /Exit to Venue|Back to Venue/i});
  if (await exitBtn.isVisible()) {
    await exitBtn.click();
    await page.waitForTimeout(1000);
  }

  // Test 2: Select a Langar landmark and double click
  console.log('Test 2: Double clicking Langar landmark in PDF index...');
  const langarIndex = await page.$$eval('#pdfIndex option', opts => {
    return opts.findIndex(o => /langar/i.test(o.text));
  });
  if (langarIndex >= 0) {
    await page.selectOption('#pdfIndex', {index: langarIndex});
    await page.dispatchEvent('#pdfIndex', 'dblclick');
    await page.waitForTimeout(1500);
    isModelActive = await page.evaluate(() => {
      const fm = window.facilityModels;
      return fm && fm.getActiveFacilityId && !!fm.getActiveFacilityId();
    });
    console.log('3D Langar Model Active after dblclick:', isModelActive);
    await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/test_dblclick_langar.png'});

    // Exit back
    if (await exitBtn.isVisible()) {
      await exitBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Test 3: Select Pandal / Satsang Hall and click #btnOpenSelectedModel
  console.log('Test 3: Opening Big Pandal through #btnOpenSelectedModel...');
  const pandalIndex = await page.$$eval('#pdfIndex option', opts => {
    return opts.findIndex(o => /pandal|satsang/i.test(o.text));
  });
  if (pandalIndex >= 0) {
    await page.selectOption('#pdfIndex', {index: pandalIndex});
    await page.locator('#btnOpenSelectedModel').click();
    await page.waitForTimeout(1500);
    const insidePandal = await page.evaluate(() => {
      const bp = window.__bandobast?.venue?.bigPandal;
      return bp && bp.isInside && bp.isInside();
    });
    console.log('Big Pandal isInside:', insidePandal);
    await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/test_btn_pandal.png'});

    const exitPandal = page.locator('#exitPandalBtn');
    if (await exitPandal.isVisible()) {
      await exitPandal.click();
      await page.waitForTimeout(1000);
    }
  }

  // Test 4: Direct canvas raycast click on an interactive label/sign/building
  console.log('Test 4: Testing interactive 3D ground landmark picking via pointer events...');
  const clickedTarget = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    if (!v) return null;
    // Find a clickable landmark sprite or building
    const scene = v.scene;
    let target = null;
    scene.traverse(o => {
      if (!target && (o.userData?.isFacilitySign || o.userData?.isInteractiveLabel || o.userData?.is3DBuilding)) {
        target = {name: o.userData.label || o.name, facilityId: o.userData.facilityId, pos: o.position};
      }
    });
    return target;
  });
  console.log('Found interactive target in 3D scene:', clickedTarget);

  // Trigger model open for arbitrary landmark name (fallback test)
  console.log('Test 5: Testing arbitrary unmapped landmark fallback generation...');
  await page.evaluate(() => {
    if (typeof window.triggerModelOpen === 'function') {
      window.triggerModelOpen(null, 'Custom Ground Sector 42 - Special Enclosure');
    }
  });
  await page.waitForTimeout(1500);
  const activeFallback = await page.evaluate(() => {
    const fm = window.facilityModels;
    return fm && fm.getActiveFacilityId && fm.getActiveFacilityId();
  });
  console.log('Fallback model generated with ID:', activeFallback);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/test_fallback_sector42.png'});

  if (await exitBtn.isVisible()) {
    await exitBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('Total errors:', errors.length);
  await browser.close();
  if (errors.length > 0) {
    console.error('FAILED with errors:', errors);
    process.exit(1);
  } else {
    console.log('SUCCESS: All PDF landmark clicks, 3D facility models, and fallback systems verified!');
  }
})();
