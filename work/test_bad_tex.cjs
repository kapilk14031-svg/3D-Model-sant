
const {chromium} = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const b = await chromium.launch({channel:'msedge', headless:true});
  const p = await b.newPage();
  await p.goto('file:///C:/Users/HP/Documents/Codex/2026-10-17/us/outputs/e-bandobast-react.html');
  await p.waitForTimeout(2000);
  const bad = await p.evaluate(() => {
    const list = [];
    window.__bandobast.venue.scene.traverse(o => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m.map) {
            const img = m.map.image;
            if (!img || !(img instanceof HTMLCanvasElement || img instanceof HTMLImageElement)) {
              list.push({mesh: o.name || o.geometry?.type, imgType: typeof img, constructor: img?.constructor?.name});
            }
          }
        }
      }
    });
    return list;
  });
  console.log('Bad texture meshes count:', bad.length);
  if (bad.length > 0) console.log(bad.slice(0, 10));
  await b.close();
})();
