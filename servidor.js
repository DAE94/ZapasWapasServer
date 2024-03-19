const express = require('express');
const cors=require('cors');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
var jp = require('jsonpath');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');



const serviceAccount = require('./botigaonline-dam-firebase-adminsdk-fkr0g-fda07391af.json');
const string_decoder = require("string_decoder");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'daniel.gomez@institutvidreres.cat',
        pass: '11042003.Dgs'
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
    const snapshot = await usuariRef.where('usuari', '==', usuari).where('password', '==', password).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes', loggin: false, mlog: 'intent login erroni: ', key:`${usuari}`});
    } else {
        res.json({missatge:'Login exitós', loggin:true,  mlog: 'login correcte: ', key:`${usuari}`});
    }
});

app.post('/registrar', async (req, res) => {
    const data = {usuari: req.body.usuari, password: req.body.password, nom: req.body.nom, email: req.body.email, telefon: req.body.telefon, verificat: false}
    const doc = await db.collection('USUARIS').doc(req.body.usuari).get();
    if (doc.exists){
        res.json({missatge: "L'usuari ja existeix", mlog: "intent creació usuari ja existent: ", key: `${data.usuari}`})
    } else {
        await  db.collection('USUARIS').doc(req.body.usuari).set(data);
        res.json({missatge: "S'ha creat l'usuari", mlog:"creació d'usuari: ", key: `${data.usuari}`})
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
    const body = {usuari: req.body.usuari, password: req.body.password, nom: req.body.nom, email: req.body.email, telefon: req.body.email, cognom: req.body.cognom};
    const doc = await db.collection('USUARIS').doc(body.usuari).set(body);
    res.json({missatge: 'modificació correcte!', mlog: 'modificació del perfil correcte del usuari : ', key:`${body.usuari}`});

});

app.post('/logs', (req, res) =>{
    const logMissatge = req.body.missatge;
    const arxiuLogs = fs.createWriteStream('logs.txt', {flags: 'a+'});
    arxiuLogs.end(logMissatge+'\n')
    res.json({missatge: 'log creat correctament'});
});
app.post('/recuperarContrasenya', (req, res) => {
    const { email } = req.body;

    const mailOptions = {
        from: 'daniel.gomez@institutvidreres.cat',
        to: email,
        subject: 'Canvi de contrasenya',
        text: 'Aquí pots canviar la teva contrasenya: [http://localhost:4200/canviar-contrasenya]'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.json({mlog: 'Error al enviar al enviar el correu', key:`${email}`});
        } else {
            console.log('Correu enviat: ' + info.response);
            res.json({mlog: 'Correu enviat', key:`${email}`});
        }
    });
});

app.get('/verificarCorreu', async (req, res) => {
    try {
        const { email, nomUsuari, enllacVerificacio } = req.query;

        const mailOptions = {
            from: 'daniel.gomez@institutvidreres.cat',
            to: email,
            subject: 'Verificació usuari',
            html: `<p>Hola ${nomUsuari}, fes click per a verificar l'usuari <a href="${enllacVerificacio}">Verificar usuari</a></p>`
        };

        await transporter.sendMail(mailOptions);

        await firebase.database().ref('USUARIS').child(nomUsuari).update({ verificat: true });

        res.json({mlog: 'Usuari verificat', key:`${nomUsuari}`});

    } catch (error) {
        console.error('Error:', error);
        res.json({mlog: 'Error al verificar usuari', key:`${nomUsuari}`});
    }
});
