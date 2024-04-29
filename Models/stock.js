const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stock', {
    stock_prod_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    stock_quantitat: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'stock',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "stock_prod_id" },
        ]
      },
    ]
  });
};
