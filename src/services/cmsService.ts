import { Op } from 'sequelize';
import CmsContent from '../models/CmsContent';

interface CmsContentData {
  id: number;
  type: 'banner' | 'announcement' | 'page' | 'widget';
  key: string;
  title: string;
  content: string;
  metadata?: object;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCmsContentData {
  type: 'banner' | 'announcement' | 'page' | 'widget';
  key: string;
  title: string;
  content: string;
  metadata?: object;
  isActive?: boolean;
  displayOrder?: number;
}

interface UpdateCmsContentData {
  title?: string;
  content?: string;
  metadata?: object;
  isActive?: boolean;
  displayOrder?: number;
}

class CmsService {
  /**
   * Get all CMS content with optional filtering - FIXED
   */
  async getAllContent(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: 'banner' | 'announcement' | 'page' | 'widget';
      isActive?: boolean;
      search?: string;
    }
  ): Promise<{ content: CmsContentData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (filters) {
      if (filters.type) {
        whereClause.type = filters.type;
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { content: { [Op.like]: `%${filters.search}%` } },
          { key: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    console.log('CMS Service - Getting content with filters:', whereClause);

    try {
      const { count, rows } = await CmsContent.findAndCountAll({
        where: whereClause,
        offset,
        limit,
        order: [['displayOrder', 'DESC'], ['createdAt', 'DESC']],
      });

      const content = rows.map(item => item.toJSON()) as CmsContentData[];
      console.log('CMS Service - Found content:', content.length);

      return {
        content,
        total: count,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error('CMS Service - Error getting content:', error);
      throw error;
    }
  }

  /**
   * Get active content for public display - FIXED
   */
  async getActiveContent(
    type?: 'banner' | 'announcement' | 'page' | 'widget'
  ): Promise<CmsContentData[]> {
    const whereClause: any = {
      isActive: true,
    };

    if (type) {
      whereClause.type = type;
    }

    try {
      const content = await CmsContent.findAll({
        where: whereClause,
        order: [['displayOrder', 'DESC'], ['createdAt', 'DESC']],
      });

      return content.map(item => item.toJSON()) as CmsContentData[];
    } catch (error) {
      console.error('CMS Service - Error getting active content:', error);
      throw error;
    }
  }

  /**
   * Get content by ID - FIXED
   */
  async getContentById(id: number): Promise<CmsContentData | null> {
    try {
      const content = await CmsContent.findByPk(id);

      if (!content) {
        return null;
      }

      return content.toJSON() as CmsContentData;
    } catch (error) {
      console.error('CMS Service - Error getting content by ID:', error);
      throw error;
    }
  }

  /**
   * Get content by key - FIXED
   */
  async getContentByKey(key: string): Promise<CmsContentData | null> {
    try {
      const content = await CmsContent.findOne({
        where: { key },
      });

      if (!content) {
        return null;
      }

      return content.toJSON() as CmsContentData;
    } catch (error) {
      console.error('CMS Service - Error getting content by key:', error);
      throw error;
    }
  }

  /**
   * Create new CMS content - FIXED
   */
  async createContent(data: CreateCmsContentData): Promise<CmsContentData> {
    try {
      // Check if key already exists
      const existingContent = await CmsContent.findOne({ where: { key: data.key } });
      if (existingContent) {
        throw new Error('Content with this key already exists');
      }

      console.log('CMS Service - Creating content:', data);

      const content = await CmsContent.create({
        type: data.type,
        key: data.key,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder || 0,
      });

      console.log('CMS Service - Created content:', content.id);

      return content.toJSON() as CmsContentData;
    } catch (error) {
      console.error('CMS Service - Error creating content:', error);
      throw error;
    }
  }

  /**
   * Update CMS content - FIXED
   */
  async updateContent(id: number, data: UpdateCmsContentData): Promise<CmsContentData> {
    try {
      const content = await CmsContent.findByPk(id);
      if (!content) {
        throw new Error('Content not found');
      }

      console.log('CMS Service - Updating content:', { id, data });

      await content.update(data);
      return content.toJSON() as CmsContentData;
    } catch (error) {
      console.error('CMS Service - Error updating content:', error);
      throw error;
    }
  }

  /**
   * Delete CMS content - FIXED
   */
  async deleteContent(id: number): Promise<void> {
    try {
      const content = await CmsContent.findByPk(id);
      if (!content) {
        throw new Error('Content not found');
      }

      console.log('CMS Service - Deleting content:', id);

      await content.destroy();
    } catch (error) {
      console.error('CMS Service - Error deleting content:', error);
      throw error;
    }
  }

  /**
   * Toggle content active status - FIXED
   */
  async toggleContentStatus(id: number): Promise<CmsContentData> {
    try {
      const content = await CmsContent.findByPk(id);
      if (!content) {
        throw new Error('Content not found');
      }

      await content.update({ isActive: !content.isActive });
      return content.toJSON() as CmsContentData;
    } catch (error) {
      console.error('CMS Service - Error toggling content status:', error);
      throw error;
    }
  }

  /**
   * Get banners for display - FIXED
   */
  async getActiveBanners(): Promise<CmsContentData[]> {
    return this.getActiveContent('banner');
  }

  /**
   * Get announcements for display - FIXED
   */
  async getActiveAnnouncements(): Promise<CmsContentData[]> {
    return this.getActiveContent('announcement');
  }

  /**
   * Get content statistics - FIXED
   */
  async getContentStats(): Promise<{
    totalContent: number;
    activeContent: number;
    contentByType: Record<string, number>;
  }> {
    try {
      const [
        totalContent,
        activeContent,
        contentByType,
      ] = await Promise.all([
        CmsContent.count(),
        CmsContent.count({ where: { isActive: true } }),
        CmsContent.findAll({
          attributes: ['type'],
          group: ['type'],
          raw: true,
        }),
      ]);

      const typeStats: Record<string, number> = {};
      for (const item of contentByType as any[]) {
        const count = await CmsContent.count({ where: { type: item.type } });
        typeStats[item.type] = count;
      }

      return {
        totalContent,
        activeContent,
        contentByType: typeStats,
      };
    } catch (error) {
      console.error('CMS Service - Error getting content stats:', error);
      throw error;
    }
  }
}

export default CmsService;