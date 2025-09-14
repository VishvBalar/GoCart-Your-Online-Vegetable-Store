import { requireAuth } from '../middlewares/authMiddleware.js';
import { isAuth, registerUser, loginUser, logoutUser } from '../controllers/userController.js';

router.get('/is-auth', requireAuth, isAuth);
router.post('/logout', requireAuth, logoutUser);
// ...other routes