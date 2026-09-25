with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

modal_title_old = """                  {activeListModal === 'hadir' && 'Daftar Hadir Tepat Waktu'}
                  {activeListModal === 'terlambat' && 'Daftar Terlambat Hadir'}
                  {activeListModal === 'sakit' && 'Daftar Pejuang Sakit'}
                  {activeListModal === 'libur' && 'Daftar Pejuang Libur/Cuti'}
                  {activeListModal === 'belumAbsen' && 'Daftar Belum Absen'}"""

modal_title_new = """                  {activeListModal === 'hadir' && 'Daftar Hadir Tepat Waktu'}
                  {activeListModal === 'terlambat' && 'Daftar Terlambat Hadir'}
                  {activeListModal === 'sakit' && 'Daftar Pejuang Sakit'}
                  {activeListModal === 'libur' && 'Daftar Pejuang Libur/Cuti'}
                  {activeListModal === 'belumAbsen' && 'Daftar Belum Absen'}
                  {activeListModal === 'izinTdkMasuk' && 'Daftar Izin Tidak Masuk'}"""

content = content.replace(modal_title_old, modal_title_new)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
