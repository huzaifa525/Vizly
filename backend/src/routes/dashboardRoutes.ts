import { Router } from 'express';
import {
  createDashboard,
  getDashboards,
  getDashboard,
  updateDashboard,
  deleteDashboard
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createDashboard);
router.get('/', getDashboards);
router.get('/:id', getDashboard);
router.put('/:id', updateDashboard);
router.delete('/:id', deleteDashboard);

export default router;
