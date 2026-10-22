import express from 'express';
import {
  getListings,
  getListingById,
  getBookedDates,
  createListing,
  updateListing,
  deleteListing,
  getHostListings,
} from '../controllers/listingController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getListings);
router.get('/host/my-listings', requireAuth, requireRole(['host', 'admin']), getHostListings);
router.get('/:id', getListingById);
router.get('/:id/booked-dates', getBookedDates);
router.post('/', requireAuth, requireRole(['host', 'admin']), createListing);
router.put('/:id', requireAuth, updateListing);
router.delete('/:id', requireAuth, deleteListing);

export default router;
