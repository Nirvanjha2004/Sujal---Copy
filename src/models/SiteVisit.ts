import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import {User} from './User';
import {Property} from './Property';

class SiteVisit extends Model {
  public id!: number;
  public property_id!: number;
  public visitor_id?: number;
  public visitor_name!: string;
  public visitor_email!: string;
  public visitor_phone?: string;
  public scheduled_at!: Date;
  public status!: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  public notes?: string;
  public agent_notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

SiteVisit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    visitor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    visitor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visitor_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visitor_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show'),
      defaultValue: 'scheduled',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    agent_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'site_visits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Setup associations
SiteVisit.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
SiteVisit.belongsTo(User, { foreignKey: 'visitor_id', as: 'visitor' });

export default SiteVisit;