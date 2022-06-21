import { BlockChain } from './src/core/index'
import { P2PServer } from './src/serve/p2p'
import express from 'express'
import axios from 'axios'

import { Wallet, ReceivedTx } from '@core/wallet/wallet' 

const nunjucks = require('nunjucks')

const app = express()
const bc = new BlockChain()
const ws = new P2PServer()

app.use(express.json())

app.use((req,res,next) => {
    const baseAuth : string = (req.headers.authorization || '').split(' ')[1]
    if(baseAuth === '') {
        return res.status(401).send()
    }

    const [userid, userpw] = Buffer.from(baseAuth, 'base64').toString().split(':')
    if(userid !== 'lsj' || userpw !== '1234') {
        return res.status(401).send()
    }
    console.log(userid, userpw)
    next()
})

app.set('view engine','html')
nunjucks.configure('views', {
  express:app,
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

app.post('/sendTransaction', (req, res) => {
    try {
        const receivedTx : ReceivedTx = req.body
        Wallet.sendTransaction(receivedTx)
    }
    catch (e) {
        if ( e instanceof Error ) console.error(e.message)
    }
    res.json([])
})

app.listen(3000, () => {
    console.log('server run 3000')
    ws.listen()
})

