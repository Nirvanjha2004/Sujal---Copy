import { Sequelize } from 'sequelize-typescript';
import config from './index';
import { defineAssociations } from '../models/associations';

// Import all models
import { User } from '../models/User';
import { Property } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { Inquiry } from '../models/Inquiry';
import { UserFavorite } from '../models/UserFavorite';
import { SavedSearch } from '../models/SavedSearch';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { ConversationParticipant } from '../models/ConversationParticipant';
import Review from '../models/Review';
import UrlRedirect from '../models/UrlRedirect';
import CmsContent from '../models/CmsContent';
import SeoSettings, { SeoSettings as SeoSettingsClass } from '../models/SeoSettings';
import SiteVisitDefault, { SiteVisit } from '../models/SiteVisit';

const sequelize = new Sequelize({
  database: config.database.name,
  dialect: 'mysql',
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  logging: config.database.logging ? (sql: string) => {
    // Only log important operations, not routine queries
    const importantOperations = [
      'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 
      'CREATE INDEX', 'DROP INDEX', 'CREATE DATABASE', 'DROP DATABASE'
    ];
    
    if (importantOperations.some(op => sql.includes(op))) {
      const operation = importantOperations.find(op => sql.includes(op));
      console.log(`🔧 Database ${operation}:`, sql.substring(0, 80) + '...');
    }
    // Suppress all other SQL queries (SELECT, INSERT, UPDATE, DELETE, SHOW, etc.)
  } : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

export default sequelize;

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('🗄️  Database connection established successfully.');
    
    console.log('📋 Loading models...');
    // Add models to sequelize instance - import them directly
    sequelize.addModels([
      User,
      Property,
      PropertyImage,
      Inquiry,
      UserFavorite,
      SavedSearch,
      Message,
      Conversation,
      ConversationParticipant,
      Review,
      UrlRedirect,
      CmsContent,
      SeoSettingsClass,
      SiteVisit,
    ]);
    console.log('📋 Models loaded successfully.');
    
    // Log registered models for debugging
    console.log('🔍 Registered models:', Object.keys(sequelize.models));
    
    // Wait a moment for models to be fully registered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Define model associations with the sequelize instance
    console.log('🔗 Defining model associations...');
    defineAssociations(sequelize);
    console.log('✅ Model associations defined successfully.');
    
    // Test database connection without altering schema
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection verified successfully.');
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};
