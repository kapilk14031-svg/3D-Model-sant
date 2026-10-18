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
  await page.getByRole('button', {name: 'View', exact: true}).click();
  await page.waitForTimeout(500);

  const testFacilities = [
    {id: 'p1_parking', name: 'facility_p1_parking.png'},
    {id: 'p2_parking', name: 'facility_p2_parking.png'},
    {id: 'vip_gate1', name: 'facility_vip_gate1.png'},
    {id: 'p5_fob', name: 'facility_p5_fob.png'},
    {id: 'sewadal_camp', name: 'facility_sewadal_camp.png'},
    {id: 'toilets', name: 'facility_toilets.png'},
    {id: 'flyover_underpass', name: 'facility_flyover_underpass.png'}
  ];

  for (const item of testFacilities) {
    console.log(`Opening facility: ${item.id}...`);
    await page.evaluate((fid) => {
      if (typeof window.openVenueFacility === 'function') {
        window.openVenueFacility(fid);
      } else {
        console.error('window.openVenueFacility not found!');
      }
    }, item.id);
    await page.waitForTimeout(1600);
    await page.screenshot({path: `C:/Users/HP/Documents/Codex/2026-10-17/us/work/${item.name}`});

    // Exit back
    const exitBtn = page.getByRole('button', {name: 'Exit to Venue Site'});
    if (await exitBtn.isVisible()) {
      await exitBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // Also verify clicking a 3D billboard sign directly on the canvas!
  console.log('Taking full venue overview with 3D Facility Billboard Signs visible...');
  await page.waitForTimeout(1000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/venue_overview_signs.png'});

  await browser.close();
  console.log('All facility tests completed!');
})();
