import { DataTypes, Model, Optional } from 'sequelize';
import  sequelize  from '../config/database';

export enum ProjectStatus {
  PLANNING = 'planning',
  PRE_LAUNCH = 'pre_launch',
  UNDER_CONSTRUCTION = 'under_construction',
  READY_TO_MOVE = 'ready_to_move',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

export enum ProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  MIXED_USE = 'mixed_use',
  VILLA = 'villa',
  APARTMENT = 'apartment',
  OFFICE = 'office',
  RETAIL = 'retail'
}

interface ProjectAttributes {
  id: number;
  builder_id: number;
  name: string;
  description?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  project_type: ProjectType;
  status: ProjectStatus;
  total_units: number;
  available_units: number;
  sold_units: number;
  blocked_units: number;
  start_date?: Date;
  expected_completion?: Date;
  actual_completion?: Date;
  rera_number?: string;
  approval_status: string;
  amenities?: string[];
  specifications?: Record<string, any>;
  pricing?: Record<string, any>;
  floor_plans?: string[];
  brochure_url?: string;
  video_url?: string;
  virtual_tour_url?: string;
  is_active: boolean;
  featured: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public builder_id!: number;
  public name!: string;
  public description?: string;
  public location!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public pincode!: string;
  public project_type!: ProjectType;
  public status!: ProjectStatus;
  public total_units!: number;
  public available_units!: number;
  public sold_units!: number;
  public blocked_units!: number;
  public start_date?: Date;
  public expected_completion?: Date;
  public actual_completion?: Date;
  public rera_number?: string;
  public approval_status!: string;
  public amenities?: string[];
  public specifications?: Record<string, any>;
  public pricing?: Record<string, any>;
  public floor_plans?: string[];
  public brochure_url?: string;
  public video_url?: string;
  public virtual_tour_url?: string;
  public is_active!: boolean;
  public featured!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    builder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    project_type: {
      type: DataTypes.ENUM(...Object.values(ProjectType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProjectStatus)),
      allowNull: false,
      defaultValue: ProjectStatus.PLANNING,
    },
    total_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    available_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sold_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    blocked_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expected_completion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_completion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rera_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    approval_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    pricing: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    floor_plans: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    brochure_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    virtual_tour_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['builder_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['project_type'],
      },
      {
        fields: ['city', 'state'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export { Project };