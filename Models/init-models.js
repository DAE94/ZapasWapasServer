var DataTypes = require("sequelize").DataTypes;
var _estils = require("./estils");
var _marques = require("./marques");
var _productes = require("./productes");
var _productesvenuts = require("./productesvenuts");
var _stock = require("./stock");
var _tipus = require("./tipus");
var _ventes = require("./ventes");

function initModels(sequelize) {
  var estils = _estils(sequelize, DataTypes);
  var marques = _marques(sequelize, DataTypes);
  var productes = _productes(sequelize, DataTypes);
  var productesvenuts = _productesvenuts(sequelize, DataTypes);
  var stock = _stock(sequelize, DataTypes);
  var tipus = _tipus(sequelize, DataTypes);
  var ventes = _ventes(sequelize, DataTypes);

  stock.belongsToMany(ventes, { as: 'pv_v_id_ventes', through: productesvenuts, foreignKey: "pv_stock_prod_id", otherKey: "pv_v_id" });
  ventes.belongsToMany(stock, { as: 'pv_stock_prod_id_stocks', through: productesvenuts, foreignKey: "pv_v_id", otherKey: "pv_stock_prod_id" });
  productes.belongsTo(estils, { as: "prod_estil_estil", foreignKey: "prod_estil"});
  estils.hasMany(productes, { as: "productes", foreignKey: "prod_estil"});
  productes.belongsTo(marques, { as: "prod_marca_marque", foreignKey: "prod_marca"});
  marques.hasMany(productes, { as: "productes", foreignKey: "prod_marca"});
  productesvenuts.belongsTo(stock, { as: "pv_stock_prod", foreignKey: "pv_stock_prod_id"});
  stock.hasMany(productesvenuts, { as: "productesvenuts", foreignKey: "pv_stock_prod_id"});
  productes.belongsTo(tipus, { as: "prod_tipus_tipu", foreignKey: "prod_tipus"});
  tipus.hasMany(productes, { as: "productes", foreignKey: "prod_tipus"});
  productesvenuts.belongsTo(ventes, { as: "pv_v", foreignKey: "pv_v_id"});
  ventes.hasMany(productesvenuts, { as: "productesvenuts", foreignKey: "pv_v_id"});

  return {
    estils,
    marques,
    productes,
    productesvenuts,
    stock,
    tipus,
    ventes,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
