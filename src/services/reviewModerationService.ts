import { Op } from 'sequelize';
import Review from '../models/Review';
import { Property } from '../models/Property';
import { User } from '../models/User';

export interface ReviewModerationData {
  id: number;
  rating: number;
  title: string;
  content: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  helpfulCount: number;
  reportCount: number;
  createdAt: Date;
  property: {
    id: number;
    title: string;
    city: string;
  } | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  moderator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface ReviewFilters {
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  propertyId?: number;
  reportThreshold?: number;
  search?: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  averageRating: number;
}

class ReviewModerationService {
  /**
   * Get reviews for moderation
   */
  async getReviewsForModeration(
    page: number = 1,
    limit: number = 20,
    filters?: ReviewFilters
  ): Promise<{ reviews: ReviewModerationData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (filters) {
      if (filters.moderationStatus) {
        whereClause.moderationStatus = filters.moderationStatus;
      }
      if (filters.rating) {
        whereClause.rating = filters.rating;
      }
      if (filters.propertyId) {
        whereClause.propertyId = filters.propertyId;
      }
      if (filters.reportThreshold) {
        whereClause.reportCount = {
          [Op.gte]: filters.reportThreshold,
        };
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { content: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'city'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: User,
          as: 'moderator',
          attributes: ['id', 'first_name', 'last_name'],
          required: false,
        },
      ],
      limit,
      offset,
      order: [
        ['reportCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return {
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        moderationStatus: review.moderationStatus,
        moderationNotes: review.moderationNotes,
        helpfulCount: review.helpfulCount,
        reportCount: review.reportCount,
        createdAt: review.createdAt,
        property: review.property ? {
          id: review.property.id,
          title: review.property.title,
          city: review.property.city || '',
        } : null,
        user: review.reviewer ? {
          id: review.reviewer.id,
          firstName: review.reviewer.first_name || '',
          lastName: review.reviewer.last_name || '',
          email: review.reviewer.email || '',
        } : null,
        moderator: review.moderator ? {
          id: review.moderator.id,
          firstName: review.moderator.first_name || '',
          lastName: review.moderator.last_name || '',
        } : undefined,
      })),
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Moderate a review
   */
  async moderateReview(
    reviewId: number,
    moderatorId: number,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<void> {
    await Review.update(
      {
        moderationStatus: action === 'approve' ? 'approved' : 'rejected',
        isApproved: action === 'approve',
        moderationNotes: notes,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
      },
      {
        where: { id: reviewId },
      }
    );
  }

  /**
   * Bulk moderate reviews
   */
  async bulkModerateReviews(
    reviewIds: number[],
    moderatorId: number,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<number> {
    const [affectedCount] = await Review.update(
      {
        moderationStatus: action === 'approve' ? 'approved' : 'rejected',
        isApproved: action === 'approve',
        moderationNotes: notes,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
      },
      {
        where: { id: reviewIds },
      }
    );

    return affectedCount;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number): Promise<void> {
    await Review.destroy({
      where: { id: reviewId },
    });
  }

  /**
   * Get review statistics
   */
  async getReviewStats(): Promise<ReviewStats> {
    const [
      total,
      pending,
      approved,
      rejected,
      flagged,
      ratingStats,
    ] = await Promise.all([
      Review.count(),
      Review.count({ where: { moderationStatus: 'pending' } }),
      Review.count({ where: { moderationStatus: 'approved' } }),
      Review.count({ where: { moderationStatus: 'rejected' } }),
      Review.count({ where: { reportCount: { [Op.gte]: 3 } } }),
      Review.findOne({
        attributes: [
          [Review.sequelize!.fn('AVG', Review.sequelize!.col('rating')), 'averageRating'],
        ],
        raw: true,
      }) as any,
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      flagged,
      averageRating: parseFloat(ratingStats?.averageRating || '0'),
    };
  }

  /**
   * Get flagged reviews (high report count)
   */
  async getFlaggedReviews(threshold: number = 3): Promise<ReviewModerationData[]> {
    const reviews = await Review.findAll({
      where: {
        reportCount: { [Op.gte]: threshold },
        moderationStatus: 'pending',
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'city'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
      order: [['reportCount', 'DESC']],
    });

    return reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      moderationStatus: review.moderationStatus,
      moderationNotes: review.moderationNotes,
      helpfulCount: review.helpfulCount,
      reportCount: review.reportCount,
      createdAt: review.createdAt,
      property: review.property ? {
        id: review.property.id,
        title: review.property.title,
        city: review.property.city || '',
      } : null,
      user: review.reviewer ? {
        id: review.reviewer.id,
        firstName: review.reviewer.first_name || '',
        lastName: review.reviewer.last_name || '',
        email: review.reviewer.email || '',
      } : null,
    }));
  }

  /**
   * Report a review
   */
  async reportReview(reviewId: number): Promise<void> {
    await Review.increment('reportCount', {
      where: { id: reviewId },
    });
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: number): Promise<void> {
    await Review.increment('helpfulCount', {
      where: { id: reviewId },
    });
  }
}

export default ReviewModerationService;