import re

with open("src/types.ts", "r") as f:
    content = f.read()

content = content.replace("status: 'Di Luar' | 'Kembali Tepat Waktu' | 'Terlambat' | 'Menunggu Persetujuan';", "status: 'Di Luar' | 'Kembali Tepat Waktu' | 'Terlambat' | 'Menunggu Persetujuan' | 'Ditolak';")

with open("src/types.ts", "w") as f:
    f.write(content)

