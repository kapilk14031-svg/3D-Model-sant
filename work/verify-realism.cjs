const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('path');

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

  console.log('Loading outputs/e-bandobast-react.html...');
  await page.goto('file:///' + path.resolve('outputs/e-bandobast-react.html').replace(/\\/g, '/'));
  await page.locator('#c').waitFor({timeout: 30000});
  await page.waitForTimeout(3000);

  // 1. Screenshot: Main Venue Overview
  console.log('Capturing realistic venue overview...');
  await page.screenshot({path: 'work/real_venue_overview.png'});

  // 2. Open Police facility
  console.log('Opening Police facility...');
  await page.evaluate(() => {
    window.openVenueFacility('police');
  });
  await page.waitForTimeout(1500);
  // Click Vehicles view for close-up
  await page.locator('button[data-cam="vehicles"]').click().catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'work/real_facility_police.png'});

  // Exit Police
  await page.evaluate(() => {
    window.facilityModels.closeFacility();
  });
  await page.waitForTimeout(1000);

  // 3. Open P1 Parking facility
  console.log('Opening P1 Parking facility...');
  await page.evaluate(() => {
    window.openVenueFacility('p1_parking');
  });
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'work/real_facility_parking.png'});

  // Exit P1 Parking
  await page.evaluate(() => {
    window.facilityModels.closeFacility();
  });
  await page.waitForTimeout(1000);

  // 4. Open Langar facility
  console.log('Opening Langar facility...');
  await page.evaluate(() => {
    window.openVenueFacility('langar');
  });
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'work/real_facility_langar.png'});

  // Exit Langar
  await page.evaluate(() => {
    window.facilityModels.closeFacility();
  });
  await page.waitForTimeout(1000);

  // 5. Open Big Pandal
  console.log('Opening Big Pandal...');
  await page.evaluate(() => {
    window.__bandobast.venue.bigPandal.enterBigPandal();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({path: 'work/real_pandal.png'});

  console.log('All screenshots captured! Errors encountered:', errors);
  await browser.close();
})();
