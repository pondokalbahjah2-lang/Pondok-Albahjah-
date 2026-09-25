import fs from 'fs';
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf-8');

const regex = /      getPos\(\{ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 \}\)\n        \.catch\(\(\) => getPos\(\{ enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 \}\)\)/;

const replacement = `      getPos({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
        .catch(() => getPos({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }))`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/components/AbsensiView.tsx', content);
    console.log("Success replacing geolocation options");
} else {
    console.log("Regex failed to match geolocation options");
}
