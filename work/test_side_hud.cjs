const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1600, height: 960}});

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:8080/outputs/e-bandobast-react.html ...');
  await page.goto('http://localhost:8080/outputs/e-bandobast-react.html');
  await page.waitForTimeout(3000);

  // 1. Open Big Pandal
  console.log('Opening Big Pandal...');
  await page.getByRole('button', {name: 'View', exact: true}).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', {name: 'Open Big Pandal (Stage & Audience)'}).click();
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/side_hud_pandal.png'});

  // Test Minimizing Pandal HUD
  console.log('Testing minimize toggle on Pandal HUD...');
  await page.locator('#minPandalBtn').click();
  await page.waitForTimeout(600);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/side_hud_pandal_minimized.png'});

  // Exit back to venue
  await page.locator('#exitPandalBtn').click();
  await page.waitForTimeout(1000);

  // 2. Open Langar Facility Model
  console.log('Opening Langar Facility Model...');
  await page.evaluate(() => {
    window.openVenueFacility('langar');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/side_hud_langar.png'});

  // Exit back to venue
  await page.locator('#exitFacilityBtn').click();
  await page.waitForTimeout(1000);

  // 3. Open Street View
  console.log('Opening Street View...');
  await page.locator('#streetView').click();
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/side_hud_streetview.png'});

  await browser.close();
  console.log('Side HUD tests completed successfully!');
})();
