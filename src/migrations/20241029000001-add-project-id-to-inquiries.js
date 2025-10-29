'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add project_id column
    await queryInterface.addColumn('inquiries', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Add index for project_id
    await queryInterface.addIndex('inquiries', ['project_id'], {
      name: 'idx_inquiries_project_id'
    });

    // Make property_id nullable
    await queryInterface.changeColumn('inquiries', 'property_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Note: Check constraints are not well supported in Sequelize migrations
    // You may need to add the check constraint manually:
    // ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_reference 
    // CHECK ((property_id IS NOT NULL AND project_id IS NULL) OR (property_id IS NULL AND project_id IS NOT NULL));
  },

  async down(queryInterface, Sequelize) {
    // Remove the check constraint (if added manually)
    // await queryInterface.sequelize.query('ALTER TABLE inquiries DROP CONSTRAINT chk_inquiries_reference');
    
    // Remove index
    await queryInterface.removeIndex('inquiries', 'idx_inquiries_project_id');
    
    // Remove project_id column
    await queryInterface.removeColumn('inquiries', 'project_id');
    
    // Make property_id required again
    await queryInterface.changeColumn('inquiries', 'property_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};