import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

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
        
        // MAP OVERLAY LOGIC using Static Google Maps or alternative since we have latitude/longitude
        if (currentLat && currentLng) {
           try {
              const zoom = 15;
              const x = Math.floor((currentLng + 180) / 360 * Math.pow(2, zoom));
              const y = Math.floor((1 - Math.log(Math.tan(currentLat * Math.PI / 180) + 1 / Math.cos(currentLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
              
              const mapImg = new Image();
              mapImg.crossOrigin = 'Anonymous';
              // Use standard OSM tiles
              mapImg.src = \`https://tile.openstreetmap.org/\${zoom}/\${x}/\${y}.png\`;
              
              await new Promise((resolve) => {
                 mapImg.onload = resolve;
                 mapImg.onerror = resolve; // Continue even if map fails
                 setTimeout(resolve, 2000); // 2 sec timeout
              });
              
              const mapSize = Math.max(100, Math.floor(canvas.width / 3.5));
              const mapX = canvas.width - mapSize - 10;
              const mapY = canvas.height - bgHeight - mapSize - 10; // Draw above the text bar
              
              if (mapImg.complete && mapImg.naturalWidth > 0) {
                  // Save context for clipping
                  ctx.save();
                  
                  // Create rounded rectangle path for clipping
                  const radius = 10;
                  ctx.beginPath();
                  ctx.moveTo(mapX + radius, mapY);
                  ctx.lineTo(mapX + mapSize - radius, mapY);
                  ctx.quadraticCurveTo(mapX + mapSize, mapY, mapX + mapSize, mapY + radius);
                  ctx.lineTo(mapX + mapSize, mapY + mapSize - radius);
                  ctx.quadraticCurveTo(mapX + mapSize, mapY + mapSize, mapX + mapSize - radius, mapY + mapSize);
                  ctx.lineTo(mapX + radius, mapY + mapSize);
                  ctx.quadraticCurveTo(mapX, mapY + mapSize, mapX, mapY + mapSize - radius);
                  ctx.lineTo(mapX, mapY + radius);
                  ctx.quadraticCurveTo(mapX, mapY, mapX + radius, mapY);
                  ctx.closePath();
                  ctx.clip();
                  
                  ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);
                  
                  // Restore context
                  ctx.restore();
                  
                  // Draw a red dot for marker in center
                  ctx.fillStyle = 'red';
                  ctx.beginPath();
                  ctx.arc(mapX + mapSize/2, mapY + mapSize/2, 6, 0, 2 * Math.PI);
                  ctx.fill();
                  ctx.strokeStyle = 'white';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                  
                  // Draw border around map
                  ctx.strokeStyle = 'white';
                  ctx.lineWidth = 3;
                  // Need to draw rounded rect border again manually
                  ctx.beginPath();
                  ctx.moveTo(mapX + radius, mapY);
                  ctx.lineTo(mapX + mapSize - radius, mapY);
                  ctx.quadraticCurveTo(mapX + mapSize, mapY, mapX + mapSize, mapY + radius);
                  ctx.lineTo(mapX + mapSize, mapY + mapSize - radius);
                  ctx.quadraticCurveTo(mapX + mapSize, mapY + mapSize, mapX + mapSize - radius, mapY + mapSize);
                  ctx.lineTo(mapX + radius, mapY + mapSize);
                  ctx.quadraticCurveTo(mapX, mapY + mapSize, mapX, mapY + mapSize - radius);
                  ctx.lineTo(mapX, mapY + radius);
                  ctx.quadraticCurveTo(mapX, mapY, mapX + radius, mapY);
                  ctx.stroke();
              }
           } catch (e) {
             console.error("Map overlay error", e);
           }
        }
        
        setPhotoPreview(canvas.toDataURL('image/jpeg', 0.85));
      }
      stopCamera();
    }
  };`;

const regex = /  const capturePhoto = \(\) => \{[\s\S]*?stopCamera\(\);\n    \}\n  \};/;
if (regex.test(content)) {
    content = content.replace(regex, captureReplacement);
    fs.writeFileSync('src/components/AbsensiView.tsx', content);
    console.log("Success replacing");
} else {
    console.log("Regex failed to match");
}
