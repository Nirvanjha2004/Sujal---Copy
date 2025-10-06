import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SeoSettingsAttributes {
  id: number;
  page: string;
  entityType?: string;        // Add this
  entityId?: number;          // Add this  
  pageType?: string;          // Add this
  isActive?: boolean;         // Add this
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SeoSettingsCreationAttributes extends Optional<SeoSettingsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SeoSettings extends Model<SeoSettingsAttributes, SeoSettingsCreationAttributes> implements SeoSettingsAttributes {
  public id!: number;
  public page!: string;
  public entityType?: string;        // Add this
  public entityId?: number;          // Add this  
  public pageType?: string;          // Add this
  public isActive?: boolean;         // Add this
  public title?: string;
  public description?: string;
  public keywords?: string;
  public ogTitle?: string;
  public ogDescription?: string;
  public ogImage?: string;
  public canonicalUrl?: string;
  public metaRobots?: string;
  public structuredData?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default SeoSettings;

// Export an initialization function
export const initializeSeoSettings = () => {
  SeoSettings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      page: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      entityType: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pageType: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      keywords: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ogTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ogDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ogImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      canonicalUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      metaRobots: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      structuredData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'seo_settings',
      timestamps: true,
      underscored: true,
    }
  );
};
