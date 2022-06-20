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

//

이제 지갑 생성을 완료했으니, 지갑들간의 tx를 구현해보자.

