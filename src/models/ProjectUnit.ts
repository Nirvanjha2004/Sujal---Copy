import { DataTypes, Model, Optional } from 'sequelize';
import  sequelize  from '../config/database';

export enum UnitStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  BLOCKED = 'blocked',
  RESERVED = 'reserved'
}

interface ProjectUnitAttributes {
  id: number;
  project_id: number;
  unit_number: string;
  unit_type: string; // 1BHK, 2BHK, 3BHK, etc.
  floor_number: number;
  tower?: string;
  area_sqft: number;
  area_sqm: number;
  carpet_area: number;
  built_up_area: number;
  super_built_up_area: number;
  price: number;
  price_per_sqft: number;
  maintenance_charge?: number;
  parking_spaces: number;
  balconies: number;
  bathrooms: number;
  bedrooms: number;
  facing: string; // North, South, East, West, etc.
  status: UnitStatus;
  floor_plan_image?: string;
  specifications?: Record<string, any>;
  amenities?: string[];
  is_corner_unit: boolean;
  has_terrace: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ProjectUnitCreationAttributes extends Optional<ProjectUnitAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ProjectUnit extends Model<ProjectUnitAttributes, ProjectUnitCreationAttributes> implements ProjectUnitAttributes {
  public id!: number;
  public project_id!: number;
  public unit_number!: string;
  public unit_type!: string;
  public floor_number!: number;
  public tower?: string;
  public area_sqft!: number;
  public area_sqm!: number;
  public carpet_area!: number;
  public built_up_area!: number;
  public super_built_up_area!: number;
  public price!: number;
  public price_per_sqft!: number;
  public maintenance_charge?: number;
  public parking_spaces!: number;
  public balconies!: number;
  public bathrooms!: number;
  public bedrooms!: number;
  public facing!: string;
  public status!: UnitStatus;
  public floor_plan_image?: string;
  public specifications?: Record<string, any>;
  public amenities?: string[];
  public is_corner_unit!: boolean;
  public has_terrace!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProjectUnit.init(
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
    unit_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    unit_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tower: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    area_sqft: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    area_sqm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    carpet_area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    built_up_area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    super_built_up_area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    price_per_sqft: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    maintenance_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    parking_spaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    balconies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    facing: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UnitStatus)),
      allowNull: false,
      defaultValue: UnitStatus.AVAILABLE,
    },
    floor_plan_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_corner_unit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    has_terrace: {
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
    tableName: 'project_units',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['project_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['unit_type'],
      },
      {
        unique: true,
        fields: ['project_id', 'unit_number'],
      },
    ],
  }
);

export { ProjectUnit };