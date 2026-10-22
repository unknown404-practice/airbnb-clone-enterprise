import express from 'express';
import { createReview, getListingReviews } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, reviewSchemas } from '../middleware/validate.js';

const router = express.Router();

router.post('/', requireAuth, validate(reviewSchemas.create), createReview);
router.get('/listing/:listingId', getListingReviews);

export default router;
