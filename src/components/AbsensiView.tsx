import { getLocalDateString } from '../utils/dateUtils';
import React, { useState, useEffect, useRef } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import jsQR from 'jsqr';
import { LocationMap } from './LocationMap';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  X,
  ZoomIn,
  QrCode,
  LogOut
} from 'lucide-react';
import {
  UserAccount,
  AttendanceRecord,
  LocationSettings,
  WorkSchedule,
} from '../types';
import { calculateDistanceMeters } from '../utils/storage';

interface AbsensiViewProps {
  currentUser: UserAccount;
  attendance: AttendanceRecord[];
  locationSettings: LocationSettings;
  schedules: WorkSchedule[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  currentUser,
  attendance,
  locationSettings,
  schedules,
  onSaveAttendance,
}) => {
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Libur' | 'Pulang'>('Hadir');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [isScanningQR, setIsScanningQR] = useState(false);
  const animationRef = useRef<number | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedMapRecord, setSelectedMapRecord] = useState<AttendanceRecord | null>(null);

  // Attach stream to videoRef when camera is open
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  // Locate GPS position on mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanningQR) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          setNotes(`Hadir via QR Code: ${code.data}`);
          setIsScanningQR(false);
          capturePhoto();
          alert('QR Code terdeteksi! Mengambil foto...');
          return;
        }
      }
    }
    
    if (isScanningQR) {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  useEffect(() => {
    if (isScanningQR && isCameraOpen) {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isScanningQR, isCameraOpen]);


  useEffect(() => {
    let watchId: number;
    if ('geolocation' in navigator) {
      setIsLocating(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);

          const dist = calculateDistanceMeters(
            lat,
            lng,
            locationSettings.latitude,
            locationSettings.longitude
          );
          setDistanceMeters(dist);
          setIsLocating(false);
          setLocError('');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          let errMsg = 'Gagal mengambil lokasi.';
          if (err.code === err.PERMISSION_DENIED) errMsg = 'Izin akses lokasi (GPS) ditolak oleh browser. Mohon izinkan akses lokasi atau coba buka app di tab baru.';
          if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Informasi lokasi tidak tersedia saat ini. Pastikan GPS perangkat menyala.';
          if (err.code === err.TIMEOUT) errMsg = 'Waktu permintaan lokasi habis (timeout). Coba lagi di area terbuka.';
          setLocError(errMsg);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setLocError('Browser Anda tidak mendukung Geolocation.');
    }

    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationSettings.latitude, locationSettings.longitude]);

  // Keep the old handler but just have it retry fetching the latest explicitly if they click refresh
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);

          const dist = calculateDistanceMeters(
            lat,
            lng,
            locationSettings.latitude,
            locationSettings.longitude
          );
          setDistanceMeters(dist);
          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };


  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = async () => {
    if (!currentLat || !currentLng) {
      handleGetLocation();
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Gagal mengakses kamera perangkat: ' + err);
    }
  };

  const toggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isCameraOpen) {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newMode }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Gagal mengubah kamera:', err);
      }
    }
  };

  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // existing stopCamera
  const stopCamera = () => {

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
    setIsScanningQR(false);
  };

  const startQRScanner = async () => {
    // Prefer back camera for QR code scanning
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setFacingMode('environment');
      setStream(mediaStream);
      setIsCameraOpen(true);
      setIsScanningQR(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Gagal mengakses kamera perangkat: ' + err);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const now = new Date();
        const timeStr = now.toLocaleString('id-ID');
        const locStr = currentLat && currentLng ? `Lokasi: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)} (${distanceMeters}m)` : 'Lokasi GPS Belum Tersedia';
        const fontSize = Math.max(14, Math.floor(canvas.width / 30));
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const padding = 10;
        const bgHeight = (fontSize * 2) + padding * 3;
        ctx.fillRect(0, canvas.height - bgHeight, canvas.width, bgHeight);
        
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Waktu: ${timeStr} | Al-Bahjah Cirebon 1`, padding, canvas.height - bgHeight + padding + (fontSize / 2));
        ctx.fillText(locStr, padding, canvas.height - padding - (fontSize / 2));
        
          // MAP OVERLAY LOGIC
          if (currentLat && currentLng) {
             try {
                const zoom = 15;
                const x = Math.floor((currentLng + 180) / 360 * Math.pow(2, zoom));
                const y = Math.floor((1 - Math.log(Math.tan(currentLat * Math.PI / 180) + 1 / Math.cos(currentLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
                
                const mapImg = new Image();
                mapImg.crossOrigin = 'Anonymous';
                // ArcGIS is reliable for CORS canvas usage
                mapImg.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${y}/${x}`;
                
                await new Promise((resolve) => {
                   mapImg.onload = resolve;
                   mapImg.onerror = resolve; 
                   setTimeout(resolve, 2000); 
                });
                
                const mapSize = Math.max(100, Math.floor(canvas.width / 3.5));
                const mapX = canvas.width - mapSize - 10;
                const mapY = canvas.height - bgHeight - mapSize - 10; 
                
                if (mapImg.complete && mapImg.naturalWidth > 0) {
                    ctx.save();
                    const radius = 10;
                    ctx.beginPath();
                    ctx.moveTo(mapX + radius, mapY);
                    ctx.lineTo(mapX + mapSize - radius, mapY);
                    ctx.quadraticCurveTo(mapX + mapSize, mapY, mapX + mapSize, mapY + radius);
                    ctx.lineTo(mapX + mapSize, mapY + mapSize - radius);
                    ctx.quadraticCurveTo(mapX + mapSize, mapY + mapSize, mapX + mapSize - radius, mapY + mapSize);
                    ctx.lineTo(mapX + radius, mapY + mapSize);
                    ctx.quadraticCurveTo(mapX, mapY + mapSize, mapX, mapY + mapSize - radius);
                    ctx.lineTo(mapX, mapY + radius);
                    ctx.quadraticCurveTo(mapX, mapY, mapX + radius, mapY);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);
                    ctx.restore();
                    
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(mapX + mapSize/2, mapY + mapSize/2, 6, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(mapX + radius, mapY);
                    ctx.lineTo(mapX + mapSize - radius, mapY);
                    ctx.quadraticCurveTo(mapX + mapSize, mapY, mapX + mapSize, mapY + radius);
                    ctx.lineTo(mapX + mapSize, mapY + mapSize - radius);
                    ctx.quadraticCurveTo(mapX + mapSize, mapY + mapSize, mapX + mapSize - radius, mapY + mapSize);
                    ctx.lineTo(mapX + radius, mapY + mapSize);
                    ctx.quadraticCurveTo(mapX, mapY + mapSize, mapX, mapY + mapSize - radius);
                    ctx.lineTo(mapX, mapY + radius);
                    ctx.quadraticCurveTo(mapX, mapY, mapX + radius, mapY);
                    ctx.stroke();
                }
             } catch (e) {
               console.error("Map overlay error", e);
             }
          }

        setPhotoPreview(canvas.toDataURL('image/jpeg', 0.85));
      }
      stopCamera();
    }
  };


  const isWithinRadius =
    distanceMeters !== null && distanceMeters <= locationSettings.radiusMaxMeters;

  
  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoPreview && attendanceStatus !== 'Libur') {
      if (attendanceStatus === 'Sakit') {
        alert('Silakan ambil foto atau unggah surat keterangan sakit Anda terlebih dahulu sebagai bukti.');
      } else {
        alert('Silakan ambil atau unggah foto kehadiran Anda terlebih dahulu.');
      }
      return;
    }

    if (attendanceStatus !== 'Sakit' && attendanceStatus !== 'Libur' && !isWithinRadius && currentUser.role === 'Pejuang') {
      alert(`Absen ditolak: Anda berada di luar radius Pondok (${distanceMeters}m / Maks ${locationSettings.radiusMaxMeters}m).`);
      return;
    }
    
    if (!currentLat || !currentLng) {
      if (attendanceStatus !== 'Libur' && attendanceStatus !== 'Sakit') {
        alert('Tunggu hingga lokasi GPS Anda ditemukan (klik Cek Lokasi GPS) sebelum mengirim absensi.');
        return;
      }
    }

    const now = new Date();
    const dateStr = getLocalDateString(now);
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (attendanceStatus === 'Pulang') {
      if (!isClockedIn) {
        alert('Anda belum melakukan absen masuk hari ini. Silakan pilih status Hadir terlebih dahulu.');
        return;
      }
      if (isClockedOut) {
        alert('Anda sudah melakukan absen pulang hari ini.');
        return;
      }

      // Check work schedule for jam pulang
      const userSchedule = schedules.find(
        (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
      ) || schedules[0];
      
      const [currH, currM] = timeStr.replace('.', ':').split(':').map(Number);
      const [schPulangH, schPulangM] = (userSchedule?.jamPulang || '16:00').split(':').map(Number);
      let pulangNotes = todayRecord!.notes;
      if ((currH * 60 + currM) < (schPulangH * 60 + schPulangM)) {
        const confirmEarly = window.confirm(`Jam pulang yang ditetapkan adalah ${userSchedule?.jamPulang || '16:00'}. Anda yakin ingin pulang lebih awal?`);
        if (!confirmEarly) return;
        pulangNotes = (pulangNotes ? pulangNotes + ' | ' : '') + 'Pulang Lebih Awal';
      }

      // Clock out
      const updatedRecord = {
        ...todayRecord!,
        timePulang: timeStr,
        photoPulangUrl: photoPreview,
        notes: pulangNotes
      };
      
      const updatedAttendance = attendance.map(a => a.id === updatedRecord.id ? updatedRecord : a);
      onSaveAttendance(updatedAttendance);
      setPhotoPreview('');
      setNotes('');
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      alert(`Jam Pulang Berhasil Dicatat: ${timeStr}`);
      return;
    }

    if (isClockedIn) {
      alert('Anda sudah melakukan absen masuk hari ini. Pilih status Pulang untuk absen keluar.');
      return;
    }

    // Check work schedule
    const userSchedule = schedules.find(
      (s) => s.targetName.includes(currentUser.subDivisi) || s.targetId === currentUser.id
    ) || schedules[0];

    let finalStatus: AttendanceRecord['status'] = attendanceStatus;

    if (attendanceStatus === 'Hadir') {
      const [currH, currM] = timeStr.replace('.', ':').split(':').map(Number);
      const [schH, schM] = (userSchedule?.jamMasuk || '04:30').split(':').map(Number);
      if ((currH * 60 + currM) > (schH * 60 + schM)) {
        finalStatus = 'Terlambat';
      }
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      pejuangId: currentUser.id,
      pejuangName: currentUser.name,
      subDivisi: currentUser.subDivisi,
      date: dateStr,
      time: timeStr,
      photoUrl: photoPreview,
      latitude: currentLat || 0,
      longitude: currentLng || 0,
      distanceFromPondok: distanceMeters || 0,
      status: finalStatus,
      isWithinRadius: isWithinRadius,
      notes: notes || `Absensi melalui sistem web app (${isWithinRadius ? 'Dalam Radius' : 'Luar Radius'})`,
    };

    onSaveAttendance([newRecord, ...attendance]);
    setPhotoPreview('');
    setNotes('');
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    alert(`Absensi Kehadiran Berhasil Ditambahkan dengan Status: ${finalStatus}`);
  };

  // Filter attendance for view
  const myAttendance = attendance.filter((a) =>
    currentUser.role === 'Admin' ? true : a.pejuangId === currentUser.id
  );

    const todayDateStr = getLocalDateString(new Date());
  const todayRecord = myAttendance.find(a => a.date === todayDateStr && a.pejuangId === currentUser.id);
  const uncompletedPastRecord = myAttendance.find(a => a.pejuangId === currentUser.id && a.date !== todayDateStr && !a.timePulang && a.status !== 'Sakit' && a.status !== 'Libur' && a.status !== 'Cuti');
  const isClockedIn = !!todayRecord;
  const isClockedOut = !!(todayRecord && (todayRecord.timePulang || todayRecord.status === 'Sakit' || todayRecord.status === 'Libur' || todayRecord.status === 'Cuti'));

  useEffect(() => {
    if (isClockedIn && !isClockedOut) {
      setAttendanceStatus('Pulang');
    }
  }, [isClockedIn, isClockedOut]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Presensi Kehadiran Foto & Geofencing GPS</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            Absensi Kehadiran Pejuang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verifikasi swafoto foto diri dan lokasi presensi berada di lingkungan Pondok Pesantren
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-100">
              {locationSettings.addressName}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Radius Maksimal: {locationSettings.radiusMaxMeters} Meter
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Absensi + Verification Card */}
      {uncompletedPastRecord && !isClockedIn && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Peringatan: Tidak Absen Pulang Kemarin</h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
              Sistem mencatat Anda tidak melakukan absen pulang pada tanggal {uncompletedPastRecord.date}. 
              Laporan kehadiran Anda pada hari tersebut ditandai "Tidak Absen Pulang". 
              Silakan lakukan absen masuk untuk hari ini.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Absensi Action Card */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isClockedOut ? 'Presensi Hari Ini Selesai' : isClockedIn ? 'Form Jam Pulang Hari Ini' : 'Form Presensi Hari Ini'}</span>
          </h2>

          <form onSubmit={handleSubmitAttendance} className="space-y-4">
            {/* Status Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Pilih Status Kehadiran
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                {(['Hadir', 'Sakit', 'Libur', 'Pulang'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAttendanceStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      attendanceStatus === st
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Location GPS Status Widget */}
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lokasi GPS Anda</span>
                </span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLocating ? (
                <div className="text-xs text-slate-500 animate-pulse">
                  Mendeteksi lokasi GPS...
                </div>
              ) : distanceMeters !== null ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        isWithinRadius ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span
                      className={`font-bold text-xs ${
                        isWithinRadius
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isWithinRadius
                        ? 'Lokasi Valid (Di Lingkungan Pondok)'
                        : 'Di Luar Radius Pondok'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Jarak dari titik Pondok: <strong className="text-slate-800 dark:text-slate-100">{distanceMeters} meter</strong> (Maks: {locationSettings.radiusMaxMeters}m)
                  </div>
                  {currentLat && currentLng && (
                    <div className="mt-2 relative z-0">
                      <LocationMap 
                        userLat={currentLat}
                        userLng={currentLng}
                        pondokLat={locationSettings.latitude}
                        pondokLng={locationSettings.longitude}
                        radius={locationSettings.radiusMaxMeters}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-rose-500 font-medium">
                    {locError || 'Gagal mendapatkan koordinat lokasi GPS'}
                  </div>

                </div>
              )}
            </div>

            {/* Photo Viewfinder Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Foto Kehadiran (Wajib Swafoto)
              </label>

              <div className="relative aspect-[3/4] md:aspect-video rounded-2xl bg-white/10 dark:bg-slate-900/20 backdrop-blur-[5px] border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                {isCameraOpen ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {isCameraOpen && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                        <div className="w-full max-w-[250px] aspect-square rounded-3xl border-4 border-amber-500/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-400 shadow-[0_0_10px_2px_rgba(99,102,241,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                      </div>
                    )}
                  </>
                ) : photoPreview ? (
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
                    <img
                      src={photoPreview}
                      alt="Absensi Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">
                      Aktifkan kamera untuk mengambil swafoto kehadiran
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isCameraOpen ? (
                  <>
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold text-center flex items-center justify-center transition-colors"
                      title="Ubah Kamera Depan/Belakang"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Ambil Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold text-center flex items-center justify-center transition-colors"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  
                  <div className="flex space-x-2 w-full flex-col gap-2">
                    <div className="flex space-x-2 w-full">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Buka Kamera ({facingMode === 'user' ? 'Depan' : 'Belakang'})</span>
                      </button>
                      <button
                        type="button"
                        onClick={startQRScanner}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                      >
                         <QrCode className="w-4 h-4" />
                        <span>Scan QR Absensi</span>
                      </button>
                    </div>
                    {attendanceStatus === 'Sakit' && (
                      <div className="relative w-full">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold text-center shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          <span>Atau Upload Surat Sakit (Gambar)</span>
                        </button>
                      </div>
                    )}
                  </div>

                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Catatan Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Piket Subuh / Persiapan Mengajar"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {isClockedOut ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-2xl bg-slate-300 dark:bg-slate-700 text-slate-500 font-extrabold text-xs transition-all cursor-not-allowed"
              >
                Sudah Menyelesaikan Sesi Absen Hari Ini
              </button>
            ) : (
              <div className="space-y-4">
                {isClockedIn && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 mb-1">
                      <CheckCircle2 size={16} />
                      <span className="font-bold text-sm">Riwayat Absen Masuk Hari Ini</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Waktu Masuk: {todayRecord?.timeMasuk || '-'}
                    </p>
                    {todayRecord?.photoUrlMasuk && (
                      <img src={todayRecord.photoUrlMasuk} alt="Masuk" className="mt-2 w-16 h-16 object-cover rounded-lg border border-emerald-200" />
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-2xl shadow-lg font-extrabold text-xs transition-all active:scale-98 text-white flex items-center justify-center space-x-2 ${
                    attendanceStatus === 'Pulang' 
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  {attendanceStatus === 'Pulang' && <LogOut size={16} />}
                  <span>{attendanceStatus === 'Pulang' ? 'Kirim Absen Pulang' : 'Kirim Absen Masuk (' + attendanceStatus + ')'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* History Attendance Log Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Riwayat & Log Presensi Kehadiran
            </h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Cari nama atau tanggal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-48 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Total {myAttendance.length} Entri
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Foto (Masuk/Pulang)</th>
                  <th className="py-2.5 px-3">Nama Pejuang</th>
                  <th className="py-2.5 px-3">Waktu (Masuk - Pulang)</th>
                  <th className="py-2.5 px-3">Jarak dari Pondok</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Belum ada catatan presensi kehadiran.
                    </td>
                  </tr>
                ) : (
                  myAttendance
                  .filter(rec => 
                    rec.pejuangName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    rec.date.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 flex items-center space-x-1">
                        {rec.photoUrl ? (
                          <img
                            src={rec.photoUrl}
                            alt="Foto Masuk"
                            title="Foto Masuk"
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">-</div>
                        )}
                        {rec.photoPulangUrl && (
                          <img
                            src={rec.photoPulangUrl}
                            alt="Foto Pulang"
                            title="Foto Pulang"
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                          />
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {rec.pejuangName}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {rec.subDivisi}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                        <div className="font-bold whitespace-nowrap">{rec.time} {rec.timePulang ? `- ${rec.timePulang}` : ''} WIB</div>
                        <div className="text-[10px] text-slate-400">{rec.date}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-xs ${
                              rec.isWithinRadius
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {rec.distanceFromPondok} meter
                          </span>
                          {currentUser.role === 'Admin' && rec.latitude && rec.longitude && (
                            <button
                              onClick={() => {
                                setSelectedMapRecord(rec);
                                setIsMapModalOpen(true);
                              }}
                              className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              title="Lihat Peta"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                              : rec.status === 'Terlambat'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                              : 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-[150px] truncate">
                        {rec.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Image Modal Viewer */}
      {isImageModalOpen && photoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsImageModalOpen(false)}>
          <button 
            className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={photoPreview} 
            alt="Full Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Map Modal Viewer */}
      {isMapModalOpen && selectedMapRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsMapModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Lokasi Absensi: {selectedMapRecord.pejuangName}
              </h3>
              <button onClick={() => setIsMapModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <LocationMap 
              userLat={selectedMapRecord.latitude}
              userLng={selectedMapRecord.longitude}
              pondokLat={locationSettings.latitude}
              pondokLng={locationSettings.longitude}
              radius={locationSettings.radiusMaxMeters}
              height="h-80"
            />
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-bold">Koordinat:</span> {selectedMapRecord.latitude}, {selectedMapRecord.longitude} <br/>
              <span className="font-bold">Jarak dari Pondok:</span> {selectedMapRecord.distanceFromPondok} meter
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
