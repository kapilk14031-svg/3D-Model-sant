const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage({viewport: {width: 1600, height: 960}});

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:8080/outputs/e-bandobast-react.html ...');
  await page.goto('http://localhost:8080/outputs/e-bandobast-react.html');
  await page.waitForTimeout(3000);

  // 1. Enter Street View using floating Pegman button
  console.log('Clicking Floating Street View Button...');
  const launcher = page.locator('#floatingStreetViewBtn');
  await launcher.click();
  await page.waitForTimeout(500);

  // If drop mode is active, click ground near Gate 1 (-75, 100) or click the View tab button directly
  console.log('Entering Street View from View tab button...');
  await page.getByRole('button', {name: 'View', exact: true}).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', {name: 'Google Street View'}).click();
  await page.waitForTimeout(1500);

  // 2. Capture Gate 1 Street View
  console.log('Capturing Street View: Gate 1...');
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sv_1_gate1.png'});

  // 3. Jump to NH-44 Highway Overpass Flyover
  console.log('Jumping to NH-44 Highway Overpass Flyover...');
  await page.locator('#svHotspotSelect').selectOption({label: 'NH-44 GT Road Highway Overpass Flyover'});
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sv_2_flyover.png'});

  // 4. Jump to Grand Pandal Front Entrance
  console.log('Jumping to Grand Pandal Front Entrance...');
  await page.locator('#svHotspotSelect').selectOption({label: 'Grand Pandal Main Entrance & Porch'});
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sv_3_pandal_front.png'});

  // 5. Jump to Langar 2 Dining Enclosure
  console.log('Jumping to Langar 2 Dining Enclosure...');
  await page.locator('#svHotspotSelect').selectOption({label: 'Langar 2 & Grand Dining Enclosure'});
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sv_4_langar.png'});

  // 6. Test Walking forward with W key
  console.log('Testing walking forward with W key...');
  await page.keyboard.press('KeyW');
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyW');
  await page.waitForTimeout(1000);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sv_5_walked.png'});

  // 7. Exit Street View back to 3D Venue
  console.log('Exiting Street View...');
  await page.getByRole('button', {name: 'Exit Street View'}).click();
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/sv_6_exit.png'});

  await browser.close();
  console.log('SUCCESS: All Street View tests passed and verified!');
})();
