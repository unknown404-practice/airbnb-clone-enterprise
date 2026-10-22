import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  switchRole,
  refreshToken,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, authSchemas } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validate(authSchemas.register), register);
router.get('/register', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'User registration requires a POST request with JSON body { name, email, password, role }.',
    interactiveUI: 'To register via the UI, visit http://localhost:5173/ and open the Sign up modal.'
  });
});

router.post('/login', validate(authSchemas.login), login);
router.get('/login', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'User login requires a POST request with JSON body { email, password }.',
    interactiveUI: 'To log in via the web UI, open http://localhost:5173/ and click the user avatar in the top right corner.',
    demoAccounts: [
      { role: 'guest', email: 'sophia@traveller.io', password: 'password123' },
      { role: 'host', email: 'host@luxuryretreats.com', password: 'password123' }
    ]
  });
});
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/switch-role', requireAuth, switchRole);

export default router;
