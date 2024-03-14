const express = require('express');
const cors=require('cors');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
var jp = require('jsonpath');


const serviceAccount = require('./botigaonline-dam-firebase-adminsdk-fkr0g-fda07391af.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const app = express();

app.use(express.json());
app.use(cors());

port = 3080;

app.listen(port, ()=> {
    console.log(`server escoltant el port : ${port}`);
});


app.get('/login', async (req, res)=>{
    const { usuari, password } = req.query;
    const usuariRef = db.collection('USUARIS');
    const snapshot = await usuariRef.where('usuari', '==', usuari).where('password', '==', password).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes', loggin: false});
    } else {
        res.json({missatge:'Login exitós', loggin:true});
    }
});

app.post('/registrar', async (req, res) => {
    const data = {usuari: req.body.usuari, password: req.body.password, nom: req.body.nom, email: req.body.email, telefon: req.body.telefon}
    const doc = await db.collection('USUARIS').doc(req.body.usuari).get();
    if (doc.exists){
        res.json({missatge: "L'usuari ja existeix"})
    } else {
        await  db.collection('USUARIS').doc(req.body.usuari).set(data);
        res.json({missatge: "S'ha creat l'usuari"})
    }
});

app.get('/infoPerfil', async (req, res)=>{
    const { usuari } = req.query;
    const usuariRef = db.collection('USUARIS');
    const snapshot = await usuariRef.where('usuari', '==', usuari).get();
    if (snapshot.empty){
        res.json({missatge:'Credencials incorrectes'});
    } else {
        snapshot.forEach(doc =>{
            res.json(doc.data())
        });
    }
});

app.post('/infoPerfil', async (req,res)=>{
    const body = {user:{usuari: req.body.usuari, password: req.body.password}, data: {nom: req.body.nom, email: req.body.email, telefon: req.body.email}}
    const doc = await db.collection('USUARIS').doc(req.body.user.usuari).get();
    if (doc.exists){
        res.json({missatge: "L'usuari ja existeix"})
    } else {
        await  db.collection('USUARIS').doc(req.body.usuari).set(data);
        res.json({missatge: "S'ha creat l'usuari"})
    }
})

