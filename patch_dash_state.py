with open("src/components/DashboardView.tsx", "r") as f:
    content = f.read()

target = "const [selectedSubDivisi, setSelectedSubDivisi] = useState('Semua');"
replacement = """const [selectedSubDivisi, setSelectedSubDivisi] = useState('Semua');
  const [activeListModal, setActiveListModal] = useState<'hadir' | 'terlambat' | 'sakit' | 'libur' | 'belumAbsen' | null>(null);"""

with open("src/components/DashboardView.tsx", "w") as f:
    f.write(content.replace(target, replacement))
