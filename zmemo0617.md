이렇게 만든 지갑은 블록체인 네트워크와 상호작용을 해야한다.

이해하기 쉽도록 리액트와 백앤드 서버로 대체해서 생각을 해보자.

리액트에서 뭔가 데이털르 넣어 제출하면 이를 백엔드로 보낸다.

그럼 백엔드에서는 쿼리문에 받은 데이터를 매개변수로 넣어 DB에 삽입하는 등의 행동을 실행했다.

비슷하게

지갑에서 데이터를 배열에 담아 블록체인에 전달하면 (여기서 데이터는 보통 tx에 관한 데이터)

블록체인은 그 tx 데이터를 넣는다.

이 과정에서 잠시 처리되지 않은 tx들 보관하는 다른 것들이 관여하긴 하지만 기본적인 메커니즘은 이렇다.

//

우리가 지금까지 Block, Chain, BlockChain, P2PServer 등을 구동한 express 서버와는 별개로,

지갑이 사용할 네트워크 서버를 하나 더 구축해 (포트 번호를 다르게 해서) 상호작용을 시켜볼 예정인데,

포트 번호가 다르기 때문에 나타나는 CORS 에러를 방지하기 위해

루트디렉토리의 index.ts에서 authorization에 관한 미들웨어를 추가해줄 것이다.

/*  index.ts  */

app.use((req,res,next) => {
    const baseAuth : string = (req.headers.authorization || '').split(' ')[1]
    if(baseAuth === '') {
        return res.status(401).send()
    }
    // 사용자 정보가 없다면 에러를 응답으로 준다

    const [userid, userpw] = Buffer.from(baseAuth, 'base64').toString().split(':')
    // uri에 담긴 정보는 버퍼 형태로 전달되므로 이를 디코딩 해준다.
    if(userid !== 'lsj' || userpw !== '1234') {
        return res.status(401).send()
    }
    // 사용자 정보가 있짐나 맞지 않다면 에러를 응답으로 준다
    console.log(userid, userpw)
    next()
    // 사용자 정보가 맞다면 다음 미들웨어 실행
})

http와 host 사이에 사용자의 정보를 넣어주는 것을 basic 이라 하는데,

uri에 로그인 기능을 넣었다고 생각하면 된다.

내 아이디와 비밀번호가 lsj, 1234이고, http 통신으로 localhost에 접속하고 싶다면

http://lsj:1234@localhost:3000 이라고 적어주면 된다.

//

이를 이용해 지갑을 만들어보자.

루트 디렉토리에 wallet 폴더를 만들고 server.ts 파일을 생성한다.

npm i nunjucks
npm i --save-dev @types/nunjucks

/*  wallet/server.ts  */

import express from 'express'
import nunjucks from 'nunjucks'

const app = express()

app.use(express.json())
app.set('view engine', 'html')

nunjucks.configure('views', {
    express : app,
    watch : true
})

app.get('/', (req, res) => {
    // res.render('index.html') < 나중에 이걸로 수정
    res.send('hello wallet')
})

app.listen(3005, () => {
    console.log('server run', 3005)
})

이 server.ts 파일을 실행하려면

npm run dev:ts wallet/server

를 터미널에 입력하면 된다.

hello wallet 잘 나오면 이제 wallet.ts 파일을 생성해

좀 전에 키를 생성한 코드를 비슷한 방식으로 작성해주면 된다.

wallet/wallet.ts

Wallet class 객체를 생성해준다.

코드는 ts 파일에 있으므로 생략

이걸 server.ts에서 가져온다.


/*  views/index.html  */

head에는 axios script 넣어주고

<body>
    <h1>Wallet practice</h1>

    <button id='Wallet_btn'>지갑 생성</button>

    <script type='text/javascript'>
        const walletBtn = document.querySelector('#Wallet_btn')

        const createWallet = async () => {
            const response = await axios.post('/newWallet', null)
            console.log(response.data)
        }

        walletBtn.addEventListener('click', createWallet)
    </script>
</body>

/*  wallet/server.ts  */

app.post('/newWallet', (req, res) => {
    res.json(new Wallet())
})

버튼을 누르면 이 uri로 요청을 보내고, 새로운 wallet을 생성해 돌려준다.

콘솔에 지갑 정보가 찍혀나오면 성공

// 여기서 부터는 6/20일 수업 내용

생성된 지갑을 파일로 남겨 싶다면 fs, path 라이브러리를 활용할 수 있따.

/*  src/core/blockchain/wallet/wallet.ts  */

루트 디렉토리에 data 폴더를 생성해준다.

import fs from 'fs'
import path from 'path'

const dir = path.join(__dirname, '../data')
// 만들어진 파일의 경로를 방금 만든 data 폴더로 지정

생성자함수에 createWallet 함수를 선언한다.

public createWallet( myWallet : Wallet ) {

    const filename = path.join(dir, myWallet.account)
    // 파일명은 account, 내용은 privateKey
    const filecontent = myWallet.privateKey
    fs.writeFileSync(filename, filecontent)
    // 인자 2개는 순서대로 파일 디렉토리, 파일 데이터 
    // 파일 데이터를 해당하는 이름을 가진 파일에 넣어준다.
}

버튼을 클릭했을 때, data 폴더에 파일이 새로 생성되면 된다.

/////////////////

이제 지갑 목록을 가져오는 기능을 만들어보자.

wallet class 객체에 getWalletList 함수를 만든다.

static getWalletList () : string[] {
    const files : string[] = fs.readdirSync(dir)
    // dir 내의 파일을 전부 배열에 담가 가져온다.
    return files
}

지정해준 uri에 요청을 보내면 이 getWalletList 함수가 실행되어

현재 data 안에 있는 지갑의 주소들을 보내줄 것이다.

/*  wallet/server.ts  */

app.post('/walletList', (req, res) => {
    // console.log('wallet list')
    const list = Wallet.getWalletList()
    res.json(list)
})

/*  views/index.html  */

    <h1>wallet list</h1>
    <button id="wallet_list_btn">지갑 목록 버튼</button>
    <div class="wallet_list2">
        <ul>

        </ul>
    </div>

// ...중략

    const getWalletList = async() => {
        const walletList = document.querySelector('.wallet_list2 > ul')
        const response = await axios.post('/walletList', null)

        const list = response.data.map((wallet) => {
            return `<li>${wallet}</li>`
        })
    
        walletList.innerHTML = list
    }

    walletListBtn.addEventListener('click', getWalletList)

//

다음으로 리스트에서 지갑을 선택하면 그 지갑에 대한 정보들을 가져오는 함수를 추가한다.

어차피 개인키만 있으면 나머지는 전부 개인키를 이용해 만들 수 있으므로

개인키만 매개변수로 추가하면 된다.

constructor에 _privateKey를 매개변수에 추가

방금 li element를 만들어줬으므로 이 eleemnt에 클릭시 발동하는 함수 getView() 를 추가할 것이다.

`<li onClick="getView('${account}')">${account}</li>`

/*  views/index.html  */

const getView = async (wallet) => {
    const response = await axios.get(`/wallet/${wallet}`)
    console.log(response.data)
    view(response.data)
}

const view = (wallet) => {
    const account = document.querySelector('.account')
    const publicKey = document.querySelector('.publicKey')
    const privateKey = document.querySelector('.privateKey')
    const balance = document.querySelector('.balance')

    account.innerHTML = wallet.account
    publicKey.innerHTML = wallet.publicKey
    privateKey.innerHTML = wallet.privateKey
    balance.innerHTML = wallet.balance
}

이제 다시 server.ts 에 지갑 정보를 응답으로 보내줄 라우터를 만든다.

/*  server.ts  */

app.get('/wallet/:wallet', (req, res) => {
    const { wallet } = req.params
    console.log(wallet)
    const privateKey = Wallet.getWalletPrivateKey(wallet)
    res.json(new Wallet(privateKey))
})

개인키를 가져오는 함수를 wallet class 객체 안에 추가

그런데 이 때, 개인키를 주고 지갑을 만들 constructor 함수를 실행할 경우,

매개변수로 준 개인키가 우선적으로 사용되어 Wallet class 객체를 만들어져야 한다.

따라서 constructor 함수에 다음과 같이 매개변수를 추가한다.

constructor(_privateKey : string='') {
    // 디폴트 값으로 아무것도 없는 값을 주고 있으면 있는 값을 대입
    this.privateKey = _privateKey || this.getPrivateKey()
    // 매개변수의 값이 있으면 그걸 쓰고, 아니면 개인키 생성함수를 실행
}



////////////////////////////// 여기서 한 번 끊는다
// 여기부턴 tx에 관한 내용



이제 본격적으로 tx에 관한 내용을 만들어보자.

tx에는 돈을 받을 계정의 주소와 보낼 금액에 대한 정보가 필요하다.

우선 html에 이 내용을 추가해주는 것부터 시작하자.

/*  views/index.html  */

    <h1> TX 정보 </h1>

    <form id="transaction_form">
        <ul>
            <li>
                receiver : <input id="receiver" placeholder="받을 사람"/>
            </li>
            <li>
                amount : <input id="amount" placeholder="보낼 금액"/>
            </li>
        </ul>
        <input type="submit"/>
    </form>

다음으로 이 폼을 제출할때 발동하는 submitHandler를 추가해준다.

const transactionForm = document.querySelecotr('#transaction_form')

const submitHandler = async (e) => {
    e.preventDefault()

    const publicKey = document.querySelector('.publicKey').innerHTML
    const account = document.querySelector('.account').innerHTML

    const data = {
        sender : {
            publicKey,
            account
        },
        receiver : e.target.receiver.value,
        amount : parseInt(e.target.amount.value)
    }
    const response = await axios.post('/sendTransaction', data)
}

transactionForm.addEventListener('submit', submitHandler)

//

전송 버튼을 누르면 sender의 공개키, 계좌, receiver의 계좌, 전송할 양을 담아 요청을 보낸다.

!! 이 요청은 지갑을 거쳐 > 블록체인 네트워크로 간다.

따라서 wallet의 server.ts, 루트 디렉토리의 index.ts에서 차례로 요청을 받을 라우터를 만들어줘야 한다.

이 과정에서 서명이 필요하다.

서명 (signature)은 보낸 사람이 정말 그 사람이 맞는지

그냥 보내는 사람 지갑 주소(공개된)만 입력해서 전송을 하면

그게 그 지갑 주인(개인키를 소유한)이 보내는건지, 아니면 그 지갑 주소만 아는 사람이 그냥

지갑 주소만 외워써서 보내는건지를 판별할 수가 없기 때문이다.

우선 블록체인 서버와 지갑 서버간 상호작용을 좀 더 편하게 하기 위해 axios의 method를 활용해보자.


const userid = procedd.env.USERID || 'lsj'
const userpw = process.env.USERPW || '1234'
const baseURL = process.env.BASEURL || 'http://localhost:3000'

const baseAuth = Buffer.from (userid + ':' + userpw).toString('base64')

const request = axios.create({
    baseURL,
    headers : {
        Authorization : 'Basic ' + baseAuth, // Basic 쓰고 한칸 띄워야 함
        'Content-type' : 'application/json'
    }
})

// Basic 과 URI를 설정해 주면 request


/*  wallet/server.ts  */

app.post('./sendTransaction', async (req, res) => {
    console.log(req.body)
    const { sender : {account, publicKey}, receiver, amount } = req.body

    const signature = Wallet.createSign(req.body)
})

//

> 우선 html 에서 버튼 클릭 > 지갑 네트워크로 요청이 간다.

>  여기서 req.body를 쪼개서 서명을 만들고 그걸 포함한 tx객체를 만든다

> 블록체인 네트워크에 보낸다.

> 빈 배열을 돌려준다 (아직 미구현)

여기서 실행될 createSign 함수는 다음과 같이 Wallet class 객체에 추가하면 된다.

    static createSign ( _obj : any) {
        const { sender : {account, publicKey}, receiver, amount} = _obj

        const hash : string = SHA256([publicKey, receiver, amount].join('')).toString()

        const privateKey : string = Wallet.getWalletPrivatekey(account)

        const keyPair : elliptic.ec.KeyPair = ec.keyFromPrivate(privateKey)
        return keyPair.sign(hash, 'hex')
    }

이 함수를 sendTransaction uri에서 실행한 결과값을 블록체인 네트워크로 전송한다.

app.post('/sendTransaction', async (req, res) => {

    //...중략
    const signature = Wallet.createSign(req.body)

    const txObject = {
        sender : publicKey,
        receiver,
        amount,
        signature
    }

    const response = await request.post('/sendTransaction', txObjext)
    // 호스트나 포트를 이미 위에서 지정해 request 변수에 담았기 때문에 경로만 쓰면
    // 미리 설정해둔 호스트, 포트의 지정 경로로 보내준다.


})

한 편 블록체인 네트워크에서도 받은 객체를 인식해 적절한 처리를 거칠 수 있도록

src/core/wallet 에 wallet.ts 파일을 생성하고

wallet class 객체를 만들어줘야 한다.

src/core/wallet/wallet.ts

import { SHA256 } from 'crypto-js'
import elliptic from 'elliptic'

const ec = new elliptic.ec('secp256k1')

export type Signature = elliptic.ec.Signature

export interface ReceivedTx {
    sender : string
    receiver : string
    amount : number
    signature : Signature
}

export class Wallet {
    public publicKey : string
    public account : string
    public balance : number
    public signature : Signature

    constructor( _sender : string, _signature : Signature) {
        
        this.publicKey = _sender
        // sender의 값 자체가 보낸 사람의 공개 키
        this.account = this.getAccount()
        // 이를 이용해 직바 주소를 구한다.
        this.balance = 0
        // balance에 대한 부분은 추후 추가 구현
        this.signature = _signature
    }

    getAccount() : string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }
    
    // 정말 지갑 주소의 원래 주인이 맞는지 서명을 검증한다

    static sendTransaction ( _receivedTx : ReceivedTx ) {
        const verify = Wallet.getVerify(_receivedTx)
        
        if( verify.isError ) throw new Error (verify.error)

        const myWallet = new this(_receivedTx.sender, _receivedTx.signature)
    }

    static getVerify ( _receivedTx : ReceivedTx) : Failable<undefined, string> {
        const { sender, receiver, amount, signature } = _receivedTx
        
        const data : any[] = [sender, receiver, amount]
        const hash : string = SHA256(data.join('')).toString()

        const keyPair = ec.keyFromPublic(sender, 'hex')
        const isVerify = keyPair.verify(hash, signature)

        if( isVerify === false) {
            return { isError : true, error : '서명이 올바르지 않습니다' }
        } 
        
        return { isError : false, value : undefined}
    }
}


//

/*  index.ts  */

import axios from 'axios'

import { Wallet, ReceivedTx } from '@core/wallet/wallet'

app.post('/sendTransaction', (req, res) => {
    try {
        const receivedTx : ReceivedTx = req.body
        Wallet.sendTransaction(receivedTx)
        // 검증 과정에 문제가 없다면 
    }
    catch (e) {
        if ( e instanceof Error ) console.error(e.message)
        // 검증 과정에서 에러가 있다면 catch문으로 빠져 에러 출력
    }
    res.json([])
})


// 잘 되는지 확인

