import express from 'express';
import { createReview, getListingReviews } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createReview);
router.get('/listing/:listingId', getListingReviews);

export default router;
