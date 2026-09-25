import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const getMapLogic = (latVar: string, lngVar: string, ctxVar: string, canvasVar: string, bgHeightVar: string) => `
          // MAP OVERLAY LOGIC
          if (${latVar} && ${lngVar}) {
             try {
                const zoom = 15;
                const x = Math.floor((${lngVar} + 180) / 360 * Math.pow(2, zoom));
                const y = Math.floor((1 - Math.log(Math.tan(${latVar} * Math.PI / 180) + 1 / Math.cos(${latVar} * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
                
                const mapImg = new Image();
                mapImg.crossOrigin = 'Anonymous';
                // ArcGIS is reliable for CORS canvas usage
                mapImg.src = \`https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/\${zoom}/\${y}/\${x}\`;
                
                await new Promise((resolve) => {
                   mapImg.onload = resolve;
                   mapImg.onerror = resolve; 
                   setTimeout(resolve, 2000); 
                });
                
                const mapSize = Math.max(100, Math.floor(${canvasVar}.width / 3.5));
                const mapX = ${canvasVar}.width - mapSize - 10;
                const mapY = ${canvasVar}.height - ${bgHeightVar} - mapSize - 10; 
                
                if (mapImg.complete && mapImg.naturalWidth > 0) {
                    ${ctxVar}.save();
                    const radius = 10;
                    ${ctxVar}.beginPath();
                    ${ctxVar}.moveTo(mapX + radius, mapY);
                    ${ctxVar}.lineTo(mapX + mapSize - radius, mapY);
                    ${ctxVar}.quadraticCurveTo(mapX + mapSize, mapY, mapX + mapSize, mapY + radius);
                    ${ctxVar}.lineTo(mapX + mapSize, mapY + mapSize - radius);
                    ${ctxVar}.quadraticCurveTo(mapX + mapSize, mapY + mapSize, mapX + mapSize - radius, mapY + mapSize);
                    ${ctxVar}.lineTo(mapX + radius, mapY + mapSize);
                    ${ctxVar}.quadraticCurveTo(mapX, mapY + mapSize, mapX, mapY + mapSize - radius);
                    ${ctxVar}.lineTo(mapX, mapY + radius);
                    ${ctxVar}.quadraticCurveTo(mapX, mapY, mapX + radius, mapY);
                    ${ctxVar}.closePath();
                    ${ctxVar}.clip();
                    ${ctxVar}.drawImage(mapImg, mapX, mapY, mapSize, mapSize);
                    ${ctxVar}.restore();
                    
                    ${ctxVar}.fillStyle = 'red';
                    ${ctxVar}.beginPath();
                    ${ctxVar}.arc(mapX + mapSize/2, mapY + mapSize/2, 6, 0, 2 * Math.PI);
                    ${ctxVar}.fill();
                    ${ctxVar}.strokeStyle = 'white';
                    ${ctxVar}.lineWidth = 2;
                    ${ctxVar}.stroke();
                    
                    ${ctxVar}.strokeStyle = 'white';
                    ${ctxVar}.lineWidth = 3;
                    ${ctxVar}.beginPath();
                    ${ctxVar}.moveTo(mapX + radius, mapY);
                    ${ctxVar}.lineTo(mapX + mapSize - radius, mapY);
                    ${ctxVar}.quadraticCurveTo(mapX + mapSize, mapY, mapX + mapSize, mapY + radius);
                    ${ctxVar}.lineTo(mapX + mapSize, mapY + mapSize - radius);
                    ${ctxVar}.quadraticCurveTo(mapX + mapSize, mapY + mapSize, mapX + mapSize - radius, mapY + mapSize);
                    ${ctxVar}.lineTo(mapX + radius, mapY + mapSize);
                    ${ctxVar}.quadraticCurveTo(mapX, mapY + mapSize, mapX, mapY + mapSize - radius);
                    ${ctxVar}.lineTo(mapX, mapY + radius);
                    ${ctxVar}.quadraticCurveTo(mapX, mapY, mapX + radius, mapY);
                    ${ctxVar}.stroke();
                }
             } catch (e) {
               console.error("Map overlay error", e);
             }
          }
`;

const captureReplacement = `  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const now = new Date();
        const timeStr = now.toLocaleString('id-ID');
        const locStr = currentLat && currentLng ? \`Lokasi: \${currentLat.toFixed(5)}, \${currentLng.toFixed(5)} (\${distanceMeters}m)\` : 'Lokasi GPS Belum Tersedia';
        const fontSize = Math.max(14, Math.floor(canvas.width / 30));
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const padding = 10;
        const bgHeight = (fontSize * 2) + padding * 3;
        ctx.fillRect(0, canvas.height - bgHeight, canvas.width, bgHeight);
        
        ctx.font = \`bold \${fontSize}px sans-serif\`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(\`Waktu: \${timeStr} | Al-Bahjah Cirebon 1\`, padding, canvas.height - bgHeight + padding + (fontSize / 2));
        ctx.fillText(locStr, padding, canvas.height - padding - (fontSize / 2));
        ${getMapLogic('currentLat', 'currentLng', 'ctx', 'canvas', 'bgHeight')}
        setPhotoPreview(canvas.toDataURL('image/jpeg', 0.85));
      }
      stopCamera();
    }
  };`;

const regex = /  const capturePhoto = async \(\) => \{[\s\S]*?stopCamera\(\);\n    \}\n  \};/;
if (regex.test(content)) {
    content = content.replace(regex, captureReplacement);
    console.log("Success replacing capturePhoto");
}

const quickRegex = /        const canvas = document.createElement\('canvas'\);\n        canvas.width = video.videoWidth;\n        canvas.height = video.videoHeight;\n        const ctx = canvas.getContext\('2d'\);\n        if \(ctx\) \{\n          ctx.drawImage\(video, 0, 0, canvas.width, canvas.height\);[\s\S]*?finalPhoto = canvas.toDataURL\('image\/png'\);\n        \}\n        \n        mediaStream.getTracks\(\).forEach\(track => track.stop\(\)\);\n      \}/;

const quickReplacement = `        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const now = new Date();
          const timeStr = now.toLocaleString('id-ID');
          const locStr = \`Lokasi: \${lat.toFixed(5)}, \${lng.toFixed(5)} (\${dist}m)\`;
          const fontSize = Math.max(14, Math.floor(canvas.width / 30));
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          const padding = 10;
          const bgHeight = (fontSize * 2) + padding * 3;
          ctx.fillRect(0, canvas.height - bgHeight, canvas.width, bgHeight);
          
          ctx.font = \`bold \${fontSize}px sans-serif\`;
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.fillText(\`Waktu: \${timeStr} | Al-Bahjah Cirebon 1\`, padding, canvas.height - bgHeight + padding + (fontSize / 2));
          ctx.fillText(locStr, padding, canvas.height - padding - (fontSize / 2));
          ${getMapLogic('lat', 'lng', 'ctx', 'canvas', 'bgHeight')}
          finalPhoto = canvas.toDataURL('image/png');
        }
        
        mediaStream.getTracks().forEach(track => track.stop());
      }`;

if (quickRegex.test(content)) {
    content = content.replace(quickRegex, quickReplacement);
    console.log("Success replacing quick check in");
}

fs.writeFileSync('src/components/AbsensiView.tsx', content);
