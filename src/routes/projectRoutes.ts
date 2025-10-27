import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import projectController, { ProjectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = Router();

// --- FIX: Multer configuration for IMAGE uploads ---
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/projects';
    // Ensure the directory exists
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `project-${req.params.projectId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
});


// --- Multer configuration for CSV uploads ---
const csvStorage = multer.memoryStorage(); // Keep CSV in memory for processing

const csvFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const uploadCsv = multer({ storage: csvStorage, fileFilter: csvFileFilter });


// --- Public Project Routes (no authentication required) ---
router.get('/public', projectController.getPublicProjects);
router.get('/public/recent', projectController.getRecentProjects);

// --- Project Routes ---
router.get('/', authenticate, projectController.getBuilderProjects);
router.post('/', authenticate, ProjectController.createProjectValidation, projectController.createProject);

router.get('/:id', authenticate, projectController.getProjectById);
router.put('/:id', authenticate, projectController.updateProject);
router.patch('/:id/status', authenticate, projectController.updateProjectStatus);

// --- Unit Routes ---
router.get('/:projectId/units', authenticate, projectController.getProjectUnits);
router.post('/:projectId/units', authenticate, ProjectController.createUnitValidation, projectController.createProjectUnit);
router.post('/:projectId/units/bulk', authenticate, projectController.bulkCreateUnits);
router.post('/:projectId/units/bulk-csv', authenticate, uploadCsv.single('file'), projectController.bulkCreateUnitsFromCSV);
router.get('/:projectId/units/template', authenticate, projectController.downloadCSVTemplate);

router.get('/:projectId/units/:unitId', authenticate, projectController.getProjectUnit);
router.put('/:projectId/units/:unitId', authenticate, projectController.updateProjectUnit);
router.delete('/:projectId/units/:unitId', authenticate, projectController.deleteProjectUnit);

// --- Image Routes ---
// FIX: Use the correct 'uploadImages' multer instance here
router.post('/:projectId/images', authenticate, uploadImages.array('images', 10), projectController.uploadProjectImages);
router.delete('/:projectId/images/:imageId', authenticate, projectController.deleteProjectImage);

// --- Stats Route ---
router.get('/stats', authenticate, projectController.getProjectStats);


export default router;