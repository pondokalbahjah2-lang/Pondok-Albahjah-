with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

# Fix activeListModal type
content = content.replace("type ActiveModalType = 'hadir' | 'terlambat' | 'sakit' | 'libur' | 'belumAbsen';", "type ActiveModalType = 'hadir' | 'terlambat' | 'sakit' | 'libur' | 'belumAbsen' | 'izinTdkMasuk';")

# Fix todayStats
todayStats_old = """    return {
      total: totalPejuang,
      hadir: hadirList.length,
      terlambat: terlambatList.length,
      sakit: sakitList.length,
      libur: liburList.length,
      belumAbsen: belumAbsenList.length,
      lists: {
        hadir: hadirList,
        terlambat: terlambatList,
        sakit: sakitList,
        libur: liburList,
        belumAbsen: belumAbsenList
      }
    };"""

todayStats_new = """    return {
      total: totalPejuang,
      hadir: hadirList.length,
      terlambat: terlambatList.length,
      sakit: sakitList.length,
      libur: liburList.length,
      izin: izinList.length,
      belumAbsen: belumAbsenList.length,
      lists: {
        hadir: hadirList,
        terlambat: terlambatList,
        sakit: sakitList,
        libur: liburList,
        izinTdkMasuk: izinList,
        belumAbsen: belumAbsenList
      }
    };"""

content = content.replace(todayStats_old, todayStats_new)

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content)
