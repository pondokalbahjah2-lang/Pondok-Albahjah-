const fs = require('fs');
let content = fs.readFileSync('src/components/IzinKeluarView.tsx', 'utf-8');
content = content.replace(
  `                      {rec.status !== 'Menunggu Persetujuan' && (
                        <button
                          onClick={() => handleGeneratePDF(rec)}`,
  `                      {rec.status !== 'Menunggu Persetujuan' && rec.status !== 'Ditolak' && (
                        <button
                          onClick={() => handleGeneratePDF(rec)}`
);
fs.writeFileSync('src/components/IzinKeluarView.tsx', content);

let cutiContent = fs.readFileSync('src/components/CutiView.tsx', 'utf-8');
cutiContent = cutiContent.replace(
  `                      {req.status === 'Disetujui' && (currentUser.role === 'Admin' || req.pejuangId === currentUser.id) && (
                        <button
                          onClick={() => handleGenerateCetakPDF(req)}`,
  `                      {req.status === 'Disetujui' && (currentUser.role === 'Admin' || req.pejuangId === currentUser.id) && (
                        <button
                          onClick={() => handleGenerateCetakPDF(req)}`
);
// In Cuti it is already correct (status === 'Disetujui')
