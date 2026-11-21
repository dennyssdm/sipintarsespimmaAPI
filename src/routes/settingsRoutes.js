import express from 'express';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

/**
 * Public route to fetch current active infographic configuration
 * Allows landing & login pages to load customized infographic without authentication token
 */
router.get('/infographic', adminController.getInfographic);

export default router;
