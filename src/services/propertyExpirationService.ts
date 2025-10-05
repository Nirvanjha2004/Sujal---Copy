import PropertyService from './propertyService';
import { Property } from '../models/Property';
import { Op } from 'sequelize';

class PropertyExpirationService {
    private propertyService: PropertyService;
    private isRunning: boolean = false;

    constructor() {
        this.propertyService = new PropertyService();
    }

    /**
     * Start the expiration monitoring service
     * This should be called when the application starts
     */
    start(): void {
        if (this.isRunning) {
            console.log('Property expiration service is already running');
            return;
        }

        this.isRunning = true;
        console.log('Starting property expiration service...');

        // Run immediately on start
        this.processExpirations();

        // Run every hour
        setInterval(() => {
            this.processExpirations();
        }, 60 * 60 * 1000); // 1 hour in milliseconds
    }

    /**
     * Stop the expiration monitoring service
     */
    stop(): void {
        this.isRunning = false;
        console.log('Property expiration service stopped');
    }

    /**
     * Process property expirations and auto-renewals
     */
    private async processExpirations(): Promise<void> {
        try {
            console.log('Processing property expirations...');

            // Process auto-renewals first
            const renewalResult = await this.propertyService.processAutoRenewals();
            console.log(`Auto-renewals processed: ${renewalResult.renewed} renewed, ${renewalResult.failed} failed`);

            // Deactivate expired properties that don't have auto-renewal
            const deactivatedCount = await this.propertyService.deactivateExpiredProperties();
            console.log(`Deactivated ${deactivatedCount} expired properties`);

            // Log summary
            console.log('Property expiration processing completed');
        } catch (error) {
            console.error('Error processing property expirations:', error);
        }
    }

    /**
     * Get properties expiring in the next N days across all users
     * Useful for admin monitoring
     */
    async getSystemExpiringProperties(daysAhead: number = 7): Promise<Property[]> {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysAhead);

            const properties = await Property.findAll({
                where: {
                    is_active: true,
                    expires_at: {
                        [Op.lte]: futureDate,
                        [Op.gte]: new Date(),
                    },
                },
                include: [
                    {
                        model: require('../models/User').User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email'],
                    },
                ],
                order: [['expires_at', 'ASC']],
            });

            return properties;
        } catch (error) {
            console.error('Error fetching system expiring properties:', error);
            throw error;
        }
    }

    /**
     * Get expiration statistics for admin dashboard
     */
    async getExpirationStatistics(): Promise<any> {
        try {
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);

            const [
                expiredCount,
                expiringThisWeekCount,
                expiringThisMonthCount,
                autoRenewEnabledCount,
                totalActiveCount,
            ] = await Promise.all([
                Property.count({
                    where: {
                        expires_at: { [Op.lt]: now },
                        is_active: true,
                    },
                }),
                Property.count({
                    where: {
                        expires_at: {
                            [Op.gte]: now,
                            [Op.lte]: nextWeek,
                        },
                        is_active: true,
                    },
                }),
                Property.count({
                    where: {
                        expires_at: {
                            [Op.gte]: now,
                            [Op.lte]: nextMonth,
                        },
                        is_active: true,
                    },
                }),
                Property.count({
                    where: {
                        auto_renew: true,
                        is_active: true,
                    },
                }),
                Property.count({
                    where: {
                        is_active: true,
                    },
                }),
            ]);

            return {
                totalActiveProperties: totalActiveCount,
                expiredProperties: expiredCount,
                expiringThisWeek: expiringThisWeekCount,
                expiringThisMonth: expiringThisMonthCount,
                autoRenewEnabled: autoRenewEnabledCount,
                autoRenewPercentage: totalActiveCount > 0 ? Math.round((autoRenewEnabledCount / totalActiveCount) * 100) : 0,
            };
        } catch (error) {
            console.error('Error fetching expiration statistics:', error);
            throw error;
        }
    }

    /**
     * Manually trigger expiration processing
     * Useful for admin actions or testing
     */
    async manualProcessExpirations(): Promise<{ renewed: number; failed: number; deactivated: number }> {
        try {
            const renewalResult = await this.propertyService.processAutoRenewals();
            const deactivatedCount = await this.propertyService.deactivateExpiredProperties();

            return {
                renewed: renewalResult.renewed,
                failed: renewalResult.failed,
                deactivated: deactivatedCount,
            };
        } catch (error) {
            console.error('Error in manual expiration processing:', error);
            throw error;
        }
    }

    /**
     * Send expiration notifications (placeholder for email service integration)
     */
    async sendExpirationNotifications(): Promise<void> {
        try {
            // Get properties expiring in 3 days
            const expiringProperties = await this.getSystemExpiringProperties(3);

            for (const property of expiringProperties) {
                // This would integrate with the email service when implemented
                console.log(`Notification needed: Property "${property.title}" (ID: ${property.id}) expires in ${property.daysUntilExpiration} days`);
                
                // TODO: Send email notification to property owner
                // await emailService.sendExpirationNotification(property.user.email, property);
            }
        } catch (error) {
            console.error('Error sending expiration notifications:', error);
        }
    }
}

export default PropertyExpirationService;