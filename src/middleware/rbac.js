import { sendError } from '../utils/responseFormatter.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Enforces allowed roles based on user's role_code in database
 * @param  {...string|string[]} roles - Allowed role codes, e.g. 'admin', 'verifikator', 'gadik', 'serdik', 'pengelola', 'pimpinan'
 */
export function authorizeRoles(...roles) {
  // Flatten array arguments in case an array was passed
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Autentikasi diperlukan sebelum otorisasi peran.',
        [],
        401
      );
    }

    if (!allowedRoles.includes(req.user.role_code)) {
      return sendError(
        res,
        'FORBIDDEN',
        `Akses ditolak: Peran pengguna (${req.user.role_name || req.user.role_code}) tidak memiliki wewenang untuk tindakan ini.`,
        [`Peran yang diizinkan: ${allowedRoles.join(', ')}`],
        403
      );
    }

    next();
  };
}

/**
 * Middleware to restrict Delete operations (CRUD vs CRU).
 * Rejects users with CRU permission scope (e.g. 'livi') with 403 FORBIDDEN.
 */
export function authorizeDeleteAction(req, res, next) {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Autentikasi diperlukan sebelum tindakan hapus.', [], 401);
  }

  const isCruOnly = req.user.permission_scope === 'CRU' || req.user.can_delete === false || req.user.nrp_nip === 'livi';

  if (isCruOnly) {
    return sendError(
      res,
      'FORBIDDEN',
      'Akses ditolak: Akun Anda memiliki wewenang Admin CRU (Create, Read, Update). Tindakan Delete (Hapus) hanya dapat dilakukan oleh Superadmin CRUD (dennyboy).',
      ['Izin akun: CRU Saja (Dilarang Hapus Data)'],
      403
    );
  }

  next();
}

export default authorizeRoles;
