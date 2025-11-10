import { Router } from 'express';
import {
  createQuery,
  getQueries,
  getQuery,
  updateQuery,
  deleteQuery,
  executeQuery
} from '../controllers/queryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createQuery);
router.get('/', getQueries);
router.get('/:id', getQuery);
router.put('/:id', updateQuery);
router.delete('/:id', deleteQuery);
router.post('/:id/execute', executeQuery);

export default router;
