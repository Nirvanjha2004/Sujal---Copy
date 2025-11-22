// Import models only when needed to avoid circular dependencies
let User: any, Property: any, PropertyImage: any, Inquiry: any;
let UserFavorite: any, SavedSearch: any, Message: any, Conversation: any;
let ConversationParticipant: any, CmsContent: any, Review: any, UrlRedirect: any, SiteVisit: any;

// Helper function to safely get model from sequelize instance
function getModel(sequelizeInstance: any, modelName: string): any {
  const model = sequelizeInstance.models[modelName];
  if (!model) {
    console.warn(`⚠️  Model ${modelName} not found in sequelize models`);
    return null;
  }
  return model;
}

export function defineAssociations(sequelizeInstance: any): void {
  console.log('🔗 Starting association definition...');
  
  try {
    // Get models from sequelize instance to avoid import issues
    User = getModel(sequelizeInstance, 'User');
    Property = getModel(sequelizeInstance, 'Property');
    PropertyImage = getModel(sequelizeInstance, 'PropertyImage');
    Inquiry = getModel(sequelizeInstance, 'Inquiry');
    UserFavorite = getModel(sequelizeInstance, 'UserFavorite');
    SavedSearch = getModel(sequelizeInstance, 'SavedSearch');
    Message = getModel(sequelizeInstance, 'Message');
    Conversation = getModel(sequelizeInstance, 'Conversation');
    ConversationParticipant = getModel(sequelizeInstance, 'ConversationParticipant');
    CmsContent = getModel(sequelizeInstance, 'CmsContent');
    Review = getModel(sequelizeInstance, 'Review');
    UrlRedirect = getModel(sequelizeInstance, 'UrlRedirect');
    SiteVisit = getModel(sequelizeInstance, 'SiteVisit');

    // Only define associations if models exist
    if (!User || !Property) {
      console.error('❌ Core models (User, Property) not found, skipping associations');
      return;
    }

    console.log('🔗 Defining User associations...');
    // User associations
    User.hasMany(Property, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
      as: 'properties',
    });

    if (Inquiry) {
      User.hasMany(Inquiry, {
        foreignKey: 'inquirer_id',
        onDelete: 'SET NULL',
        as: 'inquiries',
      });
    }

    if (UserFavorite) {
      User.hasMany(UserFavorite, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'favorites',
      });
    }

    if (SavedSearch) {
      User.hasMany(SavedSearch, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'saved_searches',
      });
    }

    if (Message) {
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
    }

    if (ConversationParticipant) {
      User.hasMany(ConversationParticipant, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'participations',
      });
    }

    if (Conversation && ConversationParticipant) {
      User.belongsToMany(Conversation, {
        through: ConversationParticipant,
        foreignKey: 'user_id',
        otherKey: 'conversation_id',
        as: 'conversations',
      });
    }

    console.log('🔗 Defining Property associations...');
    // Property associations
    Property.belongsTo(User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
      as: 'owner',
    });

    if (PropertyImage) {
      Property.hasMany(PropertyImage, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'images',
      });
    }

    if (Inquiry) {
      Property.hasMany(Inquiry, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'inquiries',
      });
    }

    if (UserFavorite) {
      Property.hasMany(UserFavorite, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'favorites',
      });
    }

    if (Message) {
      Property.hasMany(Message, {
        foreignKey: 'property_id',
        onDelete: 'SET NULL',
        as: 'messages',
      });
    }

    if (Conversation) {
      Property.hasMany(Conversation, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'propertyConversations',
      });
    }

    console.log('🔗 Defining PropertyImage associations...');
    if (PropertyImage) {
      PropertyImage.belongsTo(Property, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'property',
      });
    }

    console.log('🔗 Defining Inquiry associations...');
    if (Inquiry) {
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

      if (Message) {
        Inquiry.hasMany(Message, {
          foreignKey: 'inquiry_id',
          onDelete: 'SET NULL',
          as: 'messages',
        });
      }

      if (Conversation) {
        Inquiry.belongsTo(Conversation, {
          foreignKey: 'conversation_id',
          onDelete: 'SET NULL',
          as: 'conversation',
        });
      }
    }

    console.log('🔗 Defining UserFavorite associations...');
    if (UserFavorite) {
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
    }

    console.log('🔗 Defining SavedSearch associations...');
    if (SavedSearch) {
      SavedSearch.belongsTo(User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'searchUser',
      });
    }

    console.log('🔗 Defining Message associations...');
    if (Message) {
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

      if (Inquiry) {
        Message.belongsTo(Inquiry, {
          foreignKey: 'inquiry_id',
          onDelete: 'SET NULL',
          as: 'inquiry',
        });
      }
    }

    console.log('🔗 Defining Conversation associations...');
    if (Conversation) {
      Conversation.belongsTo(Property, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'property',
      });

      if (ConversationParticipant) {
        Conversation.hasMany(ConversationParticipant, {
          foreignKey: 'conversation_id',
          onDelete: 'CASCADE',
          as: 'participants',
        });

        Conversation.belongsToMany(User, {
          through: ConversationParticipant,
          foreignKey: 'conversation_id',
          otherKey: 'user_id',
          as: 'users',
        });
      }

      if (Inquiry) {
        Conversation.hasMany(Inquiry, {
          foreignKey: 'conversation_id',
          onDelete: 'SET NULL',
          as: 'relatedInquiries',
        });
      }
    }

    console.log('🔗 Defining ConversationParticipant associations...');
    if (ConversationParticipant) {
      if (Conversation) {
        ConversationParticipant.belongsTo(Conversation, {
          foreignKey: 'conversation_id',
          onDelete: 'CASCADE',
          as: 'conversation',
        });
      }

      ConversationParticipant.belongsTo(User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'user',
      });
    }

    // Optional model associations
    console.log('🔗 Defining optional model associations...');
    if (CmsContent) {
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
    }

    if (Review) {
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
    }

    if (UrlRedirect) {
      User.hasMany(UrlRedirect, {
        foreignKey: 'created_by',
        onDelete: 'CASCADE',
        as: 'createdRedirects',
      });
    }

    // SiteVisit associations
    if (SiteVisit) {
      console.log('🔗 Defining SiteVisit associations...');
      
      // Property has many site visits
      Property.hasMany(SiteVisit, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'siteVisits',
      });

      // SiteVisit belongs to property
      SiteVisit.belongsTo(Property, {
        foreignKey: 'property_id',
        onDelete: 'CASCADE',
        as: 'property',
      });

      // User has many site visits as visitor
      User.hasMany(SiteVisit, {
        foreignKey: 'visitor_id',
        onDelete: 'SET NULL',
        as: 'siteVisits',
      });

      // SiteVisit belongs to visitor (optional)
      SiteVisit.belongsTo(User, {
        foreignKey: 'visitor_id',
        onDelete: 'SET NULL',
        as: 'visitor',
      });
    }

    console.log('✅ All model associations defined successfully');
  } catch (error) {
    console.error('❌ Error defining associations:', error);
    throw error;
  }
}