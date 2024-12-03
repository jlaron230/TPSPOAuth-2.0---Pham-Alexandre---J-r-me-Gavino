// install nodejs
//npm init
// $ npm install body-parser

// install express
const express = require('express')
// install le corps body
const bodyParser = require('body-parser')
const port = "3000"

// create express app
const app = express()

// Créer une route pour la page d'accueil
app.get('/', (req, res) => {
    res.send('Hello, World!');
  });


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
