import { api } from '@/shared/lib/api';
import { Project } from '../types';

interface ProjectFilters {
  page?: number;
  limit?: number;
  status?: string;
  project_type?: string;
  search?: string;
}

interface ProjectResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class ProjectService {
  async getBuilderProjects(filters: ProjectFilters = {}): Promise<ProjectResponse> {
    try {
      console.log('ProjectService: Fetching builder projects with filters:', filters);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.project_type) params.append('project_type', filters.project_type);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = queryString ? `/projects?${queryString}` : '/projects';
      
      console.log('ProjectService: Making API call to:', url);
      const response = await api.projects.getBuilderProjects(filters);
      console.log('ProjectService: API response:', response);
      
      // The API already returns the correct format
      return response;
    } catch (error) {
      console.error('ProjectService: Error fetching builder projects:', error);
      return {
        success: false,
        data: {
          projects: [],
          pagination: {
            page: 1,
            limit: filters.limit || 12,
            total: 0,
            totalPages: 0
          }
        }
      };
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      console.log(`ProjectService: Fetching project ${id}`);
      const response = await api.projects.getProjectById(parseInt(id));
      console.log('ProjectService: Project response:', response);
      
      return response.data?.project || null;
    } catch (error) {
      console.error(`ProjectService: Error fetching project ${id}:`, error);
      return null;
    }
  }

  async createProject(projectData: any): Promise<Project> {
    try {
      console.log('ProjectService: Creating project:', projectData);
      
      // Backend validation expects camelCase, so keep it as-is
      const apiData = {
        name: projectData.name,
        description: projectData.description,
        location: projectData.location,
        address: projectData.address,
        city: projectData.city,
        state: projectData.state,
        pincode: projectData.pincode,
        projectType: projectData.projectType, // Keep camelCase for backend validation
        totalUnits: projectData.totalUnits || 0,
        startDate: projectData.startDate,
        expectedCompletion: projectData.expectedCompletion,
        reraNumber: projectData.reraNumber,
        amenities: projectData.amenities,
        specifications: projectData.specifications,
        pricing: projectData.pricing
      };
      
      const response = await api.projects.createProject(apiData);
      console.log('ProjectService: Create response:', response);
      
      return response.data.project;
    } catch (error) {
      console.error('ProjectService: Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: any): Promise<Project> {
    try {
      console.log(`ProjectService: Updating project ${id}:`, projectData);
      const response = await api.projects.updateProject(parseInt(id), projectData);
      console.log('ProjectService: Update response:', response);
      
      return response.data.project;
    } catch (error) {
      console.error(`ProjectService: Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      console.log(`ProjectService: Deleting project ${id}`);
      await api.projects.deleteProject(parseInt(id));
      console.log(`ProjectService: Project ${id} deleted successfully`);
    } catch (error) {
      console.error(`ProjectService: Error deleting project ${id}:`, error);
      throw error;
    }
  }

  async getProjectUnits(projectId: string, options?: { paginated?: boolean; limit?: number }) {
    try {
      console.log(`ProjectService: Fetching units for project ${projectId}`);
      
      // By default, get all units unless specifically requesting pagination
      const params = options?.paginated 
        ? { limit: options.limit || 20 }
        : { all: true };
        
      const response = await api.projects.units.getUnits(parseInt(projectId), params);
      console.log('ProjectService: Units response:', response);
      
      return response.data.units || [];
    } catch (error) {
      console.error(`ProjectService: Error fetching units for project ${projectId}:`, error);
      return [];
    }
  }

  async addProjectUnit(projectId: string, unitData: any) {
    try {
      console.log(`ProjectService: Adding unit to project ${projectId}:`, unitData);
      const response = await api.projects.units.createUnit(parseInt(projectId), unitData);
      console.log('ProjectService: Add unit response:', response);
      
      return response.data.unit;
    } catch (error) {
      console.error(`ProjectService: Error adding unit to project ${projectId}:`, error);
      throw error;
    }
  }

  async getUnit(projectId: string, unitId: number) {
    try {
      console.log(`ProjectService: Fetching unit ${unitId} from project ${projectId}`);
      const response = await api.projects.units.getUnit(parseInt(projectId), unitId);
      console.log('ProjectService: Get unit response:', response);
      
      return response;
    } catch (error) {
      console.error(`ProjectService: Error fetching unit ${unitId} from project ${projectId}:`, error);
      throw error;
    }
  }

  async updateUnit(projectId: string, unitId: number, unitData: any) {
    try {
      console.log(`ProjectService: Updating unit ${unitId} in project ${projectId}:`, unitData);
      const response = await api.projects.units.updateUnit(parseInt(projectId), unitId, unitData);
      console.log('ProjectService: Update unit response:', response);
      
      return response;
    } catch (error) {
      console.error(`ProjectService: Error updating unit ${unitId} in project ${projectId}:`, error);
      throw error;
    }
  }

  async deleteUnit(projectId: string, unitId: number) {
    try {
      console.log(`ProjectService: Deleting unit ${unitId} from project ${projectId}`);
      const response = await api.projects.units.deleteUnit(parseInt(projectId), unitId);
      console.log('ProjectService: Delete unit response:', response);
      
      return response;
    } catch (error) {
      console.error(`ProjectService: Error deleting unit ${unitId} from project ${projectId}:`, error);
      throw error;
    }
  }

  async getProjectUnitsPaginated(projectId: string, page: number = 1, limit: number = 20, filters?: { status?: string; unitType?: string }) {
    try {
      console.log(`ProjectService: Fetching paginated units for project ${projectId}, page ${page}`);
      
      const params = {
        page,
        limit,
        ...filters
      };
        
      const response = await api.projects.units.getUnits(parseInt(projectId), params);
      console.log('ProjectService: Paginated units response:', response);
      
      return response.data;
    } catch (error) {
      console.error(`ProjectService: Error fetching paginated units for project ${projectId}:`, error);
      return { units: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
    }
  }

  async bulkCreateUnits(projectId: number, units: any[]) {
    try {
      console.log(`ProjectService: Bulk creating ${units.length} units for project ${projectId}`);
      const response = await api.projects.units.bulkCreateUnits(projectId, units);
      console.log('ProjectService: Bulk create response:', response);
      
      return response;
    } catch (error) {
      console.error(`ProjectService: Error bulk creating units for project ${projectId}:`, error);
      throw error;
    }
  }

  async uploadProjectImages(projectId: number, formData: FormData) {
    try {
      console.log(`ProjectService: Uploading images for project ${projectId}`);
      
      const response = await fetch(`/api/v1/projects/${projectId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload images');
      }
      
      console.log('ProjectService: Upload images response:', data);
      return data;
    } catch (error) {
      console.error(`ProjectService: Error uploading images for project ${projectId}:`, error);
      throw error;
    }
  }

  async deleteProjectImage(projectId: number, imageId: number) {
    try {
      console.log(`ProjectService: Deleting image ${imageId} from project ${projectId}`);
      
      const response = await fetch(`/api/v1/projects/${projectId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete image');
      }
      
      console.log('ProjectService: Delete image response:', data);
      return data;
    } catch (error) {
      console.error(`ProjectService: Error deleting image ${imageId} from project ${projectId}:`, error);
      throw error;
    }
  }
}

export default new ProjectService();