const zoom = 15;
const lat = -6.7320;
const lng = 108.5523;
const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
console.log(`x: ${x}, y: ${y}`);
console.log(`ArcGIS URL: https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${y}/${x}`);
