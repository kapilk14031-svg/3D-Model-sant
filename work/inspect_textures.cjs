const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const page = await browser.newPage();
  await page.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await page.waitForTimeout(2000);

  const report = await page.evaluate(() => {
    const v = window.__bandobast?.venue;
    const textures = [];
    v.scene.traverse(o => {
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m.map) {
            textures.push({
              meshName: o.name,
              matName: m.name,
              isCanvasTexture: m.map.isCanvasTexture,
              isTexture: m.map.isTexture,
              hasImage: !!m.map.image,
              imageConstructor: m.map.image?.constructor?.name,
              width: m.map.image?.width,
              height: m.map.image?.height,
            });
          }
        }
      }
    });
    return textures;
  });

  console.log('Textures found in scene:');
  console.dir(report, {depth: null});
  await browser.close();
})();
