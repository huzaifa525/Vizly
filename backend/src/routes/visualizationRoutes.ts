import { Router } from 'express';
import {
  createVisualization,
  getVisualizations,
  getVisualization,
  updateVisualization,
  deleteVisualization
} from '../controllers/visualizationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createVisualization);
router.get('/', getVisualizations);
router.get('/:id', getVisualization);
router.put('/:id', updateVisualization);
router.delete('/:id', deleteVisualization);

export default router;
