import re

with open("src/types.ts", "r") as f:
    content = f.read()

kajian_type = """
export interface KajianRecord {
  id: string;
  pejuangId: string;
  pejuangName: string;
  subDivisi: string;
  date: string;
  kajianName: string;
  mode: 'Offline' | 'Online';
  latitude?: number;
  longitude?: number;
  isWithinRadius?: boolean;
  attendancePhotoUrl?: string; // Gdrive Link
  notesPhotoUrl?: string; // Gdrive Link
}
"""

content += kajian_type

with open("src/types.ts", "w") as f:
    f.write(content)
