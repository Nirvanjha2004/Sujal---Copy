import { Sequelize } from 'sequelize-typescript';
import config from './index';
import path from 'path';
import { defineAssociations } from '../models/associations';
import { initializeCmsContent } from '../models/CmsContent';
import { initializeSeoSettings } from '../models/SeoSettings';

const sequelize = new Sequelize({
  database: config.database.name,
  dialect: 'mysql',
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  // Don't auto-load models from directory to avoid loading non-model files
  // models: [path.join(__dirname, '../models')],
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
    
    // Add models to sequelize manually (excluding associations.ts)
    sequelize.addModels([
      path.join(__dirname, '../models/User.ts'),
      path.join(__dirname, '../models/Property.ts'),
      path.join(__dirname, '../models/PropertyImage.ts'),
      path.join(__dirname, '../models/Inquiry.ts'),
      path.join(__dirname, '../models/UserFavorite.ts'),
      path.join(__dirname, '../models/SavedSearch.ts'),
      path.join(__dirname, '../models/Message.ts'),
      path.join(__dirname, '../models/Review.ts'),
      path.join(__dirname, '../models/UrlRedirect.ts'),
    ]);
    
    // Initialize models after connection is established
    initializeCmsContent();
    initializeSeoSettings();
    console.log('📋 Models initialized successfully.');
    
    // Define model associations
    defineAssociations();
    console.log('🔗 Model associations defined successfully.');
    
    // Remove force: true and use alter: true instead
    await sequelize.sync({ 
      alter: true,  // Use alter instead of force
      // force: true  // Remove this line - it drops all tables on restart
    });
    console.log('🔄 Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};
