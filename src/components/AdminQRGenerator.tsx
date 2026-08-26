import { getLocalDateString } from '../utils/dateUtils';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, RefreshCw } from 'lucide-react';

export const AdminQRGenerator: React.FC = () => {
  const [qrData, setQrData] = useState<string>('');
  
  const generateDailyQR = () => {
    const today = getLocalDateString(new Date());
    const uniqueString = Math.random().toString(36).substring(2, 8).toUpperCase();
    setQrData(`ABSEN-${today}-${uniqueString}`);
  };

  useEffect(() => {
    generateDailyQR();
  }, []);

  return (
    <div className="h-full p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg flex flex-col items-center justify-center">
      <div className="flex items-center space-x-2 mb-4 w-full justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <QrCode className="w-5 h-5 text-amber-600 mr-2" />
          QR Absensi Hari Ini
        </h3>
        <button 
          onClick={generateDailyQR}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Perbarui QR Code"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        {qrData ? (
          <QRCodeSVG value={qrData} size={200} level="H" />
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 text-slate-400">
            Loading...
          </div>
        )}
      </div>
      
      <p className="text-xs text-center text-slate-500 mt-4 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
        {qrData}
      </p>
      
      <p className="text-[10px] text-center text-slate-400 mt-2 max-w-xs">
        Tampilkan kode QR ini kepada pejuang agar mereka dapat memindainya menggunakan pemindai QR di halaman absensi mereka.
      </p>
    </div>
  );
};
