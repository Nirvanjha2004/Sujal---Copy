import nodemailer from 'nodemailer';
import config from '../config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface InquiryEmailData {
  propertyTitle: string;
  propertyId: number;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  message: string;
  propertyOwnerName: string;
  propertyUrl: string;
}

export interface RegistrationEmailData {
  userName: string;
  verificationUrl?: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
}

export interface SavedSearchMatchEmailData {
  userName: string;
  searchName: string;
  property: {
    title: string;
    price: number;
    city: string;
    state: string;
    propertyType: string;
    listingType: string;
    url: string;
  };
  ownerName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Real Estate Portal" <${config.email.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendInquiryNotification(data: InquiryEmailData): Promise<void> {
    const subject = `New Inquiry for ${data.propertyTitle}`;
    const html = this.generateInquiryEmailTemplate(data);
    const text = this.generateInquiryEmailText(data);

    await this.sendEmail({
      to: data.inquirerEmail, // Send confirmation to inquirer
      subject: `Inquiry Confirmation - ${data.propertyTitle}`,
      html: this.generateInquiryConfirmationTemplate(data),
      text: this.generateInquiryConfirmationText(data),
    });
  }

  async sendInquiryToOwner(ownerEmail: string, data: InquiryEmailData): Promise<void> {
    const subject = `New Inquiry for ${data.propertyTitle}`;
    const html = this.generateInquiryEmailTemplate(data);
    const text = this.generateInquiryEmailText(data);

    await this.sendEmail({
      to: ownerEmail,
      subject,
      html,
      text,
    });
  }

  async sendRegistrationConfirmation(email: string, data: RegistrationEmailData): Promise<void> {
    const subject = 'Welcome to Real Estate Portal';
    const html = this.generateRegistrationEmailTemplate(data);
    const text = this.generateRegistrationEmailText(data);

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, data: PasswordResetEmailData): Promise<void> {
    const subject = 'Password Reset Request - Real Estate Portal';
    const html = this.generatePasswordResetEmailTemplate(data);
    const text = this.generatePasswordResetEmailText(data);

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  async sendSavedSearchMatch(email: string, data: SavedSearchMatchEmailData): Promise<void> {
    const subject = `New Property Match: ${data.searchName}`;
    const html = this.generateSavedSearchMatchTemplate(data);
    const text = this.generateSavedSearchMatchText(data);

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  private generateInquiryEmailTemplate(data: InquiryEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Property Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .property-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .inquirer-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .message-box { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Property Inquiry</h1>
          </div>
          <div class="content">
            <p>Hello ${data.propertyOwnerName},</p>
            <p>You have received a new inquiry for your property listing.</p>
            
            <div class="property-info">
              <h3>Property Details</h3>
              <p><strong>Property:</strong> ${data.propertyTitle}</p>
              <p><strong>Property ID:</strong> #${data.propertyId}</p>
              <p><a href="${data.propertyUrl}" class="btn">View Property</a></p>
            </div>

            <div class="inquirer-info">
              <h3>Inquirer Information</h3>
              <p><strong>Name:</strong> ${data.inquirerName}</p>
              <p><strong>Email:</strong> ${data.inquirerEmail}</p>
              ${data.inquirerPhone ? `<p><strong>Phone:</strong> ${data.inquirerPhone}</p>` : ''}
            </div>

            <div class="message-box">
              <h3>Message</h3>
              <p>${data.message.replace(/\n/g, '<br>')}</p>
            </div>

            <p>Please respond to this inquiry promptly to maintain good customer service.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Real Estate Portal. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateInquiryConfirmationTemplate(data: InquiryEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inquiry Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .property-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Inquiry Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${data.inquirerName},</p>
            <p>Thank you for your inquiry! We have successfully received your message regarding the following property:</p>
            
            <div class="property-info">
              <h3>Property Details</h3>
              <p><strong>Property:</strong> ${data.propertyTitle}</p>
              <p><strong>Property ID:</strong> #${data.propertyId}</p>
              <p><a href="${data.propertyUrl}" class="btn">View Property</a></p>
            </div>

            <p>Your inquiry has been forwarded to the property owner/agent. They will contact you soon.</p>
            <p>If you have any questions, please feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for using Real Estate Portal!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateRegistrationEmailTemplate(data: RegistrationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Real Estate Portal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .welcome-box { background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Real Estate Portal!</h1>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Hello ${data.userName}!</h2>
              <p>Welcome to Real Estate Portal. Your account has been successfully created.</p>
              ${data.verificationUrl ? `<p><a href="${data.verificationUrl}" class="btn">Verify Your Account</a></p>` : ''}
              <p>You can now start exploring properties, save your favorites, and connect with property owners and agents.</p>
            </div>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for joining Real Estate Portal!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailTemplate(data: PasswordResetEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .reset-box { background-color: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { background-color: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <div class="reset-box">
              <h2>Hello ${data.userName}!</h2>
              <p>We received a request to reset your password for your Real Estate Portal account.</p>
              <p><a href="${data.resetUrl}" class="btn">Reset Your Password</a></p>
              <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
              </div>
            </div>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, please do not share this link with anyone.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Real Estate Portal. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateInquiryEmailText(data: InquiryEmailData): string {
    return `
New Property Inquiry

Hello ${data.propertyOwnerName},

You have received a new inquiry for your property listing.

Property Details:
- Property: ${data.propertyTitle}
- Property ID: #${data.propertyId}
- View Property: ${data.propertyUrl}

Inquirer Information:
- Name: ${data.inquirerName}
- Email: ${data.inquirerEmail}
${data.inquirerPhone ? `- Phone: ${data.inquirerPhone}` : ''}

Message:
${data.message}

Please respond to this inquiry promptly to maintain good customer service.

This email was sent from Real Estate Portal.
    `;
  }

  private generateInquiryConfirmationText(data: InquiryEmailData): string {
    return `
Inquiry Confirmation

Hello ${data.inquirerName},

Thank you for your inquiry! We have successfully received your message regarding the following property:

Property Details:
- Property: ${data.propertyTitle}
- Property ID: #${data.propertyId}
- View Property: ${data.propertyUrl}

Your inquiry has been forwarded to the property owner/agent. They will contact you soon.

If you have any questions, please feel free to contact our support team.

Thank you for using Real Estate Portal!
    `;
  }

  private generateRegistrationEmailText(data: RegistrationEmailData): string {
    return `
Welcome to Real Estate Portal!

Hello ${data.userName}!

Welcome to Real Estate Portal. Your account has been successfully created.

${data.verificationUrl ? `Please verify your account by visiting: ${data.verificationUrl}` : ''}

You can now start exploring properties, save your favorites, and connect with property owners and agents.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Thank you for joining Real Estate Portal!
    `;
  }

  private generatePasswordResetEmailText(data: PasswordResetEmailData): string {
    return `
Password Reset Request

Hello ${data.userName}!

We received a request to reset your password for your Real Estate Portal account.

Reset your password by visiting: ${data.resetUrl}

Important: This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, please do not share this link with anyone.

This email was sent from Real Estate Portal.
    `;
  }

  private generateSavedSearchMatchTemplate(data: SavedSearchMatchEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Property Match</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .property-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
          .property-title { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .property-details { margin: 10px 0; }
          .price { font-size: 20px; font-weight: bold; color: #059669; }
          .btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 New Property Match!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.userName}!</p>
            <p>Great news! We found a new property that matches your saved search "<strong>${data.searchName}</strong>".</p>
            
            <div class="property-card">
              <div class="property-title">${data.property.title}</div>
              <div class="price">₹${data.property.price.toLocaleString()}</div>
              <div class="property-details">
                <p><strong>Type:</strong> ${data.property.propertyType} for ${data.property.listingType}</p>
                <p><strong>Location:</strong> ${data.property.city}, ${data.property.state}</p>
                <p><strong>Listed by:</strong> ${data.ownerName}</p>
              </div>
              <a href="${data.property.url}" class="btn">View Property Details</a>
            </div>
            
            <p>Don't miss out on this opportunity! Properties matching your criteria are in high demand.</p>
            <p>If you're no longer interested in receiving these notifications, you can manage your saved searches in your account dashboard.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Real Estate Portal because you have an active saved search.</p>
            <p>© 2024 Real Estate Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSavedSearchMatchText(data: SavedSearchMatchEmailData): string {
    return `
New Property Match: ${data.searchName}

Hello ${data.userName}!

Great news! We found a new property that matches your saved search "${data.searchName}".

Property Details:
- Title: ${data.property.title}
- Price: ₹${data.property.price.toLocaleString()}
- Type: ${data.property.propertyType} for ${data.property.listingType}
- Location: ${data.property.city}, ${data.property.state}
- Listed by: ${data.ownerName}

View Property: ${data.property.url}

Don't miss out on this opportunity! Properties matching your criteria are in high demand.

If you're no longer interested in receiving these notifications, you can manage your saved searches in your account dashboard.

This email was sent from Real Estate Portal because you have an active saved search.
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();