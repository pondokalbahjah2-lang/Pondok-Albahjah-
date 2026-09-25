with open("src/components/SettingsView.tsx", "r") as f:
    content = f.read()

target = "Jalankan Pembersihan Data (> 3 Bulan)"
replacement = "Jalankan Pembersihan Data (&gt; 3 Bulan)"

target2 = "Optimalisasi Database"
target2_repl = "Optimalisasi Database"

target3 = "yang usianya lebih dari 3 bulan"

with open("src/components/SettingsView.tsx", "w") as f:
    f.write(content.replace(target, replacement))
