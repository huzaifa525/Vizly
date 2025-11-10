import { Router } from 'express';
import {
  createConnection,
  getConnections,
  getConnection,
  updateConnection,
  deleteConnection,
  testConnection
} from '../controllers/connectionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createConnection);
router.get('/', getConnections);
router.get('/:id', getConnection);
router.put('/:id', updateConnection);
router.delete('/:id', deleteConnection);
router.post('/:id/test', testConnection);

export default router;
