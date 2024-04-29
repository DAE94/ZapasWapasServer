const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productes', {
    prod_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    prod_nom: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    prod_tipus: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: 'tipus',
        key: 'tipus_nom'
      }
    },
    prod_estil: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: 'estils',
        key: 'estils_nom'
      }
    },
    prod_preuVenta: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    prod_preuCompra: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    prod_marca: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: 'marques',
        key: 'marca_nom'
      }
    },
    prod_oferta: {
      type: DataTypes.DECIMAL(3,2),
      allowNull: false
    },
    prod_imatge: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    prod_rating: {
      type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'productes',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "prod_id" },
        ]
      },
      {
        name: "fk_prod_marca_idx",
        using: "BTREE",
        fields: [
          { name: "prod_marca" },
        ]
      },
      {
        name: "fk_prod_estil_idx",
        using: "BTREE",
        fields: [
          { name: "prod_estil" },
        ]
      },
      {
        name: "fk_prod_tipus_idx",
        using: "BTREE",
        fields: [
          { name: "prod_tipus" },
        ]
      },
    ]
  });
};
