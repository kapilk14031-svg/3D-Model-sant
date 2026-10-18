const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1600, height: 960}});

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:8080/outputs/e-bandobast-react.html ...');
  await page.goto('http://localhost:8080/outputs/e-bandobast-react.html');
  await page.waitForTimeout(3000);

  // Switch to View tab
  console.log('Switching to View tab...');
  await page.getByRole('button', {name: 'View', exact: true}).click();
  await page.waitForTimeout(500);

  // Click Open Big Pandal button
  console.log('Opening Big Pandal Hall...');
  await page.getByRole('button', {name: 'Open Big Pandal (Stage & Audience)'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/pandal_1_aisle.png'});

  // Grand Hall Overview (Roof Cutaway view)
  console.log('Switching to Grand Hall Overview (Cutaway)...');
  await page.getByRole('button', {name: 'Grand Hall Overview'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/pandal_2_overview.png'});

  // Switch to Stage View
  console.log('Switching to Stage View...');
  await page.getByRole('button', {name: 'Stage Close-Up'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/pandal_3_stage.png'});

  // Switch to Audience View
  console.log('Switching to Audience Perspective...');
  await page.getByRole('button', {name: 'Audience Perspective'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/pandal_4_audience.png'});

  // Switch to View From Stage
  console.log('Switching to View From Stage...');
  await page.getByRole('button', {name: 'View From Stage'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/pandal_5_from_stage.png'});

  // Test Exit
  console.log('Testing Exit to Venue Site...');
  await page.getByRole('button', {name: 'Exit to Venue Site'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/pandal_6_venue_return.png'});

  await browser.close();
  console.log('SUCCESS: All 6 camera perspectives tested and captured!');
})();
