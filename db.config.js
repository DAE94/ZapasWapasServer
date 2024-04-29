const Sequelize = require('sequelize')
const express = require('express');
const app = express();
const fs = require('fs');
const path = require("path");

const crearConfigBaseDades = () =>{
    //Lectura de fitxer json per obtenir credencials
    const fitxer = JSON.parse(fs.readFileSync('./.idea/credencials.json','utf8'));

    // connexió bb.dd.
    return new Sequelize(fitxer.nom,fitxer.usuari,fitxer.password,{
        host: "localhost",
        dialect: "mysql",
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        }
    });
}
module.exports = {crearConfigBaseDades}
