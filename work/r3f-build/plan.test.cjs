var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  RESOURCE_TYPES: () => RESOURCE_TYPES,
  parsePlan: () => parsePlan,
  pointInside: () => pointInside,
  totals: () => totals,
  zoneFor: () => zoneFor
});
module.exports = __toCommonJS(stdin_exports);
const RESOURCE_TYPES = ["officer", "barricade", "traffic", "medical", "command", "cctv", "water", "access"];
const text = (v, max = 200) => typeof v === "string" ? v.slice(0, max) : "";
const validPoint = (p) => Array.isArray(p) && p.length === 2 && p.every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1);
function validPolygon(points) {
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-8) return false;
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || i === 0 && j === points.length - 1) continue;
      const c = points[j], d = points[(j + 1) % points.length];
      const intersects = cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0 && Math.max(Math.min(a[0], b[0]), Math.min(c[0], d[0])) <= Math.min(Math.max(a[0], b[0]), Math.max(c[0], d[0])) && Math.max(Math.min(a[1], b[1]), Math.min(c[1], d[1])) <= Math.min(Math.max(a[1], b[1]), Math.max(c[1], d[1]));
      if (intersects) return false;
    }
  }
  return true;
}
function parsePlan(input) {
  const obj = input;
  if (obj && obj.version !== void 0 && ![1, 2, 3].includes(obj.version)) throw Error("Unsupported deployment file version.");
  if (!obj || !Array.isArray(obj.items) || obj.items.length > 500) throw Error("Plan must contain up to 500 resource groups.");
  const rawZones = obj.zones ?? [];
  if (!Array.isArray(rawZones) || rawZones.length > 100) throw Error("Too many zones.");
  const zones = rawZones.map((z) => {
    if (!z || typeof z.id !== "string" || !z.id || z.id.length > 64 || !Array.isArray(z.points) || z.points.length < 3 || z.points.length > 100 || !z.points.every(validPoint) || !/^#[0-9a-f]{6}$/i.test(z.color)) throw Error("Invalid zone geometry or colour.");
    const points = z.points.map((p) => [...p]);
    const area = Math.abs(points.reduce((s, p, i) => {
      const q = points[(i + 1) % points.length];
      return s + p[0] * q[1] - q[0] * p[1];
    }, 0)) / 2;
    if (area < 1e-6) throw Error("Zone needs an area, not a straight line.");
    if (!validPolygon(points)) throw Error("Zone edges cross or repeat. Draw a simple boundary.");
    return { id: z.id, name: text(z.name, 80) || "Unnamed zone", color: z.color, points };
  });
  if (new Set(zones.map((z) => z.id)).size !== zones.length) throw Error("Duplicate zone IDs.");
  let named = 0;
  const items = obj.items.map((i) => {
    if (!i || !RESOURCE_TYPES.includes(i.type) || !validPoint([i.x, i.y]) || !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 1e3) throw Error("Invalid resource position, type or quantity.");
    if (i.rotationDeg !== void 0 && (typeof i.rotationDeg !== "number" || !Number.isFinite(i.rotationDeg))) throw Error("Invalid rotation.");
    const officers = (Array.isArray(i.officers) ? i.officers : []).map((o, n) => ({ id: text(o?.id, 64) || "officer-" + n, name: text(o?.name, 120), rank: text(o?.rank, 60), phone: text(o?.phone, 40) }));
    if (officers.length > i.qty || officers.length > 1e3) throw Error("Officer records exceed group quantity.");
    named += officers.length;
    if (named > 5e3) throw Error("Too many officer records.");
    return { type: i.type, x: i.x, y: i.y, label: text(i.label, 120) || i.type, qty: i.qty, rotationDeg: ((i.rotationDeg ?? 0) % 360 + 360) % 360, zoneId: i.zoneId === "none" ? "none" : zones.some((z) => z.id === i.zoneId) ? i.zoneId : "auto", duty: { shift: text(i.duty?.shift, 120), reportingOfficer: text(i.duty?.reportingOfficer, 120), notes: text(i.duty?.notes, 1e3) }, officers };
  });
  return { version: 3, items, zones };
}
function pointInside(point, polygon) {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    const cross = (x - xi) * (yj - yi) - (y - yi) * (xj - xi);
    if (Math.abs(cross) < 1e-10 && x >= Math.min(xi, xj) - 1e-10 && x <= Math.max(xi, xj) + 1e-10 && y >= Math.min(yi, yj) - 1e-10 && y <= Math.max(yi, yj) + 1e-10) return true;
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function zoneFor(item, zones) {
  if (item.zoneId === "none") return null;
  if (item.zoneId !== "auto") return zones.some((z) => z.id === item.zoneId) ? item.zoneId : null;
  return [...zones].reverse().find((z) => pointInside([item.x, item.y], z.points))?.id ?? null;
}
function totals(items, zones) {
  return [...zones.map((z) => ({ id: z.id, name: z.name, color: z.color })), { id: "none", name: "Unassigned", color: "#a8bacb" }].map((z) => {
    const groups = items.filter((i) => (zoneFor(i, zones) ?? "none") === z.id), staff = groups.filter((i) => i.type === "officer" || i.type === "traffic");
    return { ...z, staff: staff.reduce((n, i) => n + i.qty, 0), named: staff.reduce((n, i) => n + i.officers.filter((o) => o.name.trim()).length, 0), barricades: groups.filter((i) => i.type === "barricade").reduce((n, i) => n + i.qty, 0) };
  });
}
