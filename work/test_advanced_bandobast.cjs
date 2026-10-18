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

  console.log('Navigating to outputs/e-bandobast-react.html...');
  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.locator('#c').waitFor({timeout: 30000});
  await page.waitForTimeout(3000);

  // 1. Check Tabs
  console.log('Verifying tabs...');
  const tabButtons = await page.$$eval('.panel-tabs .tab-btn', btns => btns.map(b => b.textContent.trim()));
  console.log('Active tabs in sidebar:', tabButtons);

  // 2. Test Presets in Deploy Tab
  console.log('Testing Quick Deployment Presets...');
  await page.locator('#btnPresetVVIP').click();
  await page.waitForTimeout(1000);
  console.log('VVIP Preset active. Items count:', await page.evaluate(() => window.__bandobast.venue.items.length));

  await page.locator('#btnPresetPeak').click();
  await page.waitForTimeout(1000);
  console.log('Peak Rush Preset active. Items count:', await page.evaluate(() => window.__bandobast.venue.items.length));

  // 3. Test Officer Duty Card Popup
  console.log('Testing Officer Duty Card Popup...');
  await page.evaluate(() => {
    window.advancedBandobast.showOfficerCard(0, 380, 150);
  });
  await page.waitForTimeout(600);
  const cardVisible = await page.locator('#officer-duty-card').isVisible();
  const cardText = await page.locator('#officer-duty-card').innerText();
  console.log('Officer Card visible:', cardVisible, 'Header snippet:', cardText.slice(0, 80));
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/screenshot_officer_card.png'});

  await page.locator('#closeOfficerCard').click();

  // 4. Test Wayfinding & Glowing 3D Path
  console.log('Testing Turn-by-Turn Wayfinding in Route tab...');
  await page.locator('.panel-tabs button:has-text("Route")').click();
  await page.waitForTimeout(500);

  await page.selectOption('#routeOrigin', 'p2_parking');
  await page.selectOption('#routeDestination', 'langar2');
  await page.locator('#btnFindRoute').click();
  await page.waitForTimeout(1500);

  const routeDetails = await page.locator('#route-directions-box').innerText();
  console.log('Computed Route Info:', routeDetails.slice(0, 120));
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/screenshot_wayfinding_path.png'});

  // 5. Test Crowd Dynamics & Stampede Egress Simulator
  console.log('Testing Crowd Dynamics & Hydraulic Evacuation Simulator...');
  await page.locator('.panel-tabs button:has-text("Crowd")').click();
  await page.waitForTimeout(500);

  await page.locator('#btnTriggerEvac').click();
  await page.waitForTimeout(2000);
  const evacInfo = await page.locator('#evac-simulation-info').innerText();
  console.log('Evacuation Status:', evacInfo.slice(0, 100));
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/screenshot_evacuation_sim.png'});

  await page.locator('#btnStopEvac').click();
  await page.waitForTimeout(500);

  // 6. Test Emergency Green Corridor & Fire Hose Rings
  console.log('Testing Emergency Dispatch & Green Corridor...');
  await page.locator('.panel-tabs button:has-text("Alert")').click();
  await page.waitForTimeout(500);

  // Toggle Fire Hose Rings
  await page.locator('#toggleFireReach').check();
  await page.waitForTimeout(500);

  // Launch Green Corridor
  await page.locator('#btnDispatchCorridor').click();
  await page.waitForTimeout(2500);
  const corridorStatus = await page.locator('#green-corridor-status').innerText();
  console.log('Green Corridor Status:', corridorStatus.slice(0, 100));
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/screenshot_green_corridor.png'});

  // 7. Test Mobile Field Mode & Compass
  console.log('Testing Mobile Field Mode...');
  await page.locator('.panel-tabs button:has-text("Deploy")').click();
  await page.waitForTimeout(500);
  await page.locator('#toggleMobileMode').check();
  await page.waitForTimeout(500);

  const joystickVisible = await page.locator('#virtual-joysticks-container').isVisible();
  const compassText = await page.locator('#compassHeading').innerText();
  console.log('Virtual Joysticks visible:', joystickVisible, 'Compass heading:', compassText);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/screenshot_mobile_field_mode.png'});

  console.log('Total runtime errors caught:', errors.length);
  await browser.close();

  if (errors.length > 0) {
    console.error('FAILED with errors:', errors);
    process.exit(1);
  } else {
    console.log('ALL ADVANCED E-BANDOBAST FEATURES PASSED SUCCESSFULLY!');
  }
})();
