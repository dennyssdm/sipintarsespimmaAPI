import pool from '../src/config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const nominatifData = [
  {
    noUrut: 1,
    nama: 'PURWANTO, S.I.K., M.Si.',
    pangkat: 'KOMBES POL',
    nrp: '72010235',
    jabatan: 'ANJAK MADYA SESPIMMA',
    kategoriJabatan: 'Anjak Madya',
    agama: 'ISLAM',
    eselon: 'II B3',
    golongan: 'IV-C',
    email: 'purwanto@gadik.polri.go.id',
    phone: '081234567801',
    kepakaran: [
      'Analisis Kebijakan Strategis Polri',
      'Manajemen Strategik Organisasi Kepolisian',
      'Supervisi & Pengendalian Mutu Akademik'
    ],
    mataAjar: [
      'Analisis SWOT dan AHP',
      'Manajemen Perubahan & Pengendalian Mutu',
      'Kepemimpinan Transformasional Polri'
    ],
    bio: 'Perwira Menengah Polri berpangkat Kombes Pol dengan penugasan sebagai Analis Kebijakan Madya (Anjak Madya) Sespimma Sespim Lemdiklat Polri. Berpengalaman luas dalam perencanaan strategis kepolisian dan pembimbingan Taskap.'
  },
  {
    noUrut: 2,
    nama: 'EFRIANZA, S.I.K.',
    pangkat: 'KOMBES POL',
    nrp: '79040926',
    jabatan: 'WIDYA ISWARA KEPOLISIAN MADYA TK. III SESPIMMA SESPIM LEMDIKLAT POLRI',
    kategoriJabatan: 'Widyaiswara Madya Tk. III',
    agama: 'ISLAM',
    eselon: 'II B3',
    golongan: 'IV-C',
    email: 'efrianza@gadik.polri.go.id',
    phone: '081234567802',
    kepakaran: [
      'Kepemimpinan Strategis POLRI',
      'Manajemen Perubahan & Budaya Organisasi',
      'Taktik dan Teknis Operasional Kepolisian'
    ],
    mataAjar: [
      'Pengantar Kepemimpinan Strategis POLRI (Hanjar 01)',
      'Manajemen Operasional Kepolisian Modern',
      'Pengambilan Keputusan Taktis di Lapangan'
    ],
    bio: 'Widyaiswara Kepolisian Madya Tingkat III Sespimma Sespim Lemdiklat Polri. Berpengalaman dalam pengembangan kepemimpinan kepolisian berkarakter presisi dan adaptif.'
  },
  {
    noUrut: 3,
    nama: 'HIDAYAT, S.H., S.I.K.',
    pangkat: 'KOMBES POL',
    nrp: '76030911',
    jabatan: 'WIDYA ISWARA KEPOLISIAN MADYA TK. III SESPIMMA SESPIM LEMDIKLAT POLRI',
    kategoriJabatan: 'Widyaiswara Madya Tk. III',
    agama: 'ISLAM',
    eselon: 'II B3',
    golongan: 'IV-C',
    email: 'hidayat@gadik.polri.go.id',
    phone: '081234567803',
    kepakaran: [
      'Hukum Pidana dan Acara Pidana Terapan',
      'Manajemen Penyidikan Tingkat Lanjut',
      'Penyelesaian Perkara Berkeadilan Restoratif'
    ],
    mataAjar: [
      'Penyidikan Tindak Pidana Lanjutan',
      'Restorative Justice dalam Sistem Peradilan Pidana',
      'Etika Penegakan Hukum Berkeadilan'
    ],
    bio: 'Widyaiswara Kepolisian Madya Tingkat III Sespimma Sespim Lemdiklat Polri dengan keahlian bidang hukum kepolisian, hak asasi manusia, dan kepemimpinan penegakan hukum humanis.'
  },
  {
    noUrut: 4,
    nama: 'GRACE KRISNA D. RAHAKBAU, S.I.K., M.Si.',
    pangkat: 'KOMBES POL',
    nrp: '76110038',
    jabatan: 'WIDYA ISWARA KEPOLISIAN MADYA TK. III SESPIMMA SESPIM LEMDIKLAT POLRI',
    kategoriJabatan: 'Widyaiswara Madya Tk. III',
    agama: 'KRISTEN',
    eselon: 'II B3',
    golongan: 'IV-C',
    email: 'grace.krisna.d..rahakbau@gadik.polri.go.id',
    phone: '081234567804',
    kepakaran: [
      'Polmas dan Community Policing Modern',
      'Komunikasi Publik & Manajemen Krisis',
      'Pencegahan Konflik Sosial Terpadu'
    ],
    mataAjar: [
      'Manajemen dan Standar Keberhasilan Polmas (Hanjar 14)',
      'Teknik Komunikasi Publik Pimpinan Pertama',
      'Resolusi Konflik dan Mediasi Kamtibmas'
    ],
    bio: 'Widyaiswara Kepolisian Madya Tingkat III Sespimma Sespim Lemdiklat Polri pakar pada bidang Perpolisian Masyarakat (Polmas) dan manajemen hubungan media kepolisian.'
  },
  {
    noUrut: 5,
    nama: 'DHANI GUMILAR, S.H., S.I.K., M.H.',
    pangkat: 'KOMBES POL',
    nrp: '78081568',
    jabatan: 'WIDYA ISWARA KEPOLISIAN MADYA TK. III SESPIMMA SESPIM LEMDIKLAT POLRI',
    kategoriJabatan: 'Widyaiswara Madya Tk. III',
    agama: 'ISLAM',
    eselon: 'II B3',
    golongan: 'IV-C',
    email: 'dhani.gumilar@gadik.polri.go.id',
    phone: '081234567805',
    kepakaran: [
      'Manajemen Pembinaan Operasional Lalu Lintas',
      'Rekayasa dan Keamanan Transportasi Terpadu',
      'Penegakan Hukum Berbasis ETLE Digital'
    ],
    mataAjar: [
      'Fungsi Teknis Lalu Lintas (Hanjar 08)',
      'Manajemen Kamseltibcarlantas Berkelanjutan',
      'Transformasi Pelayanan Publik Polri Berbasis TI'
    ],
    bio: 'Widyaiswara Kepolisian Madya Tingkat III Sespimma Sespim Lemdiklat Polri dengan rekam jejak panjang di bidang lalu lintas, transformasi ETLE, dan pelayanan prima kepolisian.'
  },
  {
    noUrut: 6,
    nama: 'DIDIT EKO HERAWANTO, S.I.K., S.H.',
    pangkat: 'KOMBES POL',
    nrp: '74090553',
    jabatan: 'WIDYA ISWARA KEPOLISIAN MADYA TK. III SESPIMMA SESPIM LEMDIKLAT POLRI',
    kategoriJabatan: 'Widyaiswara Madya Tk. III',
    agama: 'ISLAM',
    eselon: 'II B3',
    golongan: 'IV-C',
    email: 'didit.eko.herawanto@gadik.polri.go.id',
    phone: '081234567806',
    kepakaran: [
      'Intelijen Keamanan dan Early Warning System',
      'Manajemen Kontinjensi & Kontra Terorisme',
      'Penggalangan dan Analisis Ancaman Strategis'
    ],
    mataAjar: [
      'Fungsi Teknis Intelijen Keamanan (Hanjar 06)',
      'Manajemen Perkiraan Intelijen Kontinjensi',
      'Deteksi Dini dan Pencegahan Gangguan Kamtibmas'
    ],
    bio: 'Widyaiswara Kepolisian Madya Tingkat III pakar di bidang intelijen kepolisian, deteksi dini ancaman kamtibmas, dan manajemen perkiraan intelijen kontinjensi.'
  },
  {
    noUrut: 7,
    nama: 'ASEP KAMALUDIN, M.M.',
    pangkat: 'AKBP',
    nrp: '70070807',
    jabatan: 'GADIK MADYA SESPIMMA',
    kategoriJabatan: 'Gadik Madya',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-B',
    email: 'asep.kamaludin@gadik.polri.go.id',
    phone: '081234567807',
    kepakaran: [
      'Manajemen Sumber Daya Manusia Polri',
      'Pengembangan Budaya Organisasi Unggul',
      'Psikologi Kepemimpinan dan Coaching Serdik'
    ],
    mataAjar: [
      'Manajemen SDM Berbasis Kompetensi Polri',
      'Metodologi Penyusunan Taskap Sespimma',
      'Pengukuran Kinerja Staf dan Pimpinan Pertama'
    ],
    bio: 'Tenaga Pendidik Madya (Gadik Madya) Sespimma dengan kepakaran pada manajemen SDM unggul Polri, sistem penilaian kinerja berbasis kompetensi, dan psikologi organisasi.'
  },
  {
    noUrut: 8,
    nama: 'DEWI SUSILO PANGESTUTI, S.Ak.',
    pangkat: 'AKBP',
    nrp: '73040574',
    jabatan: 'GADIK MADYA SESPIMMA',
    kategoriJabatan: 'Gadik Madya',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-B',
    email: 'dewi.susilo.pangestuti@gadik.polri.go.id',
    phone: '081234567808',
    kepakaran: [
      'Akuntansi dan Keuangan Sektor Publik Kepolisian',
      'Audit Akuntabilitas Kinerja Instansi Pemerintah (AKIP)',
      'Manajemen Logistik & Inventarisasi Aset Polri'
    ],
    mataAjar: [
      'Manajemen Keuangan Negara dan Pertanggungjawaban Mutlak',
      'Tata Kelola Logistik dan Aset BMN Polri',
      'Inovasi Kepemimpinan dan Manajemen Mutu SIPINTAR'
    ],
    bio: 'Tenaga Pendidik Madya (Gadik Madya) Sespimma Lemdiklat Polri sekaligus Inovator Utama Sistem Informasi Pembelajaran Terpadu SIPINTAR (Proyek Perubahan PKN Tingkat II Angkatan XXIX TA 2026). Pakar manajemen logistik dan akuntansi kepolisian.'
  },
  {
    noUrut: 9,
    nama: 'SANTHI RIANAWATI, S.H.',
    pangkat: 'AKBP',
    nrp: '76071042',
    jabatan: 'GADIK MADYA SESPIMMA',
    kategoriJabatan: 'Gadik Madya',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-B',
    email: 'santhi.rianawati@gadik.polri.go.id',
    phone: '081234567809',
    kepakaran: [
      'Analisis Kebijakan Publik Berbasis AHP',
      'Pemecahan Masalah Organisasi Terstruktur',
      'Metodologi Penelitian Terapan Kepolisian'
    ],
    mataAjar: [
      'Aplikasi Analisis SWOT dan AHP (Hanjar 03)',
      'Teknik Pembuatan Kertas Kerja Perseorangan (Taskap)',
      'Evaluasi Efektivitas Program Pemeliharaan Kamtibmas'
    ],
    bio: 'Tenaga Pendidik Madya (Gadik Madya) Sespimma bidang analisis kebijakan kuantitatif dan kualitatif. Menguasai pemodelan keputusan berjenjang (AHP) dan perumusan strategi pemecahan masalah institusi.'
  },
  {
    noUrut: 10,
    nama: 'LUSY JULI INDRIANI, S.I.K.',
    pangkat: 'AKBP',
    nrp: '82071408',
    jabatan: 'WIDYAISWARA KEPOLISIAN MUDA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Muda Tk. I',
    agama: 'KRISTEN',
    eselon: 'III A2',
    golongan: 'IV-A',
    email: 'lusy.juli.indriani@gadik.polri.go.id',
    phone: '081234567810',
    kepakaran: [
      'Hukum dan Perundang-undangan Kepolisian',
      'Pemberdayaan Polwan & Perlindungan Perempuan/Anak',
      'Etika Profesi Kepolisian'
    ],
    mataAjar: [
      'Etika Profesi dan Budaya Pelayanan Polri',
      'Manajemen Penanganan Kekerasan Berbasis Gender',
      'Penegakan Hukum Berkeadilan Humanis'
    ],
    bio: 'Perwira Menengah Polri berpangkat AKBP dengan penugasan sebagai Widyaiswara Kepolisian Muda Tingkat I Sespimma Sespim Lemdiklat Polri. Memiliki keahlian mendalam pada etika profesi kepolisian dan advokasi perempuan/anak.'
  },
  {
    noUrut: 11,
    nama: 'RAHMAWATY TUMULO, S.I.K., M.M.',
    pangkat: 'AKBP',
    nrp: '87061679',
    jabatan: 'WIDYAISWARA KEPOLISIAN MUDA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Muda Tk. I',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-A',
    email: 'rahmawaty.tumulo@gadik.polri.go.id',
    phone: '081234567811',
    kepakaran: [
      'Manajemen Keuangan & Logistik Polri',
      'Manajemen Sumber Daya Operasional',
      'Audit Akuntabilitas Kinerja Kepolisian'
    ],
    mataAjar: [
      'Manajemen Anggaran dan Akuntabilitas Polri',
      'Perencanaan Logistik Wilayah',
      'Tata Kelola Pengadaan Barang/Jasa Pemerintah'
    ],
    bio: 'Widyaiswara Kepolisian Muda Tingkat I Sespimma Sespim Lemdiklat Polri dengan latar belakang manajemen keuangan dan logistik kepolisian. Aktif dalam penyusunan kurikulum akuntabilitas kinerja manajerial Polri.'
  },
  {
    noUrut: 13,
    nama: 'DINA NOVITASARI, S.H., S.I.K., M.H.',
    pangkat: 'AKBP',
    nrp: '84111638',
    jabatan: 'WIDYAISWARA KEPOLISIAN MUDA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Muda Tk. I',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-A',
    email: 'dina.novitasari@gadik.polri.go.id',
    phone: '081234567812',
    kepakaran: [
      'Penyidikan Tindak Pidana Siber & Khusus',
      'Hukum Acara Pidana Modern',
      'Forensik Digital Kepolisian'
    ],
    mataAjar: [
      'Penanganan Tindak Pidana Siber Berbasis AI',
      'Teknik Investigasi Kriminal Terpadu',
      'Sistem Peradilan Pidana Terpadu'
    ],
    bio: 'Widyaiswara Kepolisian Muda Tingkat I Sespimma Sespim Lemdiklat Polri dengan kepakaran penegakan hukum siber dan penyelidikan kejahatan transnasional. Membimbing perwira pertama dalam penguasaan forensik digital modern.'
  },
  {
    noUrut: 14,
    nama: 'HENI MARDIYATMI, S.I.P., S.Sos., M.Sc.',
    pangkat: 'KOMPOL',
    nrp: '74030201',
    jabatan: 'WIDYAISWARA KEPOLISIAN MUDA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Muda Tk. I',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-A',
    email: 'heni.mardiyatmi@gadik.polri.go.id',
    phone: '081234567813',
    kepakaran: [
      'Sosiologi Hukum dan Pendekatan Humanis Kepolisian',
      'Pencegahan Radikalisme dan Intoleransi',
      'Pengembangan Nilai Kebangsaan dan Moderasi'
    ],
    mataAjar: [
      'Pemahaman Nilai Kebangsaan dan Bela Negara',
      'Sosiologi Kepolisian dalam Masyarakat Plural',
      'Pendekatan Soft Power dalam Penanganan Konflik'
    ],
    bio: 'Widyaiswara Kepolisian Muda Tingkat I dengan latar belakang multidisiplin ilmu sosial dan kebijakan publik, mengampu modul pemahaman peradaban manusia serta pendekatan humanis kepolisian.'
  },
  {
    noUrut: 15,
    nama: 'M. ICHWAN NUGRAHA, S.I.K., M.Si.',
    pangkat: 'KOMPOL',
    nrp: '88021042',
    jabatan: 'WIDYAISWARA KEPOLISIAN MUDA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Muda Tk. I',
    agama: 'ISLAM',
    eselon: 'III A2',
    golongan: 'IV-A',
    email: 'm.ichwan.nugraha@gadik.polri.go.id',
    phone: '081234567814',
    kepakaran: [
      'Komunikasi Publik & Manajemen Media Polri',
      'Kehumasan Strategis Kepolisian',
      'Manajemen Krisis & Reputasi Institusi'
    ],
    mataAjar: [
      'Manajemen Media dan Komunikasi Strategis Polri',
      'Teknik Wawancara Krisis dan Konferensi Pers',
      'Literasi Informasi dan Kontra-Disinformasi'
    ],
    bio: 'Widyaiswara Kepolisian Muda Tingkat I Sespimma Sespim Lemdiklat Polri spesialis bidang komunikasi krisis, public relations kepolisian, dan strategi diseminasi narasi positif kelembagaan Polri.'
  },
  {
    noUrut: 17,
    nama: 'RENTHA ULI NOVITA PARDEDE, S.H., S.I.K.',
    pangkat: 'KOMPOL',
    nrp: '88110791',
    jabatan: 'WIDYAISWARA KEPOLISIAN MUDA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Muda Tk. I',
    agama: 'ISLAM',
    eselon: 'III B',
    golongan: 'III-C',
    email: 'rentha.uli.novita.pardede@gadik.polri.go.id',
    phone: '081234567815',
    kepakaran: [
      'Standarisasi Prosedur Operasional Penyelidikan/Penyidikan',
      'Sistem Pengawasan Internal dan Disiplin Anggota Polri',
      'Manajemen Resiko Operasional Kepolisian'
    ],
    mataAjar: [
      'Pengawasan Melekat dan Pengendalian Mutu Administrasi',
      'Audit Kepatuhan Kode Etik Profesi Polri',
      'Manajemen Risiko pada Penugasan Lapangan'
    ],
    bio: 'Widyaiswara Kepolisian Muda Tingkat I dengan rekam jejak pada pengawasan internal kepolisian, penegakan disiplin anggota, dan standarisasi proses penyidikan berkeadilan.'
  },
  {
    noUrut: 18,
    nama: 'MUGIARTO, S.H., M.H.',
    pangkat: 'IPTU',
    nrp: '83091326',
    jabatan: 'WIDYAISWARA KEPOLISIAN PRATAMA TK. I SESPIMMA',
    kategoriJabatan: 'Widyaiswara Pratama Tk. I',
    agama: 'ISLAM',
    eselon: 'IV B',
    golongan: 'III-B',
    email: 'mugiarto@gadik.polri.go.id',
    phone: '081234567816',
    kepakaran: [
      'Teknik Pembuatan Berkas Perkara dan Legal Drafting',
      'Simulasi Peradilan Semu dan Tata Cara Bersaksi',
      'Penyusunan Peraturan Internal dan Telaahan Hukum'
    ],
    mataAjar: [
      'Hukum Acara Pidana Terapan dan Praktek Peradilan',
      'Penyusunan Naskah Telaahan Staf Bidang Hukum',
      'Teknik Investigasi Tempat Kejadian Perkara (TKP)'
    ],
    bio: 'Widyaiswara Kepolisian Pratama Tingkat I dengan keahlian teknis hukum pidana acara, simulasi peradilan semu (moot court), serta pendampingan advokasi hukum institusi.'
  },
  // Pejabat Penandatangan Nominatif (PS Kasubbag Renmin Sespimma)
  {
    noUrut: 99,
    nama: 'SUNU PRIHANDOYO, S.T.',
    pangkat: 'KOMPOL',
    nrp: '82050054',
    jabatan: 'PS KASUBBAG RENMIN SESPIMMA',
    kategoriJabatan: 'Gadik Madya',
    agama: 'ISLAM',
    eselon: 'III B',
    golongan: 'III-C',
    email: 'sunu.prihandoyo@sespimma.lemdiklat.polri.go.id',
    phone: '081234567899',
    roleId: 4, // Verifikator / Pejabat Bag Renmin
    kepakaran: [
      'Perencanaan dan Administrasi Sumber Daya Sespimma',
      'Manajemen Anggaran dan Perencanaan Kerja (Renja)',
      'Tata Kelola Personel dan Logistik Satdik'
    ],
    mataAjar: [
      'Manajemen Perencanaan dan Penganggaran Polri',
      'Administrasi Umum dan Tata Naskah Dinas Polri',
      'Sistem Informasi Personel dan Akuntabilitas Satdik'
    ],
    bio: 'Pejabat Sementara Kasubbag Renmin Sespimma Sespim Lemdiklat Polri. Bertanggung jawab atas perencanaan program kerja, anggaran, kepegawaian dinas, dan pengesahan nominatif resmi personel Sespimma.'
  }
];

async function sync() {
  console.log('=== Sinkronisasi User Dari Data Nominatif Sespimma ===');
  console.log('Target Password: Password123! untuk semua akun');

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const standardPasswordHash = bcrypt.hashSync('Password123!', 10);

    // 1. Update SEMUA user yang sudah ada di database agar passwordnya Password123!
    console.log('\n[1/4] Mengatur password Password123! untuk seluruh akun yang ada...');
    await connection.query('UPDATE users SET password_hash = ?', [standardPasswordHash]);
    console.log('✓ Seluruh akun di database sekarang memiliki password: Password123!');

    // 2. Insert/Update setiap personel nominatif
    console.log('\n[2/4] Menyinkronkan 17 personel dari data nominatif...');
    const syncedUsers = [];

    for (const item of nominatifData) {
      const roleId = item.roleId || 2; // Default gadik (2)

      // Cek apakah user dengan NRP sudah ada
      const [existing] = await connection.query(
        'SELECT id, uuid, nrp_nip, nama_lengkap, email FROM users WHERE nrp_nip = ?',
        [item.nrp]
      );

      let userId;

      if (existing.length > 0) {
        userId = existing[0].id;
        console.log(`- Mengupdate User ID ${userId} (NRP: ${item.nrp}) -> ${item.nama}`);
        await connection.query(
          `UPDATE users 
           SET nama_lengkap = ?, email = ?, password_hash = ?, role_id = ?, phone_number = ?, is_active = 1
           WHERE id = ?`,
          [item.nama, item.email, standardPasswordHash, roleId, item.phone, userId]
        );
      } else {
        const uuid = `usr-gadik-${item.nrp}`;
        console.log(`+ Menambahkan User Baru (NRP: ${item.nrp}) -> ${item.nama}`);
        const [res] = await connection.query(
          `INSERT INTO users (uuid, nrp_nip, nama_lengkap, email, password_hash, role_id, phone_number, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [uuid, item.nrp, item.nama, item.email, standardPasswordHash, roleId, item.phone]
        );
        userId = res.insertId;
      }

      syncedUsers.push({ userId, ...item });

      // Cek / Update user_profiles_gadik (untuk personel fungsional)
      if (item.noUrut !== 99) {
        const [existingProfile] = await connection.query(
          'SELECT user_id FROM user_profiles_gadik WHERE user_id = ?',
          [userId]
        );

        if (existingProfile.length > 0) {
          await connection.query(
            `UPDATE user_profiles_gadik 
             SET no_urut_nominatif = ?, pangkat = ?, jabatan = ?, kategori_jabatan = ?, agama = ?, eselon = ?, golongan = ?, status_fungsional = 'Aktif Fungsional', bio = ?
             WHERE user_id = ?`,
            [item.noUrut, item.pangkat, item.jabatan, item.kategoriJabatan, item.agama, item.eselon, item.golongan, item.bio, userId]
          );
        } else {
          await connection.query(
            `INSERT INTO user_profiles_gadik 
             (user_id, no_urut_nominatif, pangkat, jabatan, kategori_jabatan, agama, eselon, golongan, status_fungsional, no_sprint, bio)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aktif Fungsional', 'Sprin/128/X/DIK.2.1./2026', ?)`,
            [userId, item.noUrut, item.pangkat, item.jabatan, item.kategoriJabatan, item.agama, item.eselon, item.golongan, item.bio]
          );
        }

        // Sinkronkan kompetensi (kepakaran & mata ajar)
        await connection.query('DELETE FROM gadik_competencies WHERE user_id = ?', [userId]);

        for (const kep of item.kepakaran) {
          await connection.query(
            'INSERT INTO gadik_competencies (user_id, competency_name, competency_type) VALUES (?, ?, "kepakaran")',
            [userId, kep]
          );
        }
        for (const ma of item.mataAjar) {
          await connection.query(
            'INSERT INTO gadik_competencies (user_id, competency_name, competency_type) VALUES (?, ?, "mata_ajar")',
            [userId, ma]
          );
        }
      }
    }

    await connection.commit();
    console.log('\n✓ Berhasil melakukan sinkronisasi database MySQL!');

    // 3. Verifikasi Pengujian Login
    console.log('\n[3/4] Melakukan uji verifikasi login dengan NRP & Password123!...');
    let successCount = 0;
    for (const item of nominatifData) {
      const [u] = await connection.query(
        'SELECT id, nrp_nip, nama_lengkap, email, password_hash FROM users WHERE nrp_nip = ?',
        [item.nrp]
      );
      if (u.length > 0 && bcrypt.compareSync('Password123!', u[0].password_hash)) {
        successCount++;
      } else {
        console.error(`X GAGAL LOGIN untuk NRP ${item.nrp}`);
      }
    }
    console.log(`✓ Verifikasi: ${successCount} dari ${nominatifData.length} personel nominatif lulus uji login!`);

    // Verifikasi akun admin 80010001
    const [adminRow] = await connection.query('SELECT nrp_nip, password_hash FROM users WHERE nrp_nip = "80010001"');
    if (adminRow.length > 0 && bcrypt.compareSync('Password123!', adminRow[0].password_hash)) {
      console.log('✓ Akun Utama Administrator (NRP: 80010001) lulus uji login dengan Password123!');
    }

    console.log('\n[4/4] Rekap Akun Nominatif Siap Pakai:');
    console.table(
      syncedUsers.map(s => ({
        NRP: s.nrp,
        Nama: s.nama,
        Pangkat: s.pangkat,
        Jabatan: s.jabatan.length > 40 ? s.jabatan.slice(0, 37) + '...' : s.jabatan,
        Password: 'Password123!'
      }))
    );

  } catch (err) {
    await connection.rollback();
    console.error('Terjadi kesalahan:', err);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

sync();
