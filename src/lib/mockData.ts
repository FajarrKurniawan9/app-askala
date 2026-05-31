/**
 * Centralized mock data for Askala / Jejak Admin Panel.
 * All data is static. Replace fetch calls with:
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`)
 * when backend is ready.
 */

import type {
  Student, Payment, Transaction, Activity, Organization,
  AdminProfile, SchoolInfo, NotificationSettings,
} from "./types";

// ─── Students ────────────────────────────────────────────────
export const mockStudents: Student[] = [
  { id:"s1", nis:"2024001001", name:"Ahmad Rizky Pratama",    email:"ahmad.rizky@student.sch.id",   phone:"081234567890", kelas:"XI-IPA 2",  jurusan:"IPA",  status:"active",   organizationCount:3, organizations:["OSIS","Paskibra","KIR"],  joinDate:"14 Jul 2023" },
  { id:"s2", nis:"2024001002", name:"Siti Rahmadhani",        email:"siti.rahma@student.sch.id",    phone:"082345678901", kelas:"XI-IPS 1",  jurusan:"IPS",  status:"active",   organizationCount:2, organizations:["OSIS","PMR"],             joinDate:"14 Jul 2023" },
  { id:"s3", nis:"2024001003", name:"Bima Prasetyo",          email:"bima.prasetyo@student.sch.id", phone:"083456789012", kelas:"X-IPA 1",   jurusan:"IPA",  status:"active",   organizationCount:4, organizations:["OSIS","KIR","Pramuka","Rohis"], joinDate:"17 Jul 2024" },
  { id:"s4", nis:"2024001004", name:"Dian Safitri Lestari",   email:"dian.safitri@student.sch.id",  phone:"084567890123", kelas:"XII-IPA 3", jurusan:"IPA",  status:"active",   organizationCount:1, organizations:["OSIS"],                   joinDate:"18 Jul 2022" },
  { id:"s5", nis:"2024001005", name:"Rizal Anwar Fauzi",      email:"rizal.anwar@student.sch.id",   phone:"085678901234", kelas:"X-IPS 2",   jurusan:"IPS",  status:"active",   organizationCount:2, organizations:["KIR","Pramuka"],          joinDate:"17 Jul 2024" },
  { id:"s6", nis:"2024001006", name:"Putri Maharani",         email:"putri.mh@student.sch.id",      phone:"086789012345", kelas:"XI-IPA 1",  jurusan:"IPA",  status:"active",   organizationCount:3, organizations:["Paskibra","OSIS","PMR"],  joinDate:"14 Jul 2023" },
  { id:"s7", nis:"2024001007", name:"Fajar Nugroho",          email:"fajar.ng@student.sch.id",      phone:"087890123456", kelas:"XII-IPS 1", jurusan:"IPS",  status:"inactive", organizationCount:0, organizations:[],                         joinDate:"18 Jul 2022" },
  { id:"s8", nis:"2024001008", name:"Nadia Permatasari",      email:"nadia.ps@student.sch.id",      phone:"088901234567", kelas:"X-IPA 3",   jurusan:"IPA",  status:"active",   organizationCount:1, organizations:["Rohis"],                  joinDate:"17 Jul 2024" },
  { id:"s9", nis:"2024001009", name:"Hendra Kurniawan",       email:"hendra.kw@student.sch.id",     phone:"089012345678", kelas:"XI-IPS 2",  jurusan:"IPS",  status:"active",   organizationCount:2, organizations:["OSIS","KIR"],             joinDate:"14 Jul 2023" },
  { id:"s10",nis:"2024001010", name:"Ayu Lestari",            email:"ayu.ls@student.sch.id",        phone:"089123456789", kelas:"XII-IPA 1", jurusan:"IPA",  status:"active",   organizationCount:2, organizations:["PMR","Paskibra"],         joinDate:"18 Jul 2022" },
];

// ─── Payments ────────────────────────────────────────────────
export const mockPayments: Payment[] = [
  { id:"p1",  studentId:"s1",  studentName:"Ahmad Rizky Pratama",  studentNis:"2024001001", kelas:"XI-IPA 2",  tagihan:"Iuran OSIS Juni 2026",    organization:"OSIS",     amount:50000,  date:"27 Mei 2026", status:"pending",  buktiUrl:"/payment-proof.jpg" },
  { id:"p2",  studentId:"s2",  studentName:"Siti Rahmadhani",      studentNis:"2024001002", kelas:"XI-IPS 1",  tagihan:"Iuran Paskibra Mei 2026",  organization:"Paskibra", amount:75000,  date:"26 Mei 2026", status:"pending",  buktiUrl:"/payment-proof.jpg" },
  { id:"p3",  studentId:"s3",  studentName:"Bima Prasetyo",        studentNis:"2024001003", kelas:"X-IPA 1",   tagihan:"Dana Pensi 2026",           organization:"OSIS",     amount:100000, date:"25 Mei 2026", status:"pending",  buktiUrl:"/payment-proof.jpg" },
  { id:"p4",  studentId:"s4",  studentName:"Dian Safitri Lestari", studentNis:"2024001004", kelas:"XII-IPA 3", tagihan:"Iuran OSIS Juni 2026",    organization:"OSIS",     amount:50000,  date:"24 Mei 2026", status:"pending",  buktiUrl:"/payment-proof.jpg" },
  { id:"p5",  studentId:"s5",  studentName:"Rizal Anwar Fauzi",    studentNis:"2024001005", kelas:"X-IPS 2",   tagihan:"Iuran KIR Mei 2026",       organization:"KIR",      amount:30000,  date:"23 Mei 2026", status:"pending",  buktiUrl:"/payment-proof.jpg" },
  { id:"p6",  studentId:"s6",  studentName:"Putri Maharani",       studentNis:"2024001006", kelas:"XI-IPA 1",  tagihan:"Iuran OSIS Mei 2026",     organization:"OSIS",     amount:50000,  date:"20 Mei 2026", status:"verified", verifiedAt:"21 Mei 2026", verifiedBy:"Budi Santoso" },
  { id:"p7",  studentId:"s8",  studentName:"Nadia Permatasari",    studentNis:"2024001008", kelas:"X-IPA 3",   tagihan:"Iuran Rohis April 2026",   organization:"Rohis",    amount:25000,  date:"19 Mei 2026", status:"verified", verifiedAt:"20 Mei 2026", verifiedBy:"Budi Santoso" },
  { id:"p8",  studentId:"s9",  studentName:"Hendra Kurniawan",     studentNis:"2024001009", kelas:"XI-IPS 2",  tagihan:"Dana Pensi 2026",           organization:"OSIS",     amount:100000, date:"18 Mei 2026", status:"verified", verifiedAt:"19 Mei 2026", verifiedBy:"Budi Santoso" },
  { id:"p9",  studentId:"s7",  studentName:"Fajar Nugroho",        studentNis:"2024001007", kelas:"XII-IPS 1", tagihan:"Iuran OSIS Apr 2026",     organization:"OSIS",     amount:50000,  date:"15 Mei 2026", status:"rejected", notes:"Bukti transfer tidak jelas / buram" },
  { id:"p10", studentId:"s10", studentName:"Ayu Lestari",          studentNis:"2024001010", kelas:"XII-IPA 1", tagihan:"Iuran Paskibra Mei 2026", organization:"Paskibra", amount:75000,  date:"14 Mei 2026", status:"rejected", notes:"Nominal tidak sesuai tagihan" },
];

// ─── Transactions (Treasury) ─────────────────────────────────
export const mockTransactions: Transaction[] = [
  { id:"t1",  type:"in",  title:"Iuran OSIS Juni 2026",       organization:"OSIS",     amount:500000,  date:"27 Mei 2026", recordedBy:"Budi Santoso" },
  { id:"t2",  type:"out", title:"Beli Seragam Paskibra",      organization:"Paskibra", amount:350000,  date:"25 Mei 2026", recordedBy:"Siti Rahmah" },
  { id:"t3",  type:"in",  title:"Iuran KIR Mei 2026",         organization:"KIR",      amount:150000,  date:"20 Mei 2026", recordedBy:"Budi Santoso" },
  { id:"t4",  type:"out", title:"Konsumsi Rapat OSIS",        organization:"OSIS",     amount:200000,  date:"18 Mei 2026", recordedBy:"Ahmad Rizky" },
  { id:"t5",  type:"in",  title:"Sumbangan Wali Murid",       organization:"OSIS",     amount:1000000, date:"15 Mei 2026", recordedBy:"Budi Santoso" },
  { id:"t6",  type:"out", title:"Dekorasi Pensi 2026",        organization:"OSIS",     amount:450000,  date:"10 Mei 2026", recordedBy:"Dian Safitri" },
  { id:"t7",  type:"in",  title:"Iuran PMR April 2026",       organization:"PMR",      amount:120000,  date:"05 Mei 2026", recordedBy:"Budi Santoso" },
  { id:"t8",  type:"out", title:"Pembelian P3K",              organization:"PMR",      amount:180000,  date:"02 Mei 2026", recordedBy:"Putri Maharani" },
  { id:"t9",  type:"in",  title:"Iuran Pramuka April 2026",   organization:"Pramuka",  amount:80000,   date:"28 Apr 2026", recordedBy:"Budi Santoso" },
  { id:"t10", type:"out", title:"Transport Jambore Daerah",   organization:"Pramuka",  amount:600000,  date:"20 Apr 2026", recordedBy:"Rizal Anwar" },
];

// ─── Monthly chart data ───────────────────────────────────────
export const monthlyChartData = [
  { bulan:"Jan", pemasukan:1500000, pengeluaran:800000 },
  { bulan:"Feb", pemasukan:2000000, pengeluaran:1200000 },
  { bulan:"Mar", pemasukan:1800000, pengeluaran:950000 },
  { bulan:"Apr", pemasukan:2400000, pengeluaran:1600000 },
  { bulan:"Mei", pemasukan:3000000, pengeluaran:2100000 },
  { bulan:"Jun", pemasukan:2200000, pengeluaran:1400000 },
];

// ─── Activities ───────────────────────────────────────────────
export const mockActivities: Activity[] = [
  {
    id:"a1", name:"Pensi Sekolah 2026",              organization:"OSIS",
    description:"Perayaan akhir tahun ajaran 2025/2026 dengan pertunjukan seni, musik, dan penghargaan siswa berprestasi.",
    date:"15 Jun 2026", endDate:"16 Jun 2026", location:"Aula Utama SMA",
    status:"upcoming", participants:245, maxParticipants:300,
    coordinator:"Ahmad Rizky Pratama", budget:5000000,
  },
  {
    id:"a2", name:"Latihan Paskibra Rutin",          organization:"Paskibra",
    description:"Latihan mingguan persiapan upacara HUT RI ke-81.",
    date:"01 Jun 2026", endDate:"17 Agu 2026", location:"Lapangan Upacara",
    status:"ongoing", participants:42, maxParticipants:50,
    coordinator:"Putri Maharani", budget:1500000,
  },
  {
    id:"a3", name:"Seminar Karya Ilmiah Remaja",     organization:"KIR",
    description:"Seminar dan presentasi hasil penelitian siswa KIR semester genap 2025/2026.",
    date:"20 Jun 2026", location:"Lab IPA",
    status:"upcoming", participants:18, maxParticipants:30,
    coordinator:"Bima Prasetyo", budget:800000,
  },
  {
    id:"a4", name:"Bakti Sosial PMR",               organization:"PMR",
    description:"Kegiatan donor darah dan pemeriksaan kesehatan gratis untuk warga sekitar sekolah.",
    date:"05 Mei 2026", location:"Halaman Sekolah",
    status:"done", participants:35, maxParticipants:35,
    coordinator:"Ayu Lestari", budget:2000000,
  },
  {
    id:"a5", name:"Jambore Pramuka Daerah",          organization:"Pramuka",
    description:"Keikutsertaan tim Pramuka dalam Jambore tingkat Kota Malang.",
    date:"25 Apr 2026", endDate:"27 Apr 2026", location:"Bumi Perkemahan Karangploso",
    status:"done", participants:28, maxParticipants:30,
    coordinator:"Rizal Anwar Fauzi", budget:3500000,
  },
  {
    id:"a6", name:"Buka Bersama Rohis",              organization:"Rohis",
    description:"Buka bersama dan santunan anak yatim di lingkungan sekolah.",
    date:"15 Mar 2026", location:"Masjid Sekolah",
    status:"done", participants:120, maxParticipants:150,
    coordinator:"Nadia Permatasari", budget:2500000,
  },
  {
    id:"a7", name:"Pemilihan Ketua OSIS 2026/2027",  organization:"OSIS",
    description:"Proses pemilihan ketua dan pengurus OSIS periode tahun ajaran baru.",
    date:"28 Jun 2026", location:"Ruang Kelas & Lapangan",
    status:"upcoming", participants:890, maxParticipants:1000,
    coordinator:"Dian Safitri Lestari", budget:1200000,
  },
];

// ─── Organizations ────────────────────────────────────────────
export const mockOrganizations: Organization[] = [
  { id:"org1", name:"Organisasi Siswa Intra Sekolah", shortName:"OSIS",     description:"Organisasi induk seluruh kegiatan siswa", memberCount:45, balance:3050000, coordinator:"Ahmad Rizky Pratama", since:"2018" },
  { id:"org2", name:"Pasukan Pengibar Bendera",       shortName:"Paskibra", description:"Petugas upacara bendera sekolah",          memberCount:42, balance:870000,  coordinator:"Putri Maharani",       since:"2019" },
  { id:"org3", name:"Kelompok Ilmiah Remaja",          shortName:"KIR",      description:"Riset dan karya ilmiah siswa",             memberCount:28, balance:420000,  coordinator:"Bima Prasetyo",        since:"2020" },
  { id:"org4", name:"Palang Merah Remaja",             shortName:"PMR",      description:"Sosial dan kesehatan di lingkungan sekolah",memberCount:35, balance:640000,  coordinator:"Ayu Lestari",          since:"2019" },
  { id:"org5", name:"Gerakan Pramuka",                 shortName:"Pramuka",  description:"Kepanduan dan kegiatan alam",              memberCount:55, balance:280000,  coordinator:"Rizal Anwar Fauzi",    since:"2017" },
  { id:"org6", name:"Rohani Islam",                    shortName:"Rohis",    description:"Kegiatan keagamaan dan sosial Islami",     memberCount:48, balance:950000,  coordinator:"Nadia Permatasari",    since:"2018" },
];

// ─── Admin / School Settings ──────────────────────────────────
export const mockAdminProfile: AdminProfile = {
  name:    "Budi Santoso, S.Pd",
  email:   "budi.santoso@sma.sch.id",
  phone:   "08112345678",
  jabatan: "Pembina OSIS",
  nip:     "197803152005011002",
};

export const mockSchoolInfo: SchoolInfo = {
  name:          "SMA Negeri 3 Malang",
  address:       "Jl. Sultan Agung No.7, Klojen, Kota Malang, Jawa Timur 65111",
  phone:         "(0341) 324272",
  email:         "info@sman3mlg.sch.id",
  website:       "https://www.sman3malang.sch.id",
  tahunAjaran:   "2025/2026",
  kepalaSekolah: "Drs. Tri Sulistyono, M.Pd",
  npsn:          "20533773",
};

export const mockNotifSettings: NotificationSettings = {
  emailVerifikasi: true,
  emailPembayaran: true,
  emailKegiatan:   false,
  pushNotif:       true,
  weeklyReport:    true,
};
