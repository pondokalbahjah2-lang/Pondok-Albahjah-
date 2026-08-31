import {
  UserAccount,
  ManhajiyyahClause,
  AttendanceRecord,
  ExitPermissionRecord,
  LeaveRequestRecord,
  WarningLetterRecord,
  SlipUbarRecord,
  WorkSchedule,
  LocationSettings,
} from '../types';

export const INITIAL_LOCATION_SETTINGS: LocationSettings = {
  latitude: -6.7321,
  longitude: 108.5521,
  radiusMaxMeters: 150,
  addressName: 'Pondok Pesantren Al-Bahjah Cabang Cirebon 1, Sengkuang, Sendang, Cirebon',
};

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'Abdu Salam',
    password: 'Abdu2605',
    name: 'Abdu Salam',
    role: 'Admin',
    subDivisi: 'Manajemen Kepondokan',
    amanah: 'Sekretaris Pondok Pesantren Al-Bahjah Cabang Cirebon 1',
    email: 'abdusalam@albahjah.or.id',
    phone: '081234567890',
  },
];

export const INITIAL_MANHAJIYYAH_CLAUSES: ManhajiyyahClause[] = [
  {
    id: 'pasal-1',
    bab: "I", pasalNumber: "1",
    title: 'Pengertian Manhajiah & Pejuang Al-Bahjah',
    category: 'Ketentuan Umum',
    content:
      'Manhajiah Al-Bahjah adalah rambu-rambu atau aturan yang ditetapkan untuk menjadi pegangan seluruh keluarga Al-Bahjah sebagai tuntunan cara hidup yang meliputi segala aspek untuk menguatkan akhlak dan keimanan. Pejuang Al-Bahjah adalah semua orang yang secara struktural atau fungsional berada di bawah Pembina Yayasan Al-Bahjah.',
  },
  {
    id: 'pasal-2',
    bab: "I", pasalNumber: "2",
    title: 'Asas Perjuangan',
    category: 'Ketentuan Umum',
    content:
      'Berpegang teguh pada syariat Islam sesuai dengan pemahaman Ahlussunnah wal Jama’ah, Asy’ariyah, Maturidiyah, Syafi’iyah, dan Shufiyah yang bersumber dari Al-Qur’an dan As-Sunnah.',
  },
  {
    id: 'pasal-3',
    bab: "I", pasalNumber: "3",
    title: 'Tujuan Manhajiah',
    category: 'Ketentuan Umum',
    content:
      'Menjunjung tinggi nilai-nilai spiritualitas Al-Bahjah untuk diterapkan oleh seluruh pejuang demi terwujudnya pejuang yang berakhlakul karimah dalam segala lini kehidupan.',
  },
  {
    id: 'pasal-4',
    bab: "I", pasalNumber: "4",
    title: 'Keorganisasian',
    category: 'Struktur Organisasi',
    content:
      'Dalam struktural organisasi di LPD Al-Bahjah, Pejuang Al-Bahjah merupakan SDM yang berperan aktif dalam menjalankan segala tugas yang keberadaannya dilindungi oleh Yayasan Al-Bahjah.',
  },
  {
    id: 'pasal-5',
    bab: "I", pasalNumber: "5",
    title: 'Aqidah dan Pemikiran yang Dilarang',
    category: 'Aqidah',
    content:
      'Al-Bahjah menganut 5 poin identitas aqidah Ahlussunnah wal Jamaah. Dilarang keras menyebarkan pemikiran sesat dan menyesatkan seperti Liberalisme, Pluralisme, Sekularisme, serta paham radikal yang keluar dari syariat Islam.',
  },
  {
    id: 'pasal-6',
    bab: "I", pasalNumber: "6",
    title: 'Pondasi Perjuangan (Niat Ikhlas)',
    category: 'Prinsip Perjuangan',
    content:
      'Niatkan berjuang semata-mata untuk ibadah dan menghidupkan syiar agama (ikhlas lillahita’ala). Ciri perjuangan ikhlas adalah disiplin, teratur, teliti, istiqamah, serta senang saat diingatkan.',
  },
  {
    id: 'pasal-7',
    bab: "I", pasalNumber: "7",
    title: 'Adab Kepada Allah SWT',
    category: 'Adab Utama',
    content:
      'Melatih kesadaran diri bahwa segala perbuatan dilihat oleh Allah Swt. Bersegera menjalankan perintah-Nya, menjauhi larangan-Nya, serta membasahi lisan dengan dzikir dan shalawat.',
  },
  {
    id: 'pasal-8',
    bab: "I", pasalNumber: "8",
    title: 'Adab Kepada Rasulullah SAW',
    category: 'Adab Utama',
    content:
      'Terus belajar mencintai Rasulullah saw. dengan membaca shalawat paling sedikit 300 kali sehari, menghidupkan sunnah-sunnah beliau, dan mengagungkan nama serta keturunan beliau.',
  },
  {
    id: 'pasal-9',
    bab: "I", pasalNumber: "9",
    title: 'Adab Kepada Diri Sendiri',
    category: 'Akhlak Pribadi',
    content:
      'Menjaga diri dari bahaya fisik, mental, dan hati. Pandai mengatur waktu, menjauhi perbuatan tercela, serta rutin mengoreksi diri (muhasabah).',
  },
  {
    id: 'pasal-10',
    bab: "I", pasalNumber: "10",
    title: 'Adab Kepada Orang Tua',
    category: 'Akhlak Sosial',
    content:
      'Senantiasa mendoakan orang tua, berbicara dengan lembut, berbakti dalam keadaan suka maupun duka, serta tidak merepotkan orang tua.',
  },
  {
    id: 'pasal-12',
    bab: "I", pasalNumber: "12",
    title: 'Adab Khusus Kepada Guru',
    category: 'Adab Keilmuan',
    content:
      'Meminta petunjuk kepada guru dalam mengambil keputusan penting, bersegera menjalankan tugas dari guru, dan tidak memotong pembicaraan guru.',
  },
  {
    id: 'pasal-13',
    bab: "I", pasalNumber: "13",
    title: 'Adab Khusus Kepada Buya Yahya',
    category: 'Adab Keilmuan',
    content:
      'Di saat bertemu Buya Yahya, mengucapkan salam dengan penuh rasa takzim, menundukkan pandangan, serta menjadikan fatwa dan petuah beliau sebagai rujukan utama.',
  },
  {
    id: 'pasal-14',
    bab: "I", pasalNumber: "14",
    title: 'Adab Khusus Kepada Ummi Fairuz Ar-Rahbini',
    category: 'Adab Keilmuan',
    content:
      'Mengucapkan salam dengan penuh penghormatan, menghentikan aktivitas sejenak saat berpapasan, dan menjaga ketawadhuan.',
  },
  {
    id: 'pasal-20',
    bab: "I", pasalNumber: "20",
    title: 'Adab di Masjid dan Mushalla',
    category: 'Ubudiah',
    content:
      'Memuliakan masjid dengan berpakaian sopan, berniat i’tikaf, melaksanakan shalat Tahiyatal Masjid, serta merapikan mukena, Al-Qur’an, dan sajadah.',
  },
  {
    id: 'pasal-23',
    bab: "I", pasalNumber: "23",
    title: 'Adab Berpakaian',
    category: 'Penampilan',
    content:
      'Berpakaian yang syar’i, menutup aurat secara sempurna, rapi, tidak bergambar yang dilarang agama, dan mencerminkan akhlak kepesantrenan.',
  },
  {
    id: 'pasal-32',
    bab: "I", pasalNumber: "32",
    title: 'Ubudiah Harian & Dzikir Al-Bahjah',
    category: 'Ubudiah',
    content:
      'Melaksanakan shalat berjamaah tepat waktu, membaca Al-Qur’an harian, mengamalkan Wirid Fatih, Wirdul Lathif, dan Ratibul Haddad.',
  },
  {
    id: 'pasal-37',
    bab: "I", pasalNumber: "37",
    title: 'Interaksi Dengan Lawan Jenis',
    category: 'Muamalah',
    content:
      'Menjaga jarak syar’i, menghindari berkhalwah (berduaan), berbicara tegas dan seperlunya sesuai amanah tugas, serta terpisah oleh satir.',
  },
  {
    id: 'pasal-45',
    bab: "I", pasalNumber: "45",
    title: 'Penggunaan Gadget & Media Sosial',
    category: 'Kedisiplinan',
    content:
      'Menggunakan gadget hanya untuk kemaslahatan tugas pesantren. Menghindari menyebarkan berita yang belum jelas kebenarannya (hoaks) dan menjaga nama baik lembaga.',
  },
  {
    id: 'pasal-53',
    bab: "I", pasalNumber: "53",
    title: 'Ekonomi Sederhana & BMT Al-Bahjah',
    category: 'Ekonomi',
    content:
      'Membiasakan pola hidup sederhana, berbelanja sesuai kebutuhan, serta mengutamakan bertransaksi di unit ekonomi pesantren dan BMT Al-Bahjah.',
  },
  {
    id: 'pasal-62',
    bab: "I", pasalNumber: "62",
    title: 'Ketentuan Sanksi dan Surat Peringatan (SP)',
    category: 'Kedisiplinan',
    content:
      'Hukuman bertujuan untuk mendidik dan memberikan efek jera agar pejuang kembali insaf. Pelanggaran diproses melalui tahapan Teguran, SP1, SP2, hingga SP3.',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_EXIT_PERMISSIONS: ExitPermissionRecord[] = [];

export const INITIAL_LEAVE_REQUESTS: LeaveRequestRecord[] = [];

export const INITIAL_WARNING_LETTERS: WarningLetterRecord[] = [];

export const INITIAL_SLIP_UBAR: SlipUbarRecord[] = [];

export const INITIAL_SCHEDULES: WorkSchedule[] = [
  {
    id: 'sch-1',
    targetType: 'Divisi',
    targetId: 'SMPIQu',
    targetName: 'Divisi SMPIQu',
    jamMasuk: '04:30',
    jamPulang: '21:00',
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  },
  {
    id: 'sch-2',
    targetType: 'Divisi',
    targetId: 'SMAIQu',
    targetName: 'Divisi SMAIQu',
    jamMasuk: '04:30',
    jamPulang: '21:00',
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  },
  {
    id: 'sch-3',
    targetType: 'Divisi',
    targetId: 'Divisi Kepondokan Banat',
    targetName: 'Divisi Kepondokan Banat',
    jamMasuk: '04:15',
    jamPulang: '21:30',
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  },
  {
    id: 'sch-4',
    targetType: 'Divisi',
    targetId: 'SDIQu',
    targetName: 'Divisi SDIQu',
    jamMasuk: '06:30',
    jamPulang: '16:00',
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  },
];
