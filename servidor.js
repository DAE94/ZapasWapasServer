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
const serviceAccount = require('./botigaonline-dam-firebase-adminsdk-fkr0g-fda07391af.json');
const string_decoder = require("string_decoder");


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


initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

port = 3080;

app.listen(port, ()=> {
    console.log(`server escoltant el port : ${port}`);
});


app.get('/login', async (req, res)=>{
    const { usuari, password } = req.query;
    const usuariRef = db.collection('USUARIS');
    const snapshot = await usuariRef.where('usuari', '==', usuari).where('password', '==', password).where('verificat', '==', true).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes', loggin: false, mlog: 'intent login erroni: ', key:`${usuari}`});
    } else {
        res.json({missatge:'Login exitós', loggin:true,  mlog: 'login correcte: ', key:`${usuari}`});
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

