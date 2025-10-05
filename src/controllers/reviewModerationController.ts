import { Request, Response } from 'express';
import ReviewModerationService, { ReviewFilters } from '../services/reviewModerationService';

export class ReviewModerationController {
  private reviewService: ReviewModerationService;

  constructor() {
    this.reviewService = new ReviewModerationService();
  }

  /**
   * Get all reviews with filtering and pagination
   */
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters: ReviewFilters = {};
      
      if (req.query.status) {
        filters.moderationStatus = req.query.status as any;
      }
      if (req.query.rating) {
        filters.rating = parseInt(req.query.rating as string);
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      if (req.query.propertyId) {
        filters.propertyId = parseInt(req.query.propertyId as string);
      }

      const result = await this.reviewService.getReviewsForModeration(page, limit, filters);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.reviewService.getReviewStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Moderate a review (approve/reject)
   */
  async moderateReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = parseInt(req.params.id);
      const { action } = req.body;
      const moderatorId = (req as any).user.id; // From auth middleware

      if (!['approved', 'rejected'].includes(action)) {
        res.status(400).json({ error: 'Invalid action. Use "approved" or "rejected".' });
        return;
      }

      await this.reviewService.moderateReview(reviewId, action, moderatorId);
      
      res.json({ success: true, message: `Review ${action} successfully` });
    } catch (error) {
      console.error('Error moderating review:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Flag a review
   */
  async flagReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = parseInt(req.params.id);
      
      await this.reviewService.reportReview(reviewId);
      
      res.json({ success: true, message: 'Review flagged successfully' });
    } catch (error) {
      console.error('Error flagging review:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = parseInt(req.params.id);
      
      await this.reviewService.deleteReview(reviewId);
      
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk moderate reviews
   */
  async bulkModerate(req: Request, res: Response): Promise<void> {
    try {
      const { reviewIds, action } = req.body;
      const moderatorId = (req as any).user.id; // From auth middleware

      if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
        res.status(400).json({ error: 'reviewIds must be a non-empty array' });
        return;
      }

      if (!['approved', 'rejected'].includes(action)) {
        res.status(400).json({ error: 'Invalid action' });
        return;
      }

      const affectedCount = await this.reviewService.bulkModerateReviews(reviewIds, action, moderatorId);
      
      res.json({ 
        success: true, 
        message: `${affectedCount} review(s) ${action} successfully`,
        affectedCount 
      });
    } catch (error) {
      console.error('Error bulk moderating reviews:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get flagged reviews
   */
  async getFlaggedReviews(req: Request, res: Response): Promise<void> {
    try {
      const threshold = parseInt(req.query.threshold as string) || 3;

      const result = await this.reviewService.getFlaggedReviews(threshold);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching flagged reviews:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}