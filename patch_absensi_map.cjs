const fs = require('fs');
let content = fs.readFileSync('src/components/AbsensiView.tsx', 'utf8');

// Add state for selectedMapRecord
content = content.replace(
  "const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang'>('Hadir');",
  "const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang'>('Hadir');\n  const [selectedMapRecord, setSelectedMapRecord] = useState<AttendanceRecord | null>(null);"
);

// Add "Lihat Peta" button to the "Jarak dari Pondok" cell
// Replace rec.distanceMeters.toFixed(1) + ' meter' area
const distanceCellStart = `<td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={\`font-bold text-xs \${
                              rec.isWithinRadius
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }\`}
                          >
                            {rec.distanceMeters.toFixed(1)} meter
                          </span>
                        </div>
                      </td>`;
// Wait, I don't know the exact lines, let's just find "rec.distanceMeters.toFixed(1) + ' meter'"
// Let's use grep to see the exact structure.
