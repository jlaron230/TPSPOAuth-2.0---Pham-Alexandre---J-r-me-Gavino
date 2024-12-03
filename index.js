// install nodejs
//npm init
// $ npm install body-parser

// install express
const express = require('express')
// install le corps body
const bodyParser = require('body-parser')
const port = process.env.PORT || "5500"

// create express app
const app = express()

const items = [{
    id : 1,
    name : "item1",
    description : "desc"
},
{
    id : 2,
    name : "item2",
    description : "desc"
},
]

app.use(bodyParser.json())

//crée
app.get('/item', (req, res) => {
  res.json(items)

})

app.get('/item/:id', (req, res) => {
    const id = Number(req.params.id)
    const item = items.find(item => item.id === id)

    if (!item){
        return res.status(404).send('item non trouvée')
    }
    res.json(item)
  
  })

//lecture
app.post('/item/:id', (req, res) => {
const newItem = {
    id : items.length + 1,
    name : req.body.name,
    description : req.body.description
}

items.push(newItem)
res.status(201).json(newItem)

})
//Update
app.put('/item', (req, res)=> {
    res.json(items.join("6","8"))
})

app.put('/item/:id', (req, res)=> {
    const id = Number(req.params.id)
    const index = items.findIndex(item => item.id === id)

    if (index === -1) {
        return res.status(404).send('item non trouvée')
    }

    const UpdateItem = {
        id : items[index].id,
        name : req.body.name,
        description : req.body.description
    }

    items[id] = UpdateItem
    res.status(200).json(items)
})

//supp
app.delete('/item', (req, res) => {
    res.json(items.pop())
})

app.delete('/item/:id', (req, res) => {
const id = Number(req.params.id)
const index = items.findIndex(item => item.id === id)

if (index === -1) {
    return res.status(404).send('item non trouvée')
}

items.splice(index,1)
res.status(200).json('item supprimer')

})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
