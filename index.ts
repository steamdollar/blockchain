import { BlockChain } from './src/core/index'
import { P2PServer } from './src/serve/p2p'
import express from 'express'

const nunjucks = require('nunjucks')


const app = express()
const bc = new BlockChain()
const ws = new P2PServer()

app.use(express.json())

app.set('view engine','html')
nunjucks.configure('views', {
  express:app,
  watch:true
})

app.get('/', (req, res) => {
    res.send('bitcoin is ponzi')
})

app.get('/getChain', (req, res) => {
    const result = bc.chain.getChain()
    // console.log(result)
    // res.json(bc.chain.getChain())
    res.render('getchain.html', {
        result : result
    })
})

app.post("/mineBlock", (req, res) => {
    const { data } = req.body
    const newBlock = bc.chain.addBlock(data)
    if(newBlock.isError == true ) {
        return res.status(500).send(newBlock.error)
    }
    res.send(newBlock.value)
})
//

app.post('/addToPeer', (req, res) => {
    const { peer } = req.body
    ws.connectToPeer(peer)
})

app.listen(3000, () => {
    console.log('server run 3000')
    ws.listen()
})

