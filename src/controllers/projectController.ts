import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Project, ProjectStatus, ProjectType } from '../models/Project';
import { ProjectImage } from '../models/ProjectImage';
import { ProjectUnit, UnitStatus } from '../models/ProjectUnit';
import { User, UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { Op } from 'sequelize';

interface ProjectRequest extends AuthenticatedRequest {
  user?: {
    userId: number;
    id: number;
    email: string;
    role: UserRole;
  };
}

class ProjectController {
  // Validation rules
  static createProjectValidation = [
    body('name').trim().isLength({ min: 3, max: 255 }).withMessage('Project name must be between 3 and 255 characters'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('location').trim().isLength({ min: 3, max: 255 }).withMessage('Location is required'),
    body('address').trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
    body('city').trim().isLength({ min: 2, max: 100 }).withMessage('City is required'),
    body('state').trim().isLength({ min: 2, max: 100 }).withMessage('State is required'),
    body('pincode').trim().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body('projectType').isIn(Object.values(ProjectType)).withMessage('Invalid project type'),
  ];

  static createUnitValidation = [
    body('unitNumber').trim().isLength({ min: 1, max: 50 }).withMessage('Unit number is required'),
    body('unitType').trim().isLength({ min: 1, max: 20 }).withMessage('Unit type is required'),
    body('floorNumber').isInt({ min: 0 }).withMessage('Floor number must be a positive integer'),
    body('areaSqft').isFloat({ min: 1 }).withMessage('Area in sqft must be greater than 0'),
    body('price').isFloat({ min: 1 }).withMessage('Price must be greater than 0'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').isInt({ min: 1 }).withMessage('Bathrooms must be at least 1'),
  ];

  // Get all projects for builder
  async getBuilderProjects(req: ProjectRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const { rows: projects, count: total } = await Project.findAndCountAll({
        where: {
          builder_id: req.user.userId,
        },
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      // Manually fetch images and units for each project
      const projectsWithDetails = await Promise.all(
        projects.map(async (project) => {
          const images = await ProjectImage.findAll({
            where: { project_id: project.id, is_primary: true },
          });

          const units = await ProjectUnit.findAll({
            where: { project_id: project.id },
            attributes: ['id', 'status'],
          });

          const projectData = project.toJSON() as any;
          
          const stats = {
            total: units.length,
            available: units.filter((u: any) => u.status === UnitStatus.AVAILABLE).length,
            sold: units.filter((u: any) => u.status === UnitStatus.SOLD).length,
            blocked: units.filter((u: any) => u.status === UnitStatus.BLOCKED).length,
          };

          return {
            ...projectData,
            images,
            unitStats: stats,
          };
        })
      );

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          projects: projectsWithDetails,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error('Get builder projects error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve projects',
        },
      });
    }
  }

  // Get project by ID
  async getProjectById(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid project ID',
            details: errors.array(),
          },
        });
        return;
      }

      const projectId = parseInt(req.params.id);
      const userId = req.user?.userId;

      const project = await Project.findOne({
        where: {
          id: projectId,
          ...(req.user?.role === 'builder' ? { builder_id: userId } : {}),
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      // Manually fetch related data
      const [builder, images, units] = await Promise.all([
        User.findByPk(project.builder_id, {
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        }),
        ProjectImage.findAll({
          where: { project_id: projectId },
          order: [['display_order', 'ASC']],
        }),
        ProjectUnit.findAll({
          where: { project_id: projectId },
          order: [['floor_number', 'ASC'], ['unit_number', 'ASC']],
        }),
      ]);

      const projectData = project.toJSON() as any;

      res.json({
        success: true,
        data: { 
          project: {
            ...projectData,
            builder,
            images,
            units,
          }
        },
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve project',
        },
      });
    }
  }

  // Create new project
  async createProject(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
        });
        return;
      }

      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      const {
        name,
        description,
        location,
        address,
        city,
        state,
        pincode,
        projectType,
        totalUnits,
        startDate,
        expectedCompletion,
        reraNumber,
        amenities,
        specifications,
        pricing,
      } = req.body;

      const project = await Project.create({
        builder_id: req.user.userId,
        name,
        description,
        location,
        address,
        city,
        state,
        pincode,
        project_type: projectType,
        status: ProjectStatus.PLANNING,
        total_units: totalUnits || 0,
        available_units: totalUnits || 0,
        sold_units: 0,
        blocked_units: 0,
        start_date: startDate ? new Date(startDate) : undefined,
        expected_completion: expectedCompletion ? new Date(expectedCompletion) : undefined,
        rera_number: reraNumber,
        approval_status: 'pending',
        amenities: amenities || [],
        specifications: specifications || {},
        pricing: pricing || {},
        is_active: true,
        featured: false,
      });

      res.status(201).json({
        success: true,
        data: { project },
        message: 'Project created successfully',
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create project',
        },
      });
    }
  }

  // Update project
  async updateProject(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      const updateData = { ...req.body };
      delete updateData.id;
      delete updateData.builder_id;

      await project.update(updateData);

      res.json({
        success: true,
        data: { project },
        message: 'Project updated successfully',
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update project',
        },
      });
    }
  }

  // Create project unit
  async createProjectUnit(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
        });
        return;
      }

      const projectId = parseInt(req.params.projectId);
      
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      // Verify project ownership
      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: req.user.userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      const {
        unitNumber,
        unitType,
        floorNumber,
        tower,
        areaSqft,
        areaSqm,
        carpetArea,
        builtUpArea,
        superBuiltUpArea,
        price,
        pricePerSqft,
        maintenanceCharge,
        parkingSpaces,
        balconies,
        bathrooms,
        bedrooms,
        facing,
        specifications,
        amenities,
        isCornerUnit,
        hasTerrace,
      } = req.body;

      const unit = await ProjectUnit.create({
        project_id: projectId,
        unit_number: unitNumber,
        unit_type: unitType,
        floor_number: floorNumber,
        tower,
        area_sqft: areaSqft,
        area_sqm: areaSqm || (areaSqft * 0.092903),
        carpet_area: carpetArea,
        built_up_area: builtUpArea,
        super_built_up_area: superBuiltUpArea,
        price,
        price_per_sqft: pricePerSqft || (price / areaSqft),
        maintenance_charge: maintenanceCharge,
        parking_spaces: parkingSpaces || 0,
        balconies: balconies || 0,
        bathrooms,
        bedrooms,
        facing,
        status: UnitStatus.AVAILABLE,
        specifications: specifications || {},
        amenities: amenities || [],
        is_corner_unit: isCornerUnit || false,
        has_terrace: hasTerrace || false,
      });

      // Update project unit counts
      await project.increment('available_units');
      await project.increment('total_units');

      res.status(201).json({
        success: true,
        data: { unit },
        message: 'Unit created successfully',
      });
    } catch (error) {
      console.error('Create unit error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create unit',
        },
      });
    }
  }

  // Get project units
  async getProjectUnits(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as UnitStatus;
      const unitType = req.query.unitType as string;

      const whereClause: any = { project_id: projectId };
      if (status) whereClause.status = status;
      if (unitType) whereClause.unit_type = unitType;

      const { rows: units, count: total } = await ProjectUnit.findAndCountAll({
        where: whereClause,
        order: [['floor_number', 'ASC'], ['unit_number', 'ASC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          units,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error('Get project units error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve units',
        },
      });
    }
  }

  // Bulk create units
  async bulkCreateUnits(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      // Verify project ownership
      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: req.user.userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      const { units } = req.body;

      if (!Array.isArray(units) || units.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Units array is required',
          },
        });
        return;
      }

      // Add project_id to each unit
      const unitsToCreate = units.map(unit => ({
        ...unit,
        project_id: projectId,
        status: UnitStatus.AVAILABLE,
        area_sqm: unit.area_sqm || (unit.area_sqft * 0.092903),
        price_per_sqft: unit.price_per_sqft || (unit.price / unit.area_sqft),
      }));

      const createdUnits = await ProjectUnit.bulkCreate(unitsToCreate);

      // Update project unit counts
      await project.increment('available_units', { by: createdUnits.length });
      await project.increment('total_units', { by: createdUnits.length });

      res.status(201).json({
        success: true,
        data: { units: createdUnits, count: createdUnits.length },
        message: `${createdUnits.length} units created successfully`,
      });
    } catch (error) {
      console.error('Bulk create units error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create units',
        },
      });
    }
  }
  async bulkCreateUnitsFromCSV(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      // Verify project ownership
      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: req.user.userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'CSV file is required',
          },
        });
        return;
      }

      // Parse CSV file
      const csvData = req.file.buffer.toString('utf-8');
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const unitsToCreate: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        const unit: any = {};

        headers.forEach((header, index) => {
          unit[header] = values[index];
        });

        // Validate required fields
        if (!unit.unit_number || !unit.unit_type || !unit.area_sqft || !unit.price) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Create unit object
        unitsToCreate.push({
          project_id: projectId,
          unit_number: unit.unit_number,
          unit_type: unit.unit_type,
          floor_number: parseInt(unit.floor_number) || 0,
          tower: unit.tower || null,
          area_sqft: parseFloat(unit.area_sqft),
          area_sqm: unit.area_sqm ? parseFloat(unit.area_sqm) : parseFloat(unit.area_sqft) * 0.092903,
          carpet_area: unit.carpet_area ? parseFloat(unit.carpet_area) : null,
          built_up_area: unit.built_up_area ? parseFloat(unit.built_up_area) : null,
          super_built_up_area: unit.super_built_up_area ? parseFloat(unit.super_built_up_area) : null,
          price: parseFloat(unit.price),
          price_per_sqft: unit.price_per_sqft ? parseFloat(unit.price_per_sqft) : parseFloat(unit.price) / parseFloat(unit.area_sqft),
          maintenance_charge: unit.maintenance_charge ? parseFloat(unit.maintenance_charge) : null,
          parking_spaces: parseInt(unit.parking_spaces) || 0,
          balconies: parseInt(unit.balconies) || 0,
          bathrooms: parseInt(unit.bathrooms) || 1,
          bedrooms: parseInt(unit.bedrooms) || 0,
          facing: unit.facing || null,
          status: UnitStatus.AVAILABLE,
          specifications: {},
          amenities: [],
          is_corner_unit: unit.is_corner_unit === 'true' || unit.is_corner_unit === '1',
          has_terrace: unit.has_terrace === 'true' || unit.has_terrace === '1',
        });
      }

      if (unitsToCreate.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'No valid units found in CSV',
            details: errors,
          },
        });
        return;
      }

      const createdUnits = await ProjectUnit.bulkCreate(unitsToCreate);

      // Update project unit counts
      await project.increment('available_units', { by: createdUnits.length });
      await project.increment('total_units', { by: createdUnits.length });

      res.status(201).json({
        success: true,
        data: { 
          units: createdUnits, 
          count: createdUnits.length,
          errors: errors.length > 0 ? errors : undefined
        },
        message: `${createdUnits.length} units created successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      });
    } catch (error) {
      console.error('Bulk create units from CSV error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create units from CSV',
        },
      });
    }
  }

  // Download CSV template
  async downloadCSVTemplate(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const csvHeaders = [
        'unit_number',
        'unit_type',
        'floor_number',
        'tower',
        'area_sqft',
        'area_sqm',
        'carpet_area',
        'built_up_area',
        'super_built_up_area',
        'price',
        'price_per_sqft',
        'maintenance_charge',
        'parking_spaces',
        'balconies',
        'bathrooms',
        'bedrooms',
        'facing',
        'is_corner_unit',
        'has_terrace'
      ];

      const sampleData = [
        '101,2BHK,1,A,1200,111.48,1000,1100,1200,5000000,4166.67,2000,1,1,2,2,East,false,false',
        '102,3BHK,1,A,1500,139.35,1300,1400,1500,7500000,5000,2500,2,2,3,3,North,true,false',
        '201,2BHK,2,A,1200,111.48,1000,1100,1200,5200000,4333.33,2000,1,1,2,2,West,false,false'
      ];

      const csv = [csvHeaders.join(','), ...sampleData].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=units_template.csv');
      res.send(csv);
    } catch (error) {
      console.error('Download CSV template error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to download template',
        },
      });
    }
  }

  // Update project unit
  async updateProjectUnit(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
        });
        return;
      }

      const projectId = parseInt(req.params.projectId);
      const unitId = parseInt(req.params.unitId);
      
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      // Verify project ownership
      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: req.user.userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      // Find the unit
      const unit = await ProjectUnit.findOne({
        where: {
          id: unitId,
          project_id: projectId,
        },
      });

      if (!unit) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Unit not found',
          },
        });
        return;
      }

      const oldStatus = unit.status;
      const {
        unitNumber,
        unitType,
        floorNumber,
        tower,
        areaSqft,
        areaSqm,
        carpetArea,
        builtUpArea,
        superBuiltUpArea,
        price,
        pricePerSqft,
        maintenanceCharge,
        parkingSpaces,
        balconies,
        bathrooms,
        bedrooms,
        facing,
        status,
        specifications,
        amenities,
        isCornerUnit,
        hasTerrace,
      } = req.body;

      // Update unit
      await unit.update({
        unit_number: unitNumber,
        unit_type: unitType,
        floor_number: floorNumber,
        tower,
        area_sqft: areaSqft,
        area_sqm: areaSqm || (areaSqft * 0.092903),
        carpet_area: carpetArea,
        built_up_area: builtUpArea,
        super_built_up_area: superBuiltUpArea,
        price,
        price_per_sqft: pricePerSqft || (price / areaSqft),
        maintenance_charge: maintenanceCharge,
        parking_spaces: parkingSpaces,
        balconies: balconies,
        bathrooms,
        bedrooms,
        facing,
        status,
        specifications: specifications || {},
        amenities: amenities || [],
        is_corner_unit: isCornerUnit,
        has_terrace: hasTerrace,
      });

      // Update project counts if status changed
      if (oldStatus !== status) {
        if (oldStatus === UnitStatus.AVAILABLE) {
          await project.decrement('available_units');
        } else if (oldStatus === UnitStatus.SOLD) {
          await project.decrement('sold_units');
        } else if (oldStatus === UnitStatus.BLOCKED) {
          await project.decrement('blocked_units');
        }

        if (status === UnitStatus.AVAILABLE) {
          await project.increment('available_units');
        } else if (status === UnitStatus.SOLD) {
          await project.increment('sold_units');
        } else if (status === UnitStatus.BLOCKED) {
          await project.increment('blocked_units');
        }
      }

      res.json({
        success: true,
        data: { unit },
        message: 'Unit updated successfully',
      });
    } catch (error) {
      console.error('Update unit error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update unit',
        },
      });
    }
  }

  // Delete project unit
  async deleteProjectUnit(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      const unitId = parseInt(req.params.unitId);
      
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      // Verify project ownership
      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: req.user.userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      // Find the unit
      const unit = await ProjectUnit.findOne({
        where: {
          id: unitId,
          project_id: projectId,
        },
      });

      if (!unit) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Unit not found',
          },
        });
        return;
      }

      const unitStatus = unit.status;

      // Delete the unit
      await unit.destroy();

      // Update project counts
      await project.decrement('total_units');
      if (unitStatus === UnitStatus.AVAILABLE) {
        await project.decrement('available_units');
      } else if (unitStatus === UnitStatus.SOLD) {
        await project.decrement('sold_units');
      } else if (unitStatus === UnitStatus.BLOCKED) {
        await project.decrement('blocked_units');
      }

      res.json({
        success: true,
        message: 'Unit deleted successfully',
      });
    } catch (error) {
      console.error('Delete unit error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete unit',
        },
      });
    }
  }

  // Get single unit details
  async getProjectUnit(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      const unitId = parseInt(req.params.unitId);

      const unit = await ProjectUnit.findOne({
        where: {
          id: unitId,
          project_id: projectId,
        },
      });

      if (!unit) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Unit not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { unit },
      });
    } catch (error) {
      console.error('Get unit error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve unit',
        },
      });
    }
  }

  // Update project status
  async updateProjectStatus(req: ProjectRequest, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      const { status } = req.body;

      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      if (!Object.values(ProjectStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Invalid project status',
          },
        });
        return;
      }

      const project = await Project.findOne({
        where: {
          id: projectId,
          builder_id: req.user.userId,
        },
      });

      if (!project) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
        return;
      }

      await project.update({ status });

      res.json({
        success: true,
        data: { project },
        message: 'Project status updated successfully',
      });
    } catch (error) {
      console.error('Update project status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update project status',
        },
      });
    }
  }

  // Get project statistics
  async getProjectStats(req: ProjectRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'builder') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Builder role required.',
          },
        });
        return;
      }

      const builderId = req.user.userId;

      const [totalProjects, activeProjects, totalUnits, soldUnits, availableUnits] = await Promise.all([
        Project.count({ where: { builder_id: builderId } }),
        Project.count({ 
          where: { 
            builder_id: builderId, 
            status: {
              [Op.in]: [ProjectStatus.PRE_LAUNCH, ProjectStatus.UNDER_CONSTRUCTION]
            }
          } 
        }),
        ProjectUnit.count({
          include: [{
            model: Project,
            as: 'project',
            where: { builder_id: builderId },
          }],
        }),
        ProjectUnit.count({
          where: { status: UnitStatus.SOLD },
          include: [{
            model: Project,
            as: 'project',
            where: { builder_id: builderId },
          }],
        }),
        ProjectUnit.count({
          where: { status: UnitStatus.AVAILABLE },
          include: [{
            model: Project,
            as: 'project',
            where: { builder_id: builderId },
          }],
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalProjects,
          activeProjects,
          totalUnits,
          soldUnits,
          availableUnits,
          blockedUnits: totalUnits - soldUnits - availableUnits,
        },
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve statistics',
        },
      });
    }
  }
}

const projectController = new ProjectController();
export { ProjectController };
export default projectController;