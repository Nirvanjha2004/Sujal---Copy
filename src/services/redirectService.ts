import { Op } from 'sequelize';
import UrlRedirect from '../models/UrlRedirect';
import { User } from '../models/User';

export interface UrlRedirectData {
  id: number;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  description?: string;
  hitCount: number;
  lastUsed?: Date;
  createdAt: Date;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

export interface RedirectFilters {
  isActive?: boolean;
  statusCode?: number;
  search?: string;
}

export interface CreateRedirectData {
  fromPath: string;
  toPath: string;
  statusCode?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRedirectData {
  toPath?: string;
  statusCode?: number;
  description?: string;
  isActive?: boolean;
}

class RedirectService {
  /**
   * Get all redirects with filtering
   */
  async getAllRedirects(
    page: number = 1,
    limit: number = 20,
    filters?: RedirectFilters
  ): Promise<{ redirects: UrlRedirectData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (filters) {
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.statusCode) {
        whereClause.statusCode = filters.statusCode;
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { fromPath: { [Op.like]: `%${filters.search}%` } },
          { toPath: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    const { count, rows: redirects } = await UrlRedirect.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      limit,
      offset,
      order: [
        ['hitCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return {
      redirects: redirects.map(redirect => ({
        id: redirect.id,
        fromPath: redirect.fromPath,
        toPath: redirect.toPath,
        statusCode: redirect.statusCode,
        isActive: redirect.isActive,
        description: redirect.description,
        hitCount: redirect.hitCount,
        lastUsed: redirect.lastUsed,
        createdAt: redirect.createdAt,
        creator: redirect.creator ? {
          id: redirect.creator.id,
          firstName: redirect.creator.first_name || '',
          lastName: redirect.creator.last_name || '',
        } : null,
      })),
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Create a new redirect
   */
  async createRedirect(data: CreateRedirectData, createdBy: number): Promise<UrlRedirectData> {
    // Validate paths
    if (!data.fromPath.startsWith('/')) {
      throw new Error('From path must start with "/"');
    }
    if (!data.toPath.startsWith('/') && !data.toPath.startsWith('http')) {
      throw new Error('To path must be a relative path (starting with "/") or absolute URL');
    }

    // Check if from path already exists
    const existing = await UrlRedirect.findOne({
      where: { fromPath: data.fromPath },
    });
    if (existing) {
      throw new Error('A redirect for this path already exists');
    }

    const redirectData = {
      fromPath: data.fromPath,
      toPath: data.toPath,
      statusCode: data.statusCode || 301,
      isActive: data.isActive !== undefined ? data.isActive : true,
      description: data.description,
      createdBy,
    };
    
    const redirect = await UrlRedirect.create(redirectData as any);

    const redirectWithCreator = await UrlRedirect.findByPk(redirect.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    return {
      id: redirectWithCreator!.id,
      fromPath: redirectWithCreator!.fromPath,
      toPath: redirectWithCreator!.toPath,
      statusCode: redirectWithCreator!.statusCode,
      isActive: redirectWithCreator!.isActive,
      description: redirectWithCreator!.description,
      hitCount: redirectWithCreator!.hitCount,
      lastUsed: redirectWithCreator!.lastUsed,
      createdAt: redirectWithCreator!.createdAt,
      creator: redirectWithCreator?.creator ? {
        id: redirectWithCreator.creator.id,
        firstName: redirectWithCreator.creator.first_name || '',
        lastName: redirectWithCreator.creator.last_name || '',
      } : null,
    };
  }

  /**
   * Update a redirect
   */
  async updateRedirect(id: number, data: UpdateRedirectData): Promise<void> {
    if (data.toPath && !data.toPath.startsWith('/') && !data.toPath.startsWith('http')) {
      throw new Error('To path must be a relative path (starting with "/") or absolute URL');
    }

    await UrlRedirect.update(data, {
      where: { id },
    });
  }

  /**
   * Delete a redirect
   */
  async deleteRedirect(id: number): Promise<void> {
    await UrlRedirect.destroy({
      where: { id },
    });
  }

  /**
   * Toggle redirect status
   */
  async toggleRedirectStatus(id: number): Promise<void> {
    const redirect = await UrlRedirect.findByPk(id);
    if (!redirect) {
      throw new Error('Redirect not found');
    }

    await redirect.update({
      isActive: !redirect.isActive,
    });
  }

  /**
   * Find redirect for path
   */
  async findRedirect(fromPath: string): Promise<{ toPath: string; statusCode: number } | null> {
    const redirect = await UrlRedirect.findOne({
      where: {
        fromPath,
        isActive: true,
      },
    });

    if (!redirect) {
      return null;
    }

    // Update hit count and last used
    await redirect.update({
      hitCount: redirect.hitCount + 1,
      lastUsed: new Date(),
    });

    return {
      toPath: redirect.toPath,
      statusCode: redirect.statusCode,
    };
  }

  /**
   * Get redirect statistics
   */
  async getRedirectStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalHits: number;
    statusCodeBreakdown: Record<number, number>;
  }> {
    const [
      total,
      active,
      inactive,
      totalHitsResult,
      statusCodes,
    ] = await Promise.all([
      UrlRedirect.count(),
      UrlRedirect.count({ where: { isActive: true } }),
      UrlRedirect.count({ where: { isActive: false } }),
      UrlRedirect.findOne({
        attributes: [
          [UrlRedirect.sequelize!.fn('SUM', UrlRedirect.sequelize!.col('hit_count')), 'totalHits'],
        ],
        raw: true,
      }) as any,
      UrlRedirect.findAll({
        attributes: [
          'statusCode',
          [UrlRedirect.sequelize!.fn('COUNT', UrlRedirect.sequelize!.col('id')), 'count'],
        ],
        group: ['statusCode'],
        raw: true,
      }) as unknown as any[],
    ]);

    const statusCodeBreakdown = statusCodes.reduce((acc, item) => {
      acc[item.statusCode] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      totalHits: parseInt(totalHitsResult?.totalHits || '0'),
      statusCodeBreakdown,
    };
  }

  /**
   * Get most hit redirects
   */
  async getTopRedirects(limit: number = 10): Promise<UrlRedirectData[]> {
    const redirects = await UrlRedirect.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['hitCount', 'DESC']],
      limit,
    });

    return redirects.map(redirect => ({
      id: redirect.id,
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
      statusCode: redirect.statusCode,
      isActive: redirect.isActive,
      description: redirect.description,
      hitCount: redirect.hitCount,
      lastUsed: redirect.lastUsed,
      createdAt: redirect.createdAt,
      creator: redirect.creator ? {
        id: redirect.creator.id,
        firstName: redirect.creator.first_name || '',
        lastName: redirect.creator.last_name || '',
      } : null,
    }));
  }

  /**
   * Bulk update redirect status
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<number> {
    const [affectedCount] = await UrlRedirect.update(
      { isActive },
      { where: { id: ids } }
    );

    return affectedCount;
  }
}

export default RedirectService;