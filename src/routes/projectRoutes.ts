import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const projectController = new ProjectController();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Project routes
router.get('/', authenticate, projectController.getBuilderProjects.bind(projectController));
router.get('/:id', authenticate, projectController.getProjectById.bind(projectController));
router.post('/', authenticate, ProjectController.createProjectValidation, projectController.createProject.bind(projectController));
router.put('/:id', authenticate, projectController.updateProject.bind(projectController));

// Unit routes
router.get('/:projectId/units', authenticate, projectController.getProjectUnits.bind(projectController));
// Specific routes must come BEFORE parameterized routes
router.get('/:projectId/units/template', authenticate, projectController.downloadCSVTemplate.bind(projectController));
router.post('/:projectId/units/bulk', authenticate, projectController.bulkCreateUnits.bind(projectController));
router.post('/:projectId/units/bulk-csv', authenticate, upload.single('file'), projectController.bulkCreateUnitsFromCSV.bind(projectController));
// Parameterized routes come after specific routes
router.get('/:projectId/units/:unitId', authenticate, projectController.getProjectUnit.bind(projectController));
router.post('/:projectId/units', authenticate, ProjectController.createUnitValidation, projectController.createProjectUnit.bind(projectController));
router.put('/:projectId/units/:unitId', authenticate, ProjectController.createUnitValidation, projectController.updateProjectUnit.bind(projectController));
router.delete('/:projectId/units/:unitId', authenticate, projectController.deleteProjectUnit.bind(projectController));

export default router;