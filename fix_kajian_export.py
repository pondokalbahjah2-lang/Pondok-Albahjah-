import re
with open("src/components/KajianView.tsx", "r") as f:
    content = f.read()

# Add imports
if "import * as XLSX" not in content:
    content = content.replace("import { LocationMap } from './LocationMap';", "import { LocationMap } from './LocationMap';\nimport * as XLSX from 'xlsx';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';")

# Update export functions
export_old = """  const handleDownloadCsv = () => {
    const header = "Nama Pejuang,Sub Divisi,Tanggal,Nama Kajian,Mode,Bukti Hadir,Bukti Catatan\\n";
    const rows = filteredRecords.map(r => 
      `${r.pejuangName},${r.subDivisi},${r.date},${r.kajianName},${r.mode},${r.attendancePhotoUrl ? 'Ada' : 'Tidak Ada'},${r.notesPhotoUrl ? 'Ada' : 'Tidak Ada'}`
    ).join("\\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Laporan_Kajian_${filterStartDate}_sd_${filterEndDate}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };"""

export_new = """  const handleDownloadExcel = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const data = filteredRecords.map(r => ({
      'Tanggal': r.date,
      'Nama Pejuang': r.pejuangName,
      'Sub Divisi': r.subDivisi,
      'Kajian': r.kajianName,
      'Mode': r.mode,
      'Link Hadir': r.attendancePhotoUrl || '-',
      'Link Catatan': r.notesPhotoUrl || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kajian");
    XLSX.writeFile(wb, `Laporan_Kajian_${filterStartDate}_sd_${filterEndDate}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const doc = new jsPDF('landscape');
    doc.text(`Laporan Absensi Kajian Buya Yahya (${filterStartDate} s/d ${filterEndDate})`, 14, 15);
    
    const tableData = filteredRecords.map(r => [
      r.date, r.pejuangName, r.subDivisi, r.kajianName, r.mode, r.attendancePhotoUrl ? 'Ada' : '-', r.notesPhotoUrl ? 'Ada' : '-'
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['Tanggal', 'Nama Pejuang', 'Sub Divisi', 'Kajian', 'Mode', 'Link Hadir', 'Link Catatan']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`Laporan_Kajian_${filterStartDate}_sd_${filterEndDate}.pdf`);
  };"""

content = content.replace(export_old, export_new)

# Update buttons
btn_old = """            <button onClick={handleDownloadCsv} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Unduh Laporan Excel/CSV
            </button>"""

btn_new = """            <div className="flex gap-2">
              <button onClick={handleDownloadExcel} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button onClick={handleDownloadPDF} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>"""

content = content.replace(btn_old, btn_new)

with open("src/components/KajianView.tsx", "w") as f:
    f.write(content)
