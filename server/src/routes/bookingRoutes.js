import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, bookingSchemas } from '../middleware/validate.js';

const router = express.Router();

router.post('/', requireAuth, validate(bookingSchemas.create), createBooking);
router.get('/my-trips', requireAuth, getMyBookings);
router.get('/:id', requireAuth, getBookingById);
router.patch('/:id/cancel', requireAuth, cancelBooking);

export default router;
