// This service should contain project-specific functionality for builders
// For now, keeping it simple and using the existing api pattern
import { api } from '@/shared/lib/api';

class ProjectService {
  // Project service methods would go here
  // This is a placeholder to fix the incorrect PropertyService that was here
  
  async getProjects() {
    // Implementation would use api.getProjects() or similar
    return { data: [], total: 0 };
  }
}

export default new ProjectService();