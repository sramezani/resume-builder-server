var express = require('express');
var router = express.Router();

const puppeteer = require('puppeteer');
const { v1: uuidv1 } = require('uuid');

const fs = require('fs');
var path= require('path')

const MongoClient = require('mongodb').MongoClient

const env = require('../.env.js');

MongoClient.connect(env.connectionString, { useUnifiedTopology: true })
.then(client => {
    const db = client.db('wtf-resume')
    const quotesCollection = db.collection('pdf')

    
    router.get('/', (req, res, next) => {
        db.collection('pdf').find({ pdfId: req.query.data }).toArray()
        .then(results => {
            res.send(results[0])
        })
        .catch(error => console.error(error))
    })
    
    router.post('/', (req, res, next) => {
        const uuid = uuidv1();
        const pdfId = { pdfId: uuid };
        const data = {...pdfId, ...req.body}
        quotesCollection.insertOne(data)
          .then(result => {
            console.log(result)
          })
          .catch(error => console.error(error))
        
          const generatePDF = async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`http://localhost:3000/preview?export=true&data=${uuid}`, {
                waitUntil: 'networkidle2',
              });
            await page.emulateMedia('screen');
            await page.content()
            const pdf = await page.pdf({
                // path: `./pdf/${uuid}.pdf`,
                printBackground: true,
                format: 'A4',
                width: '210mm',
                height: '297mm',
            });
            await browser.close();
            
            res.contentType("application/pdf");
            res.send(pdf);
        }
        // const file = `${__dirname}/pdf/${uuid}.pdf`;
        generatePDF();
    })
})
.catch(error => console.error(error))

module.exports = router;