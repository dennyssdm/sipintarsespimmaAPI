import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import { logActivity } from '../utils/logger.js';

/**
 * Service to authenticate user with NRP/NIP or Email and password
 * @param {string} identifier - NRP/NIP or Email
 * @param {string} password - Raw password
 * @param {object} meta - Request metadata (ipAddress, userAgent)
 */
export async function loginUser(identifier, password, meta = {}) {
  if (!identifier || !password) {
    const error = new Error('NRP/NIP/Email dan kata sandi wajib diisi');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Find user by nrp_nip or email
  const [users] = await pool.query(
    `SELECT u.*, r.role_code, r.role_name 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.nrp_nip = ? OR u.email = ?`,
    [identifier.trim(), identifier.trim()]
  );

  if (users.length === 0) {
    const error = new Error('Kredensial tidak valid: NRP/NIP/Email atau kata sandi salah');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const user = users[0];

  if (!user.is_active) {
    const error = new Error('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator Sistem.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // Verify bcrypt password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Kredensial tidak valid: NRP/NIP/Email atau kata sandi salah');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Update last_login_at
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  // Log activity
  await logActivity({
    userId: user.id,
    userName: user.nama_lengkap,
    role: user.role_code,
    actionType: 'LOGIN',
    entityType: 'users',
    entityId: user.id,
    description: `Pengguna ${user.nama_lengkap} (${user.role_code}) berhasil masuk ke sistem`,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent
  });

  const isCruOnly = user.nrp_nip === 'livi' || user.can_delete === 0;
  const permission_scope = isCruOnly ? 'CRU' : 'CRUD';
  const can_delete = !isCruOnly;
  const displayRoleName = user.nrp_nip === 'dennyboy'
    ? 'Superadmin CRUD'
    : user.nrp_nip === 'livi'
    ? 'Admin CRU'
    : user.role_name;

  // Generate JWT token
  const tokenPayload = {
    id: user.id,
    uuid: user.uuid,
    nrp_nip: user.nrp_nip,
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    pangkat: user.pangkat || null,
    golongan: user.golongan || null,
    pangkat_golongan: user.pangkat_golongan || user.pangkat || null,
    jabatan: user.jabatan || null,
    role_id: user.role_id,
    role: user.role_code,
    role_name: displayRoleName,
    can_delete,
    permission_scope
  };

  const token = generateToken(tokenPayload);

  // Return sanitized user data
  const sanitizedUser = {
    id: user.id,
    uuid: user.uuid,
    nrp_nip: user.nrp_nip,
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    pangkat: user.pangkat || null,
    golongan: user.golongan || null,
    pangkat_golongan: user.pangkat_golongan || user.pangkat || null,
    jabatan: user.jabatan || null,
    pendidikan_umum_terakhir: user.pendidikan_umum_terakhir || null,
    pendidikan_kedinasan: user.pendidikan_kedinasan || null,
    sertifikasi: user.sertifikasi || null,
    kompetensi_utama: user.kompetensi_utama || null,
    kompetensi: user.kompetensi || null,
    kompetensi_pendukung: user.kompetensi_pendukung || null,
    role: user.role_code,
    role_name: displayRoleName,
    can_delete,
    permission_scope,
    phone_number: user.phone_number,
    avatar_url: user.avatar_url,
    last_login_at: new Date().toISOString()
  };

  return {
    user: sanitizedUser,
    token,
    token_type: 'Bearer',
    expires_in: process.env.JWT_EXPIRES_IN || '24h'
  };
}

/**
 * Get profile data of current user with role-specific profile details
 * @param {number} userId
 */
export async function getCurrentUserProfile(userId) {
  const [users] = await pool.query(
    `SELECT u.id, u.uuid, u.nrp_nip, u.nama_lengkap, u.email, u.phone_number, 
            u.pangkat, u.golongan, u.pangkat_golongan, u.jabatan, u.pendidikan_umum_terakhir, 
            u.pendidikan_kedinasan, u.sertifikasi, u.kompetensi_utama, u.kompetensi, u.kompetensi_pendukung,
            u.avatar_url, u.can_delete, u.is_active, u.last_login_at, u.created_at, u.updated_at,
            r.role_code, r.role_name, r.description AS role_description
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?`,
    [userId]
  );

  if (users.length === 0) {
    const error = new Error('Pengguna tidak ditemukan');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const user = users[0];
  const isCruOnly = user.nrp_nip === 'livi' || user.can_delete === 0;
  const permission_scope = isCruOnly ? 'CRU' : 'CRUD';
  const can_delete = !isCruOnly;
  const displayRoleName = user.nrp_nip === 'dennyboy'
    ? 'Superadmin CRUD'
    : user.nrp_nip === 'livi'
    ? 'Admin CRU'
    : user.role_name;

  let profileDetails = null;

  if (user.role_code === 'serdik') {
    const [serdikRows] = await pool.query(
      `SELECT nosis, pangkat, angkatan, sindikat, satuan_asal, rencana_judul_taskap 
       FROM user_profiles_serdik 
       WHERE user_id = ?`,
      [userId]
    );
    profileDetails = serdikRows[0] || null;
  } else if (user.role_code === 'gadik') {
    const [gadikRows] = await pool.query(
      `SELECT no_urut_nominatif, pangkat, jabatan, kategori_jabatan, agama, eselon, golongan, status_fungsional, no_sprint, bio 
       FROM user_profiles_gadik 
       WHERE user_id = ?`,
      [userId]
    );
    const [competencies] = await pool.query(
      `SELECT id, competency_name, competency_type 
       FROM gadik_competencies 
       WHERE user_id = ?`,
      [userId]
    );
    profileDetails = {
      ...(gadikRows[0] || {}),
      competencies: competencies || []
    };
  } else if (user.role_code === 'pengelola') {
    const [pengelolaRows] = await pool.query(
      `SELECT unit_kerja, lingkup_akses 
       FROM user_profiles_pengelola 
       WHERE user_id = ?`,
      [userId]
    );
    profileDetails = pengelolaRows[0] || null;
  }

  return {
    id: user.id,
    uuid: user.uuid,
    nrp_nip: user.nrp_nip,
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    pangkat: user.pangkat || (profileDetails?.pangkat || null),
    golongan: user.golongan || (profileDetails?.golongan || null),
    pangkat_golongan: user.pangkat_golongan || user.pangkat || (profileDetails?.pangkat ? `${profileDetails.pangkat}${profileDetails.golongan ? ' / ' + profileDetails.golongan : ''}` : null),
    jabatan: user.jabatan || (profileDetails?.jabatan || null),
    pendidikan_umum_terakhir: user.pendidikan_umum_terakhir || null,
    pendidikan_kedinasan: user.pendidikan_kedinasan || null,
    sertifikasi: user.sertifikasi || null,
    kompetensi_utama: user.kompetensi_utama || null,
    kompetensi: user.kompetensi || null,
    kompetensi_pendukung: user.kompetensi_pendukung || null,
    phone_number: user.phone_number,
    avatar_url: user.avatar_url,
    role: user.role_code,
    role_name: displayRoleName,
    can_delete,
    permission_scope,
    role_description: user.role_description,
    is_active: Boolean(user.is_active),
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    profile: profileDetails
  };
}

/**
 * Update authenticated user's profile details
 * @param {number} userId
 * @param {object} data
 * @param {object} meta
 */
export async function updateUserProfile(userId, data, meta = {}) {
  const { 
    nama_lengkap, 
    phone_number, 
    email, 
    avatar_url, 
    pangkat, 
    golongan,
    pangkat_golongan, 
    jabatan,
    pendidikan_umum_terakhir,
    pendidikan_kedinasan,
    sertifikasi,
    kompetensi_utama,
    kompetensi,
    kompetensi_pendukung
  } = data;

  // Build dynamic update
  const updates = [];
  const params = [];

  if (nama_lengkap !== undefined) {
    updates.push('nama_lengkap = ?');
    params.push(nama_lengkap ? nama_lengkap.trim() : null);
  }
  if (phone_number !== undefined) {
    updates.push('phone_number = ?');
    params.push(phone_number ? phone_number.trim() : null);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email ? email.trim() : null);
  }
  if (avatar_url !== undefined) {
    updates.push('avatar_url = ?');
    params.push(avatar_url);
  }
  if (pangkat !== undefined) {
    updates.push('pangkat = ?');
    params.push(pangkat ? pangkat.trim() : null);
  }
  if (golongan !== undefined) {
    updates.push('golongan = ?');
    params.push(golongan ? golongan.trim() : null);
  }
  if (pangkat_golongan !== undefined) {
    updates.push('pangkat_golongan = ?');
    params.push(pangkat_golongan ? pangkat_golongan.trim() : null);
  } else if (pangkat !== undefined || golongan !== undefined) {
    // Automatically synthesize pangkat_golongan if not explicitly provided
    const combined = [pangkat ? pangkat.trim() : '', golongan ? golongan.trim() : ''].filter(Boolean).join(' / ');
    if (combined) {
      updates.push('pangkat_golongan = ?');
      params.push(combined);
    }
  }
  if (jabatan !== undefined) {
    updates.push('jabatan = ?');
    params.push(jabatan ? jabatan.trim() : null);
  }
  if (pendidikan_umum_terakhir !== undefined) {
    updates.push('pendidikan_umum_terakhir = ?');
    params.push(pendidikan_umum_terakhir ? pendidikan_umum_terakhir.trim() : null);
  }
  if (pendidikan_kedinasan !== undefined) {
    updates.push('pendidikan_kedinasan = ?');
    params.push(pendidikan_kedinasan ? pendidikan_kedinasan.trim() : null);
  }
  if (sertifikasi !== undefined) {
    updates.push('sertifikasi = ?');
    params.push(sertifikasi ? sertifikasi.trim() : null);
  }
  if (kompetensi_utama !== undefined) {
    updates.push('kompetensi_utama = ?');
    params.push(kompetensi_utama ? kompetensi_utama.trim() : null);
  }
  if (kompetensi !== undefined) {
    updates.push('kompetensi = ?');
    params.push(kompetensi ? kompetensi.trim() : null);
  }
  if (kompetensi_pendukung !== undefined) {
    updates.push('kompetensi_pendukung = ?');
    params.push(kompetensi_pendukung ? kompetensi_pendukung.trim() : null);
  }

  if (updates.length > 0) {
    params.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    // If gadik or serdik, optionally sync to profile tables
    if (pangkat !== undefined || jabatan !== undefined || golongan !== undefined) {
      if (pangkat) {
        await pool.query('UPDATE user_profiles_serdik SET pangkat = ? WHERE user_id = ?', [pangkat.trim(), userId]);
      }
      if (pangkat || jabatan || golongan) {
        await pool.query(
          'UPDATE user_profiles_gadik SET pangkat = COALESCE(?, pangkat), jabatan = COALESCE(?, jabatan), golongan = COALESCE(?, golongan) WHERE user_id = ?',
          [pangkat ? pangkat.trim() : null, jabatan ? jabatan.trim() : null, golongan ? golongan.trim() : null, userId]
        );
      }
    }

    await logActivity({
      userId,
      actionType: 'UPDATE_PROFILE',
      entityType: 'users',
      entityId: userId,
      description: 'Pengguna memperbarui data profil akun & kompetensi',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent
    });
  }

  return await getCurrentUserProfile(userId);
}

/**
 * Change authenticated user's password
 * @param {number} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @param {object} meta
 */
export async function changeUserPassword(userId, currentPassword, newPassword, meta = {}) {
  if (!currentPassword || !newPassword) {
    const error = new Error('Kata sandi saat ini dan kata sandi baru wajib diisi');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('Kata sandi baru minimal 8 karakter');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const [users] = await pool.query('SELECT id, nama_lengkap, role_id, password_hash FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    const error = new Error('Pengguna tidak ditemukan');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    const error = new Error('Kata sandi saat ini yang Anda masukkan salah');
    error.statusCode = 400;
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

  await logActivity({
    userId,
    userName: user.nama_lengkap,
    actionType: 'CHANGE_PASSWORD',
    entityType: 'users',
    entityId: userId,
    description: 'Pengguna berhasil mengubah kata sandi akun',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent
  });

  return { success: true, message: 'Kata sandi berhasil diperbarui' };
}

/**
 * Register a new Serdik or Gadik account
 * @param {object} data
 * @param {object} meta - IP and UserAgent
 */
export async function registerUser(data, meta = {}) {
  const {
    nrp_nip,
    nama_lengkap,
    email,
    password,
    role_code = 'serdik',
    phone_number = null,
    // Serdik fields
    nosis,
    pangkat = 'KOMPOL',
    angkatan,
    sindikat = null,
    satuan_asal = null,
    // Gadik fields
    jabatan,
    kategori_jabatan,
    agama = 'ISLAM',
    status_fungsional = 'Aktif Fungsional',
    no_sprint = null,
    bio = null
  } = data;

  // Validation
  if (!nrp_nip || !nama_lengkap || !email || !password) {
    const error = new Error('NRP/NIP, Nama Lengkap, Email, dan Kata Sandi wajib diisi');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Kata sandi minimal harus 6 karakter');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!['serdik', 'gadik', 'pengelola'].includes(role_code)) {
    const error = new Error('Registrasi mandiri hanya diperbolehkan untuk peran serdik, gadik, atau pengelola');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Check unique nrp_nip & email
  const [existingUsers] = await pool.query(
    'SELECT id, nrp_nip, email FROM users WHERE nrp_nip = ? OR email = ?',
    [nrp_nip.trim(), email.trim()]
  );

  if (existingUsers.length > 0) {
    const matched = existingUsers[0];
    const field = matched.nrp_nip === nrp_nip.trim() ? 'NRP/NIP' : 'Email';
    const error = new Error(`${field} sudah terdaftar dalam sistem`);
    error.statusCode = 409;
    error.code = 'CONFLICT';
    throw error;
  }

  // If serdik, check/populate nosis & angkatan
  const cleanNosis = (nosis && nosis.trim()) || `2026${nrp_nip.trim().slice(-4)}`;
  const cleanAngkatan = (angkatan && angkatan.trim()) || 'Sespimma Angkatan 73 TA 2026';

  if (role_code === 'serdik') {
    const [existingNosis] = await pool.query(
      'SELECT user_id FROM user_profiles_serdik WHERE nosis = ?',
      [cleanNosis]
    );
    if (existingNosis.length > 0) {
      const error = new Error('Nomor Siswa (NOSIS) sudah terdaftar');
      error.statusCode = 409;
      error.code = 'CONFLICT';
      throw error;
    }
  }

  // If gadik, ensure default jabatan & kategori_jabatan
  const cleanJabatan = jabatan ? jabatan.trim() : 'Gadik Madya Sespimma';
  const cleanKategoriJabatan = kategori_jabatan ? kategori_jabatan.trim() : 'Kepemimpinan & Manajemen Operasional';

  // Fetch role_id
  const [roles] = await pool.query('SELECT id, role_name FROM roles WHERE role_code = ?', [role_code]);
  if (roles.length === 0) {
    const error = new Error(`Role ${role_code} tidak ditemukan`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const role = roles[0];

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const userUuid = crypto.randomUUID();

  // Begin transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users (uuid, nrp_nip, nama_lengkap, email, password_hash, role_id, phone_number, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userUuid, nrp_nip.trim(), nama_lengkap.trim(), email.trim(), passwordHash, role.id, phone_number]
    );

    const newUserId = userResult.insertId;

    if (role_code === 'serdik') {
      await connection.query(
        `INSERT INTO user_profiles_serdik (user_id, nosis, pangkat, angkatan, sindikat, satuan_asal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newUserId, cleanNosis, pangkat, cleanAngkatan, sindikat, satuan_asal]
      );
    } else if (role_code === 'gadik') {
      await connection.query(
        `INSERT INTO user_profiles_gadik (user_id, pangkat, jabatan, kategori_jabatan, agama, status_fungsional, no_sprint, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newUserId, pangkat, cleanJabatan, cleanKategoriJabatan, agama, status_fungsional, no_sprint, bio]
      );
    } else if (role_code === 'pengelola') {
      const cleanLingkup = Array.isArray(data.lingkup_akses) ? data.lingkup_akses.join(', ') : (data.lingkup_akses || 'Katalogisasi Buku Fisik, Unggah E-Book');
      await connection.query(
        `INSERT INTO user_profiles_pengelola (user_id, unit_kerja, lingkup_akses)
         VALUES (?, ?, ?)`,
        [newUserId, data.unit_kerja || 'Subbag Renmin / Unit Perpustakaan Sespimma', cleanLingkup]
      );
    }

    await connection.commit();

    // Log activity
    await logActivity({
      userId: newUserId,
      userName: nama_lengkap.trim(),
      role: role_code,
      actionType: 'REGISTER',
      entityType: 'users',
      entityId: newUserId,
      description: `Pendaftaran pengguna baru: ${nama_lengkap.trim()} sebagai ${role.role_name}`,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent
    });

    const tokenPayload = {
      id: newUserId,
      uuid: userUuid,
      nrp_nip: nrp_nip.trim(),
      nama_lengkap: nama_lengkap.trim(),
      email: email.trim(),
      role_id: role.id,
      role: role_code,
      role_name: role.role_name
    };

    const token = generateToken(tokenPayload);

    return {
      user: {
        id: newUserId,
        uuid: userUuid,
        nrp_nip: nrp_nip.trim(),
        nama_lengkap: nama_lengkap.trim(),
        email: email.trim(),
        role: role_code,
        role_name: role.role_name,
        phone_number
      },
      token,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '24h'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

