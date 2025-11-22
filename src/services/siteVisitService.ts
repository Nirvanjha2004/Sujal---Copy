import SiteVisit from '../models/SiteVisit';
import {Property} from '../models/Property';
import {User} from '../models/User';
import { Op, Transaction } from 'sequelize';

export const siteVisitService = {
  /**
   * Create a new site visit request
   */
  createSiteVisit: async (visitData: {
    property_id: number;
    visitor_id?: number;
    visitor_name: string;
    visitor_email: string;
    visitor_phone?: string;
    scheduled_at: string;
    notes?: string;
  }, options?: { transaction: Transaction }) => {
    return SiteVisit.create(visitData, options);
  },

  /**
   * Get site visits for a specific property
   */
  getPropertySiteVisits: async (propertyId: number, filters?: { status?: string; startDate?: Date; endDate?: Date }) => {
    const where: any = { property_id: propertyId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.startDate && filters?.endDate) {
      where.scheduled_at = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    } else if (filters?.startDate) {
      where.scheduled_at = {
        [Op.gte]: filters.startDate
      };
    } else if (filters?.endDate) {
      where.scheduled_at = {
        [Op.lte]: filters.endDate
      };
    }
    
    return SiteVisit.findAll({
      where,
      include: [
        {
          model: User,
          as: 'visitor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
        }
      ],
      order: [['scheduled_at', 'ASC']]
    });
  },

  /**
   * Get site visits for properties owned by an agent
   */
  getAgentSiteVisits: async (agentId: number, filters?: { status?: string; startDate?: Date; endDate?: Date; propertyId?: number }) => {
    // First, get all properties owned by the agent
    const properties = await Property.findAll({
      where: { user_id: agentId },
      attributes: ['id']
    });
    
    const propertyIds = properties.map(p => p.id);
    
    if (propertyIds.length === 0) {
      return [];
    }
    
    const where: any = {
      property_id: {
        [Op.in]: propertyIds
      }
    };
    
    if (filters?.propertyId) {
      where.property_id = filters.propertyId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.startDate && filters?.endDate) {
      where.scheduled_at = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    } else if (filters?.startDate) {
      where.scheduled_at = {
        [Op.gte]: filters.startDate
      };
    } else if (filters?.endDate) {
      where.scheduled_at = {
        [Op.lte]: filters.endDate
      };
    }

    console.log('Site visit query filters:', where);
    
    return SiteVisit.findAll({
      where,
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'state']
        },
        {
          model: User,
          as: 'visitor',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ],
      order: [['scheduled_at', 'ASC']]
    });
  },

  /**
   * Update a site visit
   */
  updateSiteVisit: async (visitId: number, updates: {
    status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    scheduled_at?: Date;
    agent_notes?: string;
  }) => {
    const visit = await SiteVisit.findByPk(visitId);
    if (!visit) {
      throw new Error('Site visit not found');
    }
    
    return visit.update(updates);
  },

  /**
   * Get statistics for site visits
   */
  getSiteVisitStats: async (agentId: number) => {
    // First, get all properties owned by the agent
    const properties = await Property.findAll({
      where: { user_id: agentId },
      attributes: ['id']
    });
    
    const propertyIds = properties.map(p => p.id);
    
    if (propertyIds.length === 0) {
      return {
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
        upcoming: 0
      };
    }
    
    // Total count
    const totalCount = await SiteVisit.count({
      where: {
        property_id: {
          [Op.in]: propertyIds
        }
      }
    });
    
    // Count by status
    const scheduledCount = await SiteVisit.count({
      where: {
        property_id: {
          [Op.in]: propertyIds
        },
        status: 'scheduled'
      }
    });
    
    const completedCount = await SiteVisit.count({
      where: {
        property_id: {
          [Op.in]: propertyIds
        },
        status: 'completed'
      }
    });
    
    const cancelledCount = await SiteVisit.count({
      where: {
        property_id: {
          [Op.in]: propertyIds
        },
        status: 'cancelled'
      }
    });
    
    const noShowCount = await SiteVisit.count({
      where: {
        property_id: {
          [Op.in]: propertyIds
        },
        status: 'no_show'
      }
    });
    
    // Upcoming visits (scheduled in the future)
    const upcomingCount = await SiteVisit.count({
      where: {
        property_id: {
          [Op.in]: propertyIds
        },
        status: 'scheduled',
        scheduled_at: {
          [Op.gt]: new Date()
        }
      }
    });
    
    return {
      total: totalCount,
      scheduled: scheduledCount,
      completed: completedCount,
      cancelled: cancelledCount,
      no_show: noShowCount,
      upcoming: upcomingCount
    };
  }
};

export default siteVisitService;