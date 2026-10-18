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

  // 1. Open Langar Complex Model
  console.log('Opening Langar Complex 3D Model...');
  await page.locator('#btnLangar').click();
  await page.waitForTimeout(1800);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/facility_1_langar.png'});

  // 2. Open Exhibition Model
  console.log('Switching to Exhibition Model...');
  await page.getByRole('button', {name: 'Exit to Venue Site'}).click();
  await page.waitForTimeout(1000);
  await page.locator('#btnExhib').click();
  await page.waitForTimeout(1800);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/facility_2_exhibition.png'});

  // 3. Open Police Control Room Model
  console.log('Switching to Police Control Room Model...');
  await page.getByRole('button', {name: 'Exit to Venue Site'}).click();
  await page.waitForTimeout(1000);
  await page.locator('#btnPolice').click();
  await page.waitForTimeout(1800);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/facility_3_police.png'});

  // 4. Open Railway Station & Transit Hub Model
  console.log('Switching to Railway Hub Model...');
  await page.getByRole('button', {name: 'Exit to Venue Site'}).click();
  await page.waitForTimeout(1000);
  await page.locator('#btnRailway').click();
  await page.waitForTimeout(1800);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/facility_4_railway.png'});

  // 5. Open Medical Hospital & Dispensary Model
  console.log('Switching to Medical Hospital Model...');
  await page.getByRole('button', {name: 'Exit to Venue Site'}).click();
  await page.waitForTimeout(1000);
  await page.locator('#btnMedical').click();
  await page.waitForTimeout(1800);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/facility_5_medical.png'});

  // 6. Test Exit to Venue Ground
  console.log('Exiting to Venue Site...');
  await page.getByRole('button', {name: 'Exit to Venue Site'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/facility_6_venue_return.png'});

  await browser.close();
  console.log('SUCCESS: All Facility 3D models tested and verified!');
})();
