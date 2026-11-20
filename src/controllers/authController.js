import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/responseFormatter.js';

/**
 * Controller for user login
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { identifier, nrp_nip, email, password } = req.body;
    const loginIdentifier = identifier || nrp_nip || email;

    const meta = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const result = await authService.loginUser(loginIdentifier, password, meta);

    return sendSuccess(res, 'Autentikasi berhasil', result, null, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for getting current authenticated user profile
 * GET /api/v1/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await authService.getCurrentUserProfile(userId);

    return sendSuccess(res, 'Profil pengguna berhasil diambil', profile, null, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for updating current authenticated user profile
 * PUT /api/v1/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const meta = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const updated = await authService.updateUserProfile(userId, req.body, meta);

    return sendSuccess(res, 'Profil pengguna berhasil diperbarui', updated, null, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for changing authenticated user's password
 * POST /api/v1/auth/change-password
 */
export async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
    const meta = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const result = await authService.changeUserPassword(userId, current_password, new_password, meta);

    return sendSuccess(res, 'Kata sandi berhasil diperbarui', result, null, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for self-registration of Serdik or Gadik
 * POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const meta = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const result = await authService.registerUser(req.body, meta);

    return sendSuccess(res, 'Registrasi akun berhasil', result, null, 201);
  } catch (error) {
    next(error);
  }
}

