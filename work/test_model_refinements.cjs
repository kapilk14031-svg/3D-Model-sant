const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1600, height: 960}});

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:8080/outputs/e-bandobast-react.html ...');
  await page.goto('http://localhost:8080/outputs/e-bandobast-react.html');
  await page.waitForTimeout(3000);

  // 1. Big Pandal
  console.log('Opening Big Pandal...');
  await page.getByRole('button', {name: 'View', exact: true}).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', {name: 'Open Big Pandal (Stage & Audience)'}).click();
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/refined_pandal_aisle.png'});

  // Exit back
  await page.locator('#exitPandalBtn').click();
  await page.waitForTimeout(1000);

  // 2. Langar Complex in daytime environment
  console.log('Opening Langar...');
  await page.evaluate(() => window.openVenueFacility('langar'));
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/refined_facility_langar.png'});

  await page.locator('#exitFacilityBtn').click();
  await page.waitForTimeout(1000);

  // 3. Police Post
  console.log('Opening Police...');
  await page.evaluate(() => window.openVenueFacility('police'));
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/refined_facility_police.png'});

  await page.locator('#exitFacilityBtn').click();
  await page.waitForTimeout(1000);

  // 4. P1 Parking
  console.log('Opening P1 Parking...');
  await page.evaluate(() => window.openVenueFacility('p1_parking'));
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/refined_facility_parking.png'});

  await browser.close();
  console.log('All refinement screenshots captured successfully!');
})();
