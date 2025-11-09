import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Project } from './Project';

interface ProjectImageAttributes {
  id: number;
  project_id: number;
  image_url: string;
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  s3_key?: string;
  s3_bucket?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  image_type?: string;
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
  public thumbnail_url?: string;
  public medium_url?: string;
  public large_url?: string;
  public s3_key?: string;
  public s3_bucket?: string;
  public file_size?: number;
  public mime_type?: string;
  public width?: number;
  public height?: number;
  public alt_text?: string;
  public caption?: string;
  public image_type?: string;
  public is_primary!: boolean;
  public display_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public project?: Project;

  // Static methods for bulk operations
  static async reorderImages(projectId: number, imageIds: number[]): Promise<void> {
    const updates = imageIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      await ProjectImage.update(
        { display_order: update.display_order },
        { where: { id: update.id, project_id: projectId } }
      );
    }
  }

  static async getPrimaryImage(projectId: number): Promise<ProjectImage | null> {
    return ProjectImage.findOne({
      where: { project_id: projectId, is_primary: true },
    });
  }

  static async getFirstImage(projectId: number): Promise<ProjectImage | null> {
    return ProjectImage.findOne({
      where: { project_id: projectId },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']],
    });
  }

  static async setPrimaryImage(projectId: number, imageId: number): Promise<void> {
    // Unset all primary images for this project
    await ProjectImage.update(
      { is_primary: false },
      { where: { project_id: projectId } }
    );

    // Set the specified image as primary
    await ProjectImage.update(
      { is_primary: true },
      { where: { id: imageId, project_id: projectId } }
    );
  }
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
      onDelete: 'CASCADE',
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    medium_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    large_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    s3_key: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    s3_bucket: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_type: {
      type: DataTypes.ENUM('exterior', 'interior', 'amenity', 'floor_plan', 'site_plan', 'location', 'gallery'),
      allowNull: true,
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
    indexes: [
      {
        fields: ['project_id'],
      },
      {
        fields: ['display_order'],
      },
      {
        fields: ['is_primary'],
      },
      {
        fields: ['s3_key'],
      },
    ],
  }
);

// Define associations
ProjectImage.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project',
});

Project.hasMany(ProjectImage, {
  foreignKey: 'project_id',
  as: 'images',
});

export { ProjectImage };
