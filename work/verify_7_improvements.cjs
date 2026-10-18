const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--use-gl=angle', '--use-angle=swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  console.log('Loading outputs/e-bandobast-react.html ...');
  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.waitForTimeout(4000);

  // 1. Full Dashboard Overview Screenshot
  await page.screenshot({ path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/1_c4i_surveillance_dashboard.png' });
  console.log('Saved: work/1_c4i_surveillance_dashboard.png');

  // 2. Trigger Label Details Popup (Simulate clicking Gate 1 VIP)
  await page.evaluate(() => {
    if (typeof showLabelDetailPopup === 'function') {
      showLabelDetailPopup('Gate 1 (VIP & Main Entry)', 'vip_gate1');
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/2_label_details_popup.png' });
  console.log('Saved: work/2_label_details_popup.png');

  // Close popup
  await page.evaluate(() => {
    const p = document.getElementById('labelDetailPopup');
    if (p) p.style.display = 'none';
  });

  // 3. Open Right-Side 3D Assets Drawer
  const drawerBtn = page.locator('button:has-text("3D Models & Assets")');
  if (await drawerBtn.isVisible()) {
    await drawerBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/3_assets_drawer_opened.png' });
    console.log('Saved: work/3_assets_drawer_opened.png');
    // Close it back
    const closeBtn = page.getByRole('button', { name: '✕' });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }
  }

  // 4. Test Bottom Command Toolbar: Plan View
  const planBtn = page.locator('#btnToolbarPlan');
  if (await planBtn.isVisible()) {
    try {
      await planBtn.click({ timeout: 4000 });
    } catch (e) {
      console.log('Using evaluate fallback for planBtn click...');
      await page.evaluate(() => document.getElementById('btnToolbarPlan')?.click());
    }
    await page.waitForTimeout(1600);
    await page.screenshot({ path: 'C:/Users/HP/Documents/Codex/2026-10-17/us/work/4_plan_view.png' });
    console.log('Saved: work/4_plan_view.png');
  }

  // Check state and elements
  const metrics = await page.evaluate(() => ({
    title: document.title,
    sidebarWidth: document.querySelector('.vc-sidebar-card')?.clientWidth,
    viewportWidth: document.querySelector('#viewport')?.clientWidth,
    accordions: document.querySelectorAll('.vc-accordion').length,
    hudBtns: document.querySelectorAll('.vc-hud-btn').length,
    toolbarBtns: document.querySelectorAll('.vc-tb-btn').length,
    tiltVal: document.getElementById('tiltVal')?.textContent,
    zoomVal: document.getElementById('zoomVal')?.textContent,
    yawVal: document.getElementById('yawVal')?.textContent
  }));

  console.log('Test Metrics:', JSON.stringify(metrics, null, 2));
  console.log('Errors encountered:', errors.length, errors);

  await browser.close();
})();
