import { User } from './User';
import { Property } from './Property';
import { PropertyImage } from './PropertyImage';
import { Inquiry } from './Inquiry';
import { UserFavorite } from './UserFavorite';
import { SavedSearch } from './SavedSearch';
import { Message } from './Message';
import CmsContent from './CmsContent';
import Review from './Review';
import UrlRedirect from './UrlRedirect';

export function defineAssociations(): void {
  // User associations
  User.hasMany(Property, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'properties',
  });

  User.hasMany(Inquiry, {
    foreignKey: 'inquirer_id',
    onDelete: 'SET NULL',
    as: 'inquiries',
  });

  User.hasMany(UserFavorite, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'favorites',
  });

  User.hasMany(SavedSearch, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'saved_searches',
  });

  User.hasMany(Message, {
    foreignKey: 'sender_id',
    onDelete: 'CASCADE',
    as: 'sent_messages',
  });

  User.hasMany(Message, {
    foreignKey: 'recipient_id',
    onDelete: 'CASCADE',
    as: 'received_messages',
  });

  // Property associations
  Property.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'owner',
  });

  Property.hasMany(PropertyImage, {
    foreignKey: 'property_id',
    onDelete: 'CASCADE',
    as: 'images',
  });

  Property.hasMany(Inquiry, {
    foreignKey: 'property_id',
    onDelete: 'CASCADE',
    as: 'inquiries',
  });

  Property.hasMany(UserFavorite, {
    foreignKey: 'property_id',
    onDelete: 'CASCADE',
    as: 'favorites',
  });

  Property.hasMany(Message, {
    foreignKey: 'property_id',
    onDelete: 'SET NULL',
    as: 'messages',
  });

  // PropertyImage associations
  PropertyImage.belongsTo(Property, {
    foreignKey: 'property_id',
    onDelete: 'CASCADE',
    as: 'property',
  });

  // Inquiry associations
  Inquiry.belongsTo(Property, {
    foreignKey: 'property_id',
    onDelete: 'CASCADE',
    as: 'property',
  });

  Inquiry.belongsTo(User, {
    foreignKey: 'inquirer_id',
    onDelete: 'SET NULL',
    as: 'inquirer',
  });

  Inquiry.hasMany(Message, {
    foreignKey: 'inquiry_id',
    onDelete: 'SET NULL',
    as: 'messages',
  });

  // UserFavorite associations
  UserFavorite.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'favoriteUser',
  });

  UserFavorite.belongsTo(Property, {
    foreignKey: 'property_id',
    onDelete: 'CASCADE',
    as: 'property',
  });

  // SavedSearch associations
  SavedSearch.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'searchUser',
  });

  // Message associations
  Message.belongsTo(User, {
    foreignKey: 'sender_id',
    onDelete: 'CASCADE',
    as: 'sender',
  });

  Message.belongsTo(User, {
    foreignKey: 'recipient_id',
    onDelete: 'CASCADE',
    as: 'recipient',
  });

  Message.belongsTo(Property, {
    foreignKey: 'property_id',
    onDelete: 'SET NULL',
    as: 'property',
  });

  Message.belongsTo(Inquiry, {
    foreignKey: 'inquiry_id',
    onDelete: 'SET NULL',
    as: 'inquiry',
  });

  // CmsContent associations
  CmsContent.belongsTo(User, {
    foreignKey: 'createdBy',
    onDelete: 'CASCADE',
    as: 'creator',
  });

  User.hasMany(CmsContent, {
    foreignKey: 'createdBy',
    onDelete: 'CASCADE',
    as: 'createdContent',
  });

  // Review and UrlRedirect belongsTo associations are defined using decorators in their respective model files
  // HasMany associations need to be defined here

  User.hasMany(Review, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'userReviews',
  });

  Property.hasMany(Review, {
    foreignKey: 'property_id', 
    onDelete: 'CASCADE',
    as: 'propertyReviews',
  });

  User.hasMany(UrlRedirect, {
    foreignKey: 'created_by',
    onDelete: 'CASCADE',
    as: 'createdRedirects',
  });
}