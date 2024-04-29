const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productesvenuts', {
    pv_v_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'ventes',
        key: 'v_id'
      }
    },
    pv_stock_prod_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'stock',
        key: 'stock_prod_id'
      }
    },
    pv_quantitat: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'productesvenuts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pv_v_id" },
          { name: "pv_stock_prod_id" },
        ]
      },
      {
        name: "fk_pv_stock_prod_id_idx",
        using: "BTREE",
        fields: [
          { name: "pv_stock_prod_id" },
        ]
      },
    ]
  });
};
