import express from 'express'
import nunjucks from 'nunjucks'

import { Wallet } from './wallet'
import axios from 'axios'

const app = express()

const userid = process.env.USERID || 'lsj'
const userpw = process.env.USERPW || '1234'
const baseURL = process.env.BASEURL || 'http://localhost:3000'

const baseAuth = Buffer.from(userid + ':' + userpw).toString('base64')

const request = axios.create({
    baseURL,
    headers : {
        Authorization : "Basic " + baseAuth,
        'Content-type' : 'application/json'
    }
})

app.use(express.json())
app.set('view engine', 'html')

nunjucks.configure('views', {
    express : app
})

app.get('/', (req, res) => {
    res.render('index.html')
})

app.post('/newWallet', (req, res) => {
    res.json(new Wallet())
})

app.post('/walletList', (req, res) => {
    // console.log('wallet list')
    const list = Wallet.getWalletList()
    res.json(list)
})

app.get('/wallet/:wallet', (req, res) => {
    const { wallet } = req.params
    // console.log(wallet)
    const privateKey = Wallet.getWalletPrivatekey(wallet)
    res.json(new Wallet(privateKey))
})

app.post('/sendTransaction', async (req, res) => {
    console.log(req.body + ' << this ')
    const { sender : {account, publicKey}, receiver, amount } = req.body

    const signature = Wallet.createSign(req.body)

    const txObject = {
        sender : publicKey,
        receiver,
        amount,
        signature
    }
    console.log(txObject)

    const response = await request.post('/sendTransaction', txObject)

    res.json({})
})

app.listen(3005, () => {
    console.log('server run', 3005)
})