import { Request, Response } from 'express';
import siteVisitService from '../services/siteVisitService';
import { Property } from '../models/Property';
import { Inquiry } from '../models/Inquiry';
import sequelize from '../config/database'; // Import the sequelize instance
import { format } from 'date-fns';

export const siteVisitController = {
  /**
   * Create a new site visit request and a corresponding inquiry
   */
  createSiteVisit: async (req: Request, res: Response) => {
    const t = await sequelize.transaction(); // Start a transaction

    try {
      const { property_id, scheduled_at, visitor_name, visitor_email, visitor_phone, notes } = req.body;
      
      // Validate required fields
      if (!property_id || !scheduled_at || !visitor_name || !visitor_email) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields: property_id, scheduled_at, visitor_name, visitor_email'
          }
        });
      }
      
      // Check if property exists
      const property = await Property.findByPk(property_id, { transaction: t });
      if (!property) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          error: {
            message: 'Property not found'
          }
        });
      }
      
      // Create site visit with authenticated user if available
      //@ts-ignore
      const visitor_id = req.user?.id;
      
      const siteVisit = await siteVisitService.createSiteVisit({
        property_id,
        visitor_id,
        visitor_name,
        visitor_email,
        visitor_phone,
        scheduled_at,
        notes
      }, { transaction: t });

      // Now, create a corresponding inquiry record
      const formattedVisitDate = format(new Date(scheduled_at), 'MMM d, yyyy @ h:mm a');
      const inquiryMessage = `Site visit scheduled for ${formattedVisitDate}. Notes: ${notes || 'N/A'}`;

      await Inquiry.create({
        property_id,
        inquirer_id: visitor_id,
        name: visitor_name,
        email: visitor_email,
        phone: visitor_phone,
        message: inquiryMessage,
        // status will default to 'new'
      }, { transaction: t });
      
      // If both are successful, commit the transaction
      await t.commit();

      return res.status(201).json({
        success: true,
        data: siteVisit,
        message: 'Site visit scheduled successfully and lead created.'
      });
    } catch (error) {
      // If any error occurs, roll back the transaction
      await t.rollback();
      console.error('Error creating site visit and inquiry:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to schedule site visit'
        }
      });
    }
  },

  /**
   * Get site visits for a specific property
   */
  getPropertySiteVisits: async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      const { status, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const visits = await siteVisitService.getPropertySiteVisits(parseInt(propertyId), filters);
      
      return res.status(200).json({
        success: true,
        data: {
          visits
        }
      });
    } catch (error) {
      console.error('Error getting property site visits:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve site visits'
        }
      });
    }
  },

  /**
   * Get site visits for properties owned by the authenticated agent
   */
  getAgentSiteVisits: async (req: Request, res: Response) => {
    try {
        //@ts-ignore
      const agentId = req.user.userId; // This is correct
      const { status, startDate, endDate, propertyId } = req.query;

      console.log('Agent ID:', agentId);
      console.log('Query Params:', req.query);
      
      const filters: any = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      
      const visits = await siteVisitService.getAgentSiteVisits(agentId, filters);
      
      return res.status(200).json({
        success: true,
        data: {
          visits
        }
      });
    } catch (error) {
      console.error('Error getting agent site visits:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve site visits'
        }
      });
    }
  },

  /**
   * Update a site visit
   */
  updateSiteVisit: async (req: Request, res: Response) => {
    try {
      const { visitId } = req.params;
      const { status, scheduled_at, agent_notes } = req.body;
      
      const visit = await siteVisitService.updateSiteVisit(parseInt(visitId), {
        status,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
        agent_notes
      });
      
      return res.status(200).json({
        success: true,
        data: visit,
        message: 'Site visit updated successfully'
      });
    } catch (error) {
      console.error('Error updating site visit:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update site visit'
        }
      });
    }
  },

  /**
   * Get statistics for site visits
   */
  getSiteVisitStats: async (req: Request, res: Response) => {
    try {
        //@ts-ignore
      const agentId = req.user!.userId; // FIX: Changed from req.user.id to req.user.userId
      
      const stats = await siteVisitService.getSiteVisitStats(agentId);
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting site visit stats:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve site visit statistics'
        }
      });
    }
  }
};

export default siteVisitController;