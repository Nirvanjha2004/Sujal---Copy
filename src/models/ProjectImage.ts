import { DataTypes, Model, Optional } from 'sequelize';
import  sequelize  from '../config/database';

interface ProjectImageAttributes {
  id: number;
  project_id: number;
  image_url: string;
  alt_text?: string;
  image_type: 'exterior' | 'interior' | 'amenity' | 'floor_plan' | 'site_plan' | 'location' | 'gallery';
  is_primary: boolean;
  display_order: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ProjectImageCreationAttributes extends Optional<ProjectImageAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ProjectImage extends Model<ProjectImageAttributes, ProjectImageCreationAttributes> implements ProjectImageAttributes {
  public id!: number;
  public project_id!: number;
  public image_url!: string;
  public alt_text?: string;
  public image_type!: 'exterior' | 'interior' | 'amenity' | 'floor_plan' | 'site_plan' | 'location' | 'gallery';
  public is_primary!: boolean;
  public display_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProjectImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    image_type: {
      type: DataTypes.ENUM('exterior', 'interior', 'amenity', 'floor_plan', 'site_plan', 'location', 'gallery'),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'project_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { ProjectImage };