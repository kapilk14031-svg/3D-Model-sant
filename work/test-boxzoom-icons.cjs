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
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  const fileUrl = 'file://' + path.resolve(__dirname, '../outputs/e-bandobast-react.html').replace(/\\/g, '/');
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  // Screenshot 1: Overview with deployed police badge icons
  console.log('Capturing overview with police badge icons...');
  await page.screenshot({ path: path.resolve(__dirname, 'police_icons_overview.png') });

  // Test Area Zoom: Click the "आयत खींचकर ज़ूम करें (Area Zoom)" button
  console.log('Activating Area Zoom button...');
  await page.click('#boxZoomBtn');
  await page.waitForTimeout(600);

  // Drag a rectangle on the 3D canvas
  console.log('Dragging rectangle to enlarge...');
  const canvas = await page.$('#c');
  const box = await canvas.boundingBox();
  const startX = box.x + 550;
  const startY = box.y + 320;
  const endX = box.x + 880;
  const endY = box.y + 560;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.resolve(__dirname, 'box_zoom_dragging.png') });
  await page.mouse.up();

  // Wait for camera smoothView animation to complete
  await page.waitForTimeout(2500);
  console.log('Capturing enlarged view...');
  await page.screenshot({ path: path.resolve(__dirname, 'box_zoom_enlarged.png') });

  // Test quick deploy: Click "👮 यहाँ पुलिस लगाएं" and click on the ground
  console.log('Testing quick deploy police officer...');
  await page.click('#quickDeployBtn');
  await page.waitForTimeout(500);

  // Click on the ground in the zoomed-in view
  await page.mouse.click(box.x + 650, box.y + 400);
  await page.waitForTimeout(1200);

  console.log('Capturing newly deployed police officer with badge in zoomed view...');
  await page.screenshot({ path: path.resolve(__dirname, 'police_deployed_in_zoom.png') });

  console.log('All tests completed successfully! Errors:', errors);
  await browser.close();
})();
