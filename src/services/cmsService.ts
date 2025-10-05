import { Op } from 'sequelize';
import CmsContent from '../models/CmsContent';
import { User } from '../models/User';

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
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
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
   * Get all CMS content with optional filtering
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

    const { count, rows } = await CmsContent.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [['displayOrder', 'DESC'], ['createdAt', 'DESC']],
    });

    const content = rows.map(item => item.toJSON()) as CmsContentData[];

    return {
      content,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get active content for public display
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

    const content = await CmsContent.findAll({
      where: whereClause,
      order: [['displayOrder', 'DESC'], ['createdAt', 'DESC']],
    });

    return content.map(item => item.toJSON()) as CmsContentData[];
  }

  /**
   * Get content by ID
   */
  async getContentById(id: number): Promise<CmsContentData | null> {
    const content = await CmsContent.findByPk(id);

    if (!content) {
      return null;
    }

    return content.toJSON() as CmsContentData;
  }

  /**
   * Get content by key
   */
  async getContentByKey(key: string): Promise<CmsContentData | null> {
    const content = await CmsContent.findOne({
      where: { key },
    });

    if (!content) {
      return null;
    }

    return content.toJSON() as CmsContentData;
  }

  /**
   * Create new CMS content
   */
  async createContent(data: CreateCmsContentData): Promise<CmsContentData> {
    // Check if key already exists
    const existingContent = await CmsContent.findOne({ where: { key: data.key } });
    if (existingContent) {
      throw new Error('Content with this key already exists');
    }

    const content = await CmsContent.create({
      type: data.type,
      key: data.key,
      title: data.title,
      content: data.content,
      metadata: data.metadata,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder || 0,
    });

    return this.getContentById(content.id) as Promise<CmsContentData>;
  }

  /**
   * Update CMS content
   */
  async updateContent(id: number, data: UpdateCmsContentData): Promise<CmsContentData> {
    const content = await CmsContent.findByPk(id);
    if (!content) {
      throw new Error('Content not found');
    }

    await content.update(data);
    return this.getContentById(id) as Promise<CmsContentData>;
  }

  /**
   * Delete CMS content
   */
  async deleteContent(id: number): Promise<void> {
    const content = await CmsContent.findByPk(id);
    if (!content) {
      throw new Error('Content not found');
    }

    await content.destroy();
  }

  /**
   * Toggle content active status
   */
  async toggleContentStatus(id: number): Promise<CmsContentData> {
    const content = await CmsContent.findByPk(id);
    if (!content) {
      throw new Error('Content not found');
    }

    await content.update({ isActive: !content.isActive });
    return this.getContentById(id) as Promise<CmsContentData>;
  }

  /**
   * Get banners for display
   */
  async getActiveBanners(): Promise<CmsContentData[]> {
    return this.getActiveContent('banner');
  }

  /**
   * Get announcements for display
   */
  async getActiveAnnouncements(): Promise<CmsContentData[]> {
    return this.getActiveContent('announcement');
  }

  /**
   * Get page content
   */
  async getPageContent(key: string): Promise<CmsContentData | null> {
    const content = await CmsContent.findOne({
      where: {
        key,
        type: 'page',
        isActive: true,
      },
    });

    return content ? (content.toJSON() as CmsContentData) : null;
  }

  /**
   * Get widget content
   */
  async getWidgetContent(key: string): Promise<CmsContentData | null> {
    const content = await CmsContent.findOne({
      where: {
        key,
        type: 'widget',
        isActive: true,
      },
    });

    return content ? (content.toJSON() as CmsContentData) : null;
  }

  /**
   * Bulk update content status
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<number> {
    const [affectedCount] = await CmsContent.update(
      { isActive },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      }
    );

    return affectedCount;
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<{
    totalContent: number;
    activeContent: number;
    contentByType: Record<string, number>;
  }> {
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
  }
}

export default CmsService;