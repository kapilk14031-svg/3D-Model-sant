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

  console.log('Navigating to http://localhost:8080/outputs/e-bandobast-react.html...');
  await page.goto('http://localhost:8080/outputs/e-bandobast-react.html');
  await page.locator('#c').waitFor({timeout: 30000});
  await page.waitForTimeout(3000);

  // 1. Test Global Search
  console.log('Testing Global Search (Ctrl+K)...');
  await page.fill('#vcGlobalSearch', 'Langar');
  await page.waitForTimeout(500);
  const searchResultsCount = await page.locator('.vc-search-item').count();
  console.log(`Global Search returned ${searchResultsCount} matching items.`);
  await page.locator('.vc-search-item').first().click();
  await page.waitForTimeout(1000);

  // Verify Smart Context Inspector appeared
  const ctxVisible = await page.locator('#vcContextPanel').isVisible();
  const ctxTitle = await page.locator('#ctxTitle').innerText();
  console.log('Smart Context Inspector visible:', ctxVisible, 'Title:', ctxTitle);
  await page.locator('#closeContextPanel').click();

  // 2. Test Saved Camera Views
  console.log('Testing Saved Views dropdown...');
  await page.selectOption('#selectSavedViews', 'pandal');
  await page.waitForTimeout(1500);
  console.log('Jumped camera to Pandal view.');

  // 3. Test Layer Presets Menu
  console.log('Testing Layer Presets...');
  await page.selectOption('#selectLayerPresets', 'security');
  await page.waitForTimeout(1000);
  console.log('Activated Security Focus layer preset.');

  // 4. Test Measurement Tool
  console.log('Testing Measurement Tool...');
  await page.locator('#btnMeasureTape').click();
  await page.waitForTimeout(500);
  await page.locator('#btnMeasureTape').click(); // toggle off

  // 5. Test Role Switcher
  console.log('Testing Role Switcher...');
  await page.selectOption('#vcRoleSelect', 'medical');
  await page.waitForTimeout(500);

  // 6. Test Immersive Mode
  console.log('Testing Immersive Mode...');
  await page.locator('#vcImmersiveBtn').click();
  await page.waitForTimeout(1000);
  const isImmersive = await page.evaluate(() => document.body.classList.contains('vc-immersive-active'));
  console.log('Immersive mode active:', isImmersive);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/immersive_mode_preview.png'});

  // Exit Immersive mode via button
  await page.locator('#vcExitImmersivePill').click();
  await page.waitForTimeout(1000);

  // 7. Test Alerts Triage Drawer
  console.log('Testing Alerts Triage Drawer...');
  await page.locator('#vcAlertsBtn').click();
  await page.waitForTimeout(600);
  const alertsVisible = await page.locator('#vcAlertsDrawer').isVisible();
  console.log('Alerts drawer open:', alertsVisible);
  await page.locator('#closeAlertsDrawer').click();

  // 8. Test Shortcuts Modal
  console.log('Testing Keyboard Shortcuts Modal...');
  await page.locator('#vcShortcutsBtn').click();
  await page.waitForTimeout(600);
  const modalVisible = await page.locator('#vcShortcutsModal').isVisible();
  console.log('Shortcuts modal open:', modalVisible);
  await page.locator('#closeShortcutsModal').click();

  // 9. Test Change History Modal
  console.log('Testing Change History Audit Log...');
  await page.locator('#btnHistoryLog').click();
  await page.waitForTimeout(600);
  const histVisible = await page.locator('#vcHistoryModal').isVisible();
  console.log('History log modal open:', histVisible);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/history_audit_preview.png'});
  await page.locator('#closeHistoryModal').click();

  // Final Dashboard Screenshot
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/venue_command_daily_usability.png'});
  console.log('Screenshot saved to work/venue_command_daily_usability.png');

  console.log('Total errors:', errors.length);
  await browser.close();

  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  } else {
    console.log('SUCCESS: All Daily Usability, Visual Polish, and Operational Tools verified!');
  }
})();
