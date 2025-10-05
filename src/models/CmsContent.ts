import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CmsContentAttributes {
  id: number;
  type: 'banner' | 'announcement' | 'page' | 'widget';
  key: string;
  title: string;
  content: string;
  metadata?: object;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CmsContentCreationAttributes extends Optional<CmsContentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CmsContent extends Model<CmsContentAttributes, CmsContentCreationAttributes> implements CmsContentAttributes {
  public id!: number;
  public type!: 'banner' | 'announcement' | 'page' | 'widget';
  public key!: string;
  public title!: string;
  public content!: string;
  public metadata?: object;
  public isActive!: boolean;
  public displayOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Remove the immediate initialization - this will be done later
// CmsContent.init({...}, { sequelize }); // <-- This line causes the error

export default CmsContent;

// Export an initialization function instead
export const initializeCmsContent = () => {
  CmsContent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM('banner', 'announcement', 'page', 'widget'),
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'cms_content',
      timestamps: true,
      underscored: true,
    }
  );
};
