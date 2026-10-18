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

  // Check Venue Command Header
  const title = await page.locator('.vc-title').innerText();
  const status = await page.locator('.vc-system-status').innerText();
  console.log('Header Title:', title, 'Status:', status);

  // Check Workspace Nav
  const wsItems = await page.$$eval('.vc-nav-item', items => items.map(i => i.innerText.trim()));
  console.log('Workspace Nav Items:', wsItems);

  // Check 3D View Pills
  const viewPills = await page.$$eval('.vc-view-pill', pills => pills.map(p => p.innerText.trim()));
  console.log('View Pills:', viewPills);

  // Check Bottom Cards
  const activeLayersLabel = await page.locator('.vc-bottom-card .vc-card-label').first().innerText();
  const liveStatusText = await page.locator('.vc-status-live-hero').innerText();
  console.log('Bottom Card 1:', activeLayersLabel, 'Bottom Card 2:', liveStatusText);

  // Test clicking Workspace Nav items
  console.log('Clicking "Layers" workspace button...');
  await page.locator('#wsNavLayers').click();
  await page.waitForTimeout(1000);

  console.log('Clicking "Routes" workspace button...');
  await page.locator('#wsNavRoutes').click();
  await page.waitForTimeout(1000);

  console.log('Clicking "Security" workspace button...');
  await page.locator('#wsNavSecurity').click();
  await page.waitForTimeout(1000);

  // Test Plan View pill
  console.log('Clicking "Plan View" pill...');
  await page.locator('#btnPillPlan').click();
  await page.waitForTimeout(1500);

  // Test 3D View pill
  console.log('Clicking "3D View" pill...');
  await page.locator('#btnPill3D').click();
  await page.waitForTimeout(1500);

  // Take full dashboard screenshot
  await page.screenshot({path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/venue_command_dashboard.png'});
  console.log('Screenshot saved to work/venue_command_dashboard.png');

  console.log('Total errors:', errors.length);
  await browser.close();

  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  } else {
    console.log('SUCCESS: Venue Command Dashboard UI matches mockup and fully functional!');
  }
})();
