import express from 'express'
import nunjucks from 'nunjucks'

import { Wallet } from './wallet'

const app = express()

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

app.listen(3005, () => {
    console.log('server run', 3005)
})