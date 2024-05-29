const express = require('express');
const cors=require('cors');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
var jp = require('jsonpath');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const router = require('express');
const serviceAccount = require('./.idea/botigaonline-dam-firebase-adminsdk-fkr0g-fda07391af.json');
const string_decoder = require("string_decoder");
const moment = require('moment');
const mysql = require('mysql2');
const Web3 = require('web3');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        user: 'botigazapaswapas@gmail.com',
        pass: 'uffc vnlw fbvb aevg'
        //pass: 123456789Admin.
    }
});
const fitxer = JSON.parse(fs.readFileSync('.idea/credencials.json','utf8'));
const connection = mysql.createConnection({
  host: 'localhost',
  user: fitxer.usuari,
  password: fitxer.password,
  database: fitxer.nom
});


const {crearConfigBaseDades} = require('./.idea/db.config.js'); //credencials bbdd
const dbProd =  crearConfigBaseDades(); //connexió bbdd
const {Sequelize} = require("sequelize");
const {initModels}= require('./Models/init-models.js')

initializeApp({credential: cert(serviceAccount)});

const db = getFirestore();
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use("/imatge", express.static("/imatge"));
app.use(express.static('.'))
app.use('/Principal', express.static('Principal'))

port = 3080;
app.listen(port, ()=> {
    console.log(`server escoltant el port : ${port}`);
});
connection.connect((err)=>{
    if(err) throw err;
    console.log('connected to MYSQL!')
});


app.post('/addNewProduct', (req, res) => {
    const { prod_nom, prod_tipus, prod_estil, prod_preuVenta, prod_preuCompra, prod_marca, prod_oferta, prod_imatge } = req.body;
    try{
        connection.execute(
            'INSERT INTO productes (prod_nom, prod_tipus, prod_estil, prod_preuVenta, prod_preuCompra, prod_marca, prod_oferta, prod_imatge, prod_rating) VALUES (?,?,?,?,?,?,?,?,?)',
            [prod_nom,prod_tipus, prod_estil, prod_preuVenta, prod_preuCompra, prod_marca, prod_oferta, prod_imatge, 0],
            (err, result) => {
                if (err) {
                    console.error('Error al actualitzar productes:', err);
                    res.json('Error intern del servidor');
                } else {
                    res.json('producte afegit');
                }
            }
        )
    }catch (error) {
        console.error('Error al actualitzar stock:', error);
        res.json('Error intern del servidor');
    }
});

app.post('/removeStock', async (req, res) => {
    try {
        const idProducte = req.body.id;
        const quantitat = req.body.quantitat;

        connection.execute(
            'UPDATE stock SET stock_quantitat = stock_quantitat - ? WHERE stock_prod_id = ?',
            [quantitat, idProducte],
            (err, result) => {
                if (err) {
                    console.error('Error al actualitzar stock:', err);
                    res.json('Error intern del servidor');
                } else {
                    if (result.affectedRows > 0) {
                        res.json('Stock actualitzat correctament');
                    } else {
                        res.json('no hi ha aquest producte al inventari');
                    }
                }
            }
        );
    } catch (error) {
        console.error('Error al actualitzar stock:', error);
        res.json('Error intern del servidor');
    }
    // try {
    //     const Stock = initModels(dbProd).stock;
    //
    //     // Buscar el registro de stock por el ID del producto
    //     const existingStock = await Stock.findOne({ where: { stock_prod_id: req.body.id } });
    //
    //     if (existingStock) {
    //         // Restar la cantidad especificada del stock
    //         existingStock.stock_quantitat -= req.body.quantitat;
    //
    //         // Guardar los cambios en la base de datos
    //         await existingStock.save();
    //
    //         res.send('Stock actualizado correctamente');
    //     } else {
    //         // Si no se encuentra el registro de stock, devolver un mensaje de error
    //         res.status(404).send('El producto no se encuentra en el inventario');
    //     }
    // } catch (error) {
    //     console.error('Error al actualizar el stock:', error);
    //     res.status(500).send('Error interno del servidor');
    // }
});

app.post('/addProducteVenut',async (req, res)=>{
    try {
        const data = moment.utc(req.body.data, 'YYYY/MM/DD').toDate();
        // obtenir el màxim v_id de la taula 'vendes'
        const maxVIdQuery = 'SELECT MAX(v_id) AS maxVId FROM ventes';
        connection.execute(maxVIdQuery, async (err, result) => {
            if (err) {
                console.error('Error al obtener el máximo v_id:', err);
                res.status(500).send('Error interno del servidor');
                return;
            }

            const maxVId = result[0].maxVId;

            // Insertar el registre a la base de dades
            const insertQuery = 'INSERT INTO productesvenuts (pv_v_id, pv_stock_prod_id, pv_quantitat, pv_data, pv_oferta, pv_preu, pv_preuFinal) VALUES (?, ?, ?, ?, ?, ?, ?)';
            connection.execute(
                insertQuery,
                [maxVId, req.body.id, req.body.quantitat, data, req.body.oferta, req.body.preu, req.body.preuFinal],
                (err, result) => {
                    if (err) {
                        console.error('Error al añadir productesvenuts:', err);
                        res.status(500).send('Error interno del servidor');
                    } else {
                        res.send('productes afegits');
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error al añadir productesvenuts:', error);
        res.send('Error interno del servidor');
    }

    // try {
    //     const maxVId = await initModels(dbProd).ventes.max('v_id');
    //     console.log(maxVId);
    //
    //     // Insertar el registro en la base de datos
    //     await initModels(dbProd).productesvenuts.create({
    //         pv_v_id:maxVId,
    //         pv_stock_prod_id: req.body.id,
    //         pv_quantitat: req.body.quantitat
    //     });
    //
    //     res.send('productes afegits');
    // } catch (error) {
    //     console.error('Error al afegir productesvenuts:', error);
    //     res.send('Error interno del servidor');
    // }

});

app.post('/addVenta', async (req, res) => {
    // Parsejar la data utilitzant Moment.js i convertir-la en un objecte date
    const data = moment.utc(req.body.data, 'YYYY/MM/DD').toDate();
    const usuari = req.body.usuari;
    const moneda = req.body.moneda;
    const preu = req.body.preu;


    try {
        connection.execute(
            'INSERT INTO ventes (v_client, v_data, v_moneda, v_preu) VALUES (?, ?, ?, ?)',
            [usuari, data, moneda, preu],
            (err, result) => {
                if (err) {
                    console.error('Error al afegir la venda:', err);
                    res.json('Error intern del servidor');
                } else {
                    res.json('Venda afegida correctament');
                }
            }
        );
    } catch (error) {
        console.error('Error al afegir la venda:', error);
        res.json('Error intern del servidor');
    }
    //----------------> FET PER SEQUELIZE <--------------------
    // try {
    //     // Insertar el registro en la base de datos
    //     await initModels(dbProd).ventes.create({
    //         v_client: req.body.usuari,
    //         v_data: fecha
    //     });
    //
    //     res.status(200).send('Venta añadida correctamente');
    // } catch (error) {
    //     console.error('Error al añadir la venta:', error);
    //     res.status(500).send('Error interno del servidor');
    // }
})

app.get('/getProducts', async  (req, res) => {
    try {
        // Obtenir la llista de productos
        const productsResult = await initModels(dbProd).productes.findAll();

        //Mapeig i neteja de cada producte
        const cleanedProducts = [];

        // Recorrer cada producte para obtenir stock
        for (const product of productsResult) {

            const cleanedProduct = { ...product.dataValues };

            // Obtenir stock del producte actual
            const stockInfo = await initModels(dbProd).stock.findOne({
                where: { stock_prod_id: cleanedProduct.prod_id },
                attributes: ['stock_quantitat']
            });

            // Agregar la quantitat d' stock al producte actual
            if (stockInfo) {
                cleanedProduct.stock_quantitat = stockInfo.stock_quantitat;
            } else {
                // Si no hi ha informació de stock, establir en null
                cleanedProduct.stock_quantitat = null;
            }

            // Agregar el producte net a la llista
            cleanedProducts.push(cleanedProduct);
        }

        // console.log(cleanedProducts);
        res.json(cleanedProducts);
    } catch (error) {
        console.error("Error al obtenir productes: ", error);
        res.json("Error al obtenir productes");
    }

    //----------------> FET PER SEQUELIZE <--------------------
    // try {
    //     // Obtener la lista de productos
    //     const productsResult = await initModels(dbProd).productes.findAll();
    //
    //     // Mapear y limpiar los productos
    //     const cleanedProducts = [];
    //
    //     for (const product of productsResult) {
    //         // Crear un objeto limpio con los datos del producto
    //         const cleanedProduct = { ...product.dataValues };
    //
    //         // Obtener la información de stock para el producto actual
    //         const stockInfo = await initModels(dbProd).stock.findAll({
    //             where: { stock_prod_id: cleanedProduct.prod_id },
    //             attributes: ['stock_talla', 'stock_quantitat']
    //         });
    //
    //         // Mapear los resultados a un formato JSON específico
    //         const formattedStockInfo = stockInfo.map(stock => ({
    //             stock_talla: stock.stock_talla,
    //             stock_quantitat: stock.stock_quantitat
    //         }));
    //
    //         // Asignar la información de stock al producto actual
    //         cleanedProduct.stock_talla_quantitat = formattedStockInfo;
    //         console.log('formatedStockInfo', formattedStockInfo);
    //
    //         // Agregar el producto limpio a la lista
    //         cleanedProducts.push(cleanedProduct);
    //     }
    //
    //     console.log(cleanedProducts);
    //     res.json(cleanedProducts);
    // } catch (error) {
    //     console.error("Error al obtener productos:", error);
    //     res.json({ error: "Error al obtener productos" });
    // }
});

app.get('/getTypes', async (req, res) => {
    try{
        const typesResult = await initModels(dbProd).tipus.findAll({attributes:['tipus_nom'], raw:true});
        const typeNames = typesResult.map(type => type.tipus_nom);
        res.json(typeNames);
    } catch (error){
        console.log("error al obtenir tipus: ", error)
        res.json({ error: "Error al obtenir tipus" });
    }
});

app.get('/getStyles', async (req, res) => {
    try{
        const stylesResult = await initModels(dbProd).estils.findAll({attributes:['estils_nom'], raw:true});
        const styleNames = stylesResult.map(style => style.estils_nom);
        res.json(styleNames);

    } catch (error){
        console.log("error al obtenir estils: ", error)
        res.json({ error: "Error al obtenir estils" });
    }
});

app.get('/getBrands', async (req, res) => {
    try{
        const brandsResult = await initModels(dbProd).marques.findAll({attributes:['marca_nom'], raw:true});
        const brandNames = brandsResult.map(brand => brand.marca_nom);
        res.json(brandNames);

    } catch (error){
        console.log("error al obtenir marques: ", error)
        res.json({ error: "Error al obtenir marques" });
    }
});

app.get('/login', async (req, res)=>{
    const { usuari, password } = req.query;
    const usuariRef = db.collection('USUARIS');
    const snapshot = await usuariRef.where('usuari', '==', usuari).where('password', '==', password).where('verificat', '==', true).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes', loggin: false, mlog: 'intent login erroni: ', key:`${usuari}`});
    } else {
        const snapshot2 = await usuariRef.where('usuari', '==', usuari).where('password', '==', password).where('admin', '==', true).get();
        if (snapshot2.empty){
            console.log("no admin")
            res.json({missatge:'Login exitós', loggin:true, admin: false, mlog: 'login correcte: ', key:`${usuari}`});
        } else{
            console.log("es admin")
            res.json({missatge:'Login exitós', loggin:true, admin: true, mlog: 'login correcte: ', key:`${usuari}`});
        }

    }
});

app.get('/softLogin', async (req, res)=>{
    const { usuari, password } = req.query;
    const usuariRef = db.collection('USUARIS');
    const snapshot = await usuariRef.where('usuari', '==', usuari).where('password', '==', password).where('verificat', '==', false).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes o Usuari verificat', loggin: false, mlog: 'intent soft-login (verificar correu) erroni: ', key:`${usuari}`});
    } else {
        res.json({missatge:'Login exitós', loggin:true,  mlog: 'Soft-Login (verificar correu) correcte: ', key:`${usuari}`});
    }
});

app.post('/registrar', async (req, res) => {
    const data = {usuari: req.body.usuari, password: req.body.password, nom: req.body.nom, email: req.body.email, telefon: req.body.telefon, verificat: false}
    const doc = await db.collection('USUARIS').doc(req.body.usuari).get();
    if (doc.exists){
        res.json({missatge: "L'usuari ja existeix", mlog: "intent creació usuari ja existent: ", key: `${data.usuari}`})
    } else {
        await  db.collection('USUARIS').doc(req.body.usuari).set(data);
        try {
            const mailToUser = {
                from: 'botigazapaswapas@gmail.com',
                to: `${req.body.email}`,
                subject: 'Verificació de correu',
                text: 'Accedeix a aquest enllaç: [http://localhost:4200/verificar-correu]\n I escriu les teves credencials per verificar el correu!'
            };

            transporter.sendMail(mailToUser, (error, info) =>{
                if (error) {
                    res.json({missatge: "error al verificar!", mlog: "error al verificar correu.", key: `${req.body.usuari}`})
                    console.log(error);
                } else {
                    res.json({missatge: "correu enviat!", mlog: "enviat correu per verificar.", key: `${req.body.email}`})
                    console.log('Correu enviat: ' + info.response);
                }

            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error al verificar usuari.');
        }
        res.json({missatge: "S'ha creat l'usuari, verifica el teu correu!", mlog:"creació d'usuari: ", key: `${data.usuari}`})
    }
});

app.get('/infoPerfil', async (req, res)=>{

    const {usuari} = req.query;
    const usuariRef = db.collection('USUARIS');
    const snapshot = await usuariRef.where('usuari', '==', usuari).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes', mlog: 'accés a perfil denegat a l\'usuari : ', key:`${usuari}`});
    } else {
        snapshot.forEach(doc =>{
            res.json({infoUser:doc.data(),mlog: 'accés a perfil correcte del usuari : ', key:`${usuari}`})
        });
    }

});

app.post('/infoPerfil', async (req,res)=>{
    const body = {usuari: req.body.usuari, password: req.body.password, nom: req.body.nom, email: req.body.email, telefon: req.body.telefon, cognom: req.body.cognom};
    const doc = await db.collection('USUARIS').doc(body.usuari).update(body);
    res.json({missatge: 'modificació correcte!', mlog: 'modificació del perfil correcte del usuari : ', key:`${body.usuari}`});

});

app.post('/canviContrasenya', async (req,res)=>{
    const body = {usuari:req.body.usuari, password: req.body.password}
    const doc = await db.collection('USUARIS').doc(req.body.usuari).update({password: req.body.password});
    res.json({missatge: 'modificació password correcte!', mlog: 'modificació de password correcte del usuari : ', key:`${body.usuari}`});

});

app.post('/verificarCorreu', async (req,res)=>{
    const body = {usuari:req.body.usuari, password: req.body.password}
    const doc = await db.collection('USUARIS').doc(req.body.usuari).update({verificat: true});
    res.json({missatge: 'verificació correcte!', mlog: 'verificació de correu del usuari : ', key:`${body.usuari}`});

});

app.post('/logs', (req, res) =>{
    const logMissatge = req.body.missatge;
    const arxiuLogs = fs.createWriteStream('logs.txt', {flags: 'a+'});
    arxiuLogs.end(logMissatge+'\n');
    res.json({missatge: 'log creat correctament'});
});

app.post('/recuperarContrasenya', (req, res) => {
    const mailToUser = {
        from: 'botigazapaswapas@gmail.com',
        to: `${req.body.email}`,
        subject: 'Canvi de contrasenya a Zapasguapas',
        text: 'Aquí pots canviar la teva contrasenya: [http://localhost:4200/canviar-contrasenya]\n Assegura\'t que estàs logat abans d\'accedir al link!'
    }
    transporter.sendMail(mailToUser, (error, info) => {
        if (error) {
            res.json({missatge: "no hi ha correu assignat al usuari!", mlog: "error al enviar correu per canvi de contrasenya.", key: 'undefined'})
            console.log(error);
        } else {
            res.json({missatge: "correu enviat!", mlog: "enviat correu per canvi de contrasenya.", key: `${req.body.email}`})
            console.log('Correu enviat: ' + info.response);
        }
    });
});

app.post('/contacte', (req,res)=>{
    const nomArxiu = req.body.data+'_'+req.body.nom;
    const writeableStream = fs.createWriteStream(`consultes\\${nomArxiu}.txt`);
    writeableStream.write('nom:'+req.body.nom+'\n');
    writeableStream.write('Assumpte:'+req.body.assumpte+'\n');
    writeableStream.end('Missatge:'+req.body.missatge+'\n');
});

app.use('/Principal', express.static(path.join(__dirname, 'C:\\Users\\alum-01\\Desktop\\ZapasWapasServer\\Principal')))
// app.get('/getStockTalla', async (req, res) => {
//     try{
//         let {id}=req.query;
//         const stockInfo = await initModels(dbProd).stock.findAll({
//             where:{stock_prod_id:id
//             },
//             attributes:['stock_talla', 'stock_quantitat']
//         });
//         // Mapea los resultados a un formato JSON específico
//         const formattedStockInfo = stockInfo.map(stock => ({
//             stock_talla: stock.stock_talla,
//             stock_quantitat: stock.stock_quantitat
//         }));
//         console.log(formattedStockInfo)
//         return formattedStockInfo
//     }catch (error) {
//         console.error("Error al obtener información del stock:", error);
//         throw error;
//     }
// });