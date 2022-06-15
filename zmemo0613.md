블럭 채굴 기능 구현

1. 유동적 블럭 난이도 구현

우선 블럭 채굴 난이도, nonce 값을 Block에 추가해줘야한다.

( genesis Block 에도 상수 추가)

이건 0610memo에 있으니 여기선 생략

블럭 체크 인터벌, 인터벌 만큼의 블럭 생성 시간 등의 상수를 미리 config.ts에 지정


src/core/config.ts

1.1 개발자가 지정해줄 상수들

export const DIFFICULTY_ADJUSTMENT_INTERVAL : number = 10

export const BLOCK_GENERATION_INTERVAL : number = 10
// timestamp 값의 차이를 넣어주면 된다. 10은 걍 아무거나 넣은거고..
// n 번 블럭 timestamp - (n-10)번 블럭 timestamp
// 이 값이 생각보다 크면 난이도 상승, vice versa 

// block 하나가 생성되는 시간 (이 값이 목표치임, 실제 걸리는 시간이 아니라)
// export const BLOCK_GENERATION_TIME : number = 60
export const UNIT : number = 60


1.2 새로 만든 블럭에 대해 기준이 될 블럭을 정하기

DIFFICULTY_ADJUSTMENT_INTERVAL (number) 의 값만큼의 간격으로 

난이도를 조정하는 함수를 만들어보자.

public getAdjustmentBlock() {
    const currentLength = this.getLength()
    // 새로운 블럭의 순서 (height) 을 가져온다.

    const adjustmentBlock : Block =
        currentLength < DIFFICULTY_ADJUSTMENT_INTERVAL
        // 현재 체인의 길이가 간격의 값보다 작다면
        ? Block.getGenesis()
        // genesis Block을 기준 블럭으로 지정
        : this.blockchain[ currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL + 1 ]
        // 체인의 길이가 간격보다 길다면 간격의 값만큼 전에 위치한 블럭을 기준 블럭으로 지정

    return adjustmentBlock
}

이 함수를 실제 블럭을 추가해줄 addBlock 함수에서 호출해야한다.

public addBlock( data : string[] ) : Failable < Block, string > {
    const previousBlock = this.getLatestBlock()
    const adjustmentBlock : Block = this.getAdjustmentBlock()
    // adjustmentBlock을 추가
    const newBlock = Block.generateBlock (previousBlock, data, adjustmentBlock)
    // 새 블럭의 난이도를 정하는데 필요한 adjustmentBlock 매개변수를 추가해준다.
    const isValid = Block.isValidNewBlock(newBlock, previousBlock)

    if ( isValid.isError == true ) {
        return { isError : true, error : isValid.error }
    }

    this.blockchain.push(newBlock)
    return { isError : false, value : newBlock }
}

adjustmentBlock을 Block.generateBlock()의 매개변수로 추가한 이상,

Block class에서도 동일한 매개 변수를 가지도록 추가해주어야 한다.

전역변수에도 바꿔주고, block.ts 에서도 속성을 각각 선언 해주어야한다.

public difficulty : number
public nonce : number

constructor( _previousBlock : Block, _data : string[], _adjustmentBlock : Block ) {
    super(_previosuBlock)

    this.data = _data
    const merkleRoot = Block.getMerkleRoot(_data)
    this.merkelRoot = merkleRoot
    this.nonce = 0
    this.difficulty = 0
    this.data _ data
}

class 내의 함수도 다음과 같이 매개변수 _adjustmentBlock을 추가해준다.

public static generateBlock ( _previousBlock : Block, _data : string[], _adjustmentBlock : Block) : Block {
    const generateBlock = new Block (_previousBlock, _data, _adjustmentBlock)
}


1.3 난이도 설정 함수

이제 새로 들여온 매개변수 _adjustmentBlock을 기반으로 난이도를 설정해보자.

public static getDifficulty( _newBlock : Block, -adjustment : Block, _previousBlock : Block ) {
    if( _adjustmentBlock.height === 0 ) return 0
    if (_newBlock.height % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0 ) return _previousBlock : Block

    const timeTake : number = _newBlock.timestamp - _adjustmentBlock.timestamp
    const timeExpected : number = UNIT * BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL

    if ( timeTaken < timeExpected / 2 ) return _adjustmentBlock.difficulty + 1
    elseif ( timeTaken >= timeExpected * 2 ) return _adjustmentBlock.difficulty - 1
    else return _adjustmentBLock.difficulty
}

이 함수의 리턴값을 this.difficulty에 넣어주면 난이도가 지정한 일정 주기로 함수를 기반으로 변하게 된다.

1.4 nonce 

전에 hash를 생성할 때는 난이도와 nonce 값을 제외한 값으로 hash를 생성했지만

이렇게 아무런 조건 없이 hash 값을 생성해 블럭을 만들 수 있게하면 무분별하게 너무 많은

블럭이 빠르게 생성된다는 문제점이 발생한다.

난이도 개념을 도입해 연산의 횟수를 증가시킴으로써 이를 해결 할 수 있는데,

이제부터 해시값은 `${version}${merkleRoot}${previousHash}${timestamp}${height}`

에 더해 `${difficulty}${nonce}` 를 넣어 생성할 것이다.

nonce를 0에서부터 시작해 값을 계속 바꿔가며 hash값을 생성해 조건에 만족하는지를 확인할텐데

이렇게 생성된 값이 조건을 만족할 경우 (난이도에 관련된) 

이를 유효한 해시값을 가진 블럭으로 인정하고 검증을 거쳐 체인에 추가한다.

//

1.5 조건을 만족하는 해시값 확인

그래서 생성된 해시값이 조건을 만족하는지 여부를 확인하는함수를 block class안에 추가해보자.

public static findBlock : (_generateBlock : Block )  : Block {
    let hash : string
    let nonce : number = 0
    // nonce 초기값을 0 으로 설정

    while(true) {
        nonce++
        // nonce 값을 1 증가시킴
        _generateBlock.nonce = nonce
        // 생성된 block의 값이 증가싴니 nonce값 대입
        hash = Block.createBlockhash(_generateBlock)
        // 바뀐 nonce값을 반영해 새로운 hash값 생성

        const binary : string = hexToBinary(hash)
        const result : Boolean = binarystartsWith('0'.repeat(_generateBlock.difficulty))
        // 생성된 hash값을 2진수로 바꿔 최초에 나오는 0의 갯수 카운트해 difficulty와 비교
        // 처음에 오는 0의 갯수가 충분히 많다면 (difficulty보다 그 수가 많다면 ) true
        // 그렇지 않다면 다시 nonce 값을 증가시키고 연산 반복

        if( result == true ) {
            _generateBlock.hash = hash
            return _generateBlock
        }
        // 조건을 만족해 result 값이 true라면 hash값을 새 블럭에 넣고, 생성된 블럭을 리턴
    }
}

이 함수가 generateBlock 내에서 실행되어야 새로 생성된 block의 hash값을 넣어줄 수 있다.

public static generateBlock(_previousBlock : Block, _data : string[], _adjustmentBlock : Block ) : Block {
    const generateVlock = new Block ( _previousBlock, _data, _adjustmentBlock)
    const newBlock = Block.findBlock(generate)
    return newBlock
}


2. websoccket을 이용한 다른 node와의 통신 (chk3)

이제 다른 node와 웹소켓을 ㅗㅌㅇ해 상호작용 하는 방법에 대해 알아보자.

블록체인 네트워크에서는 블록체인에 대한 정보를 노드간에 주고 받고 하면서 수시로

하나의 노드가 클라이언트인지, 서버인지가 바뀌는데 이 과정에 개입하는게 http, websocket이다.

루트 디렉토리에서 index.ts 파일을 생성해 express를 이용한 서버를 우선 구동해보자.

----------------------------
npm i express @types/express
----------------------------

/* index.ts  */

import express from 'express'

const app = express()
app.use(express.json())

app.get('/'(req,res) => {
    res.send('bitcoin is ponzi')
})

app.listen(3000, () => {
    console.log( 'server run 3000' )
})

서버 구동이 문제가 없다면 

우선 첫 번째로 로컬 영역에서 내가 만든 체인을 불러와 읽어보는 기능과

직접 채굴 해보는 기능을 실행해보자.


2.1 내 blockchain 가져와 읽기

우선 루트 디렉토리의 index.ts에서 import할 blockchain을 실제로 만들어줘야한다.

/*  src/core/index.ts  */

import { Chain } from './blockchain/chain'

export class Blockchain {
    public chain : Chain

    constructor () {
        this.chain = new Chain()
    }
}

// 새로 만든 BlockChain class는 전에 만든 Chain만을 속성으로 가진다.


이제 루트 디렉토리의 index.ts에서 blockchain을 import해줘야한다.

import { Blockchain } from './src/core/index'

const bc = new BlockChain()

app.get('/getChain', (req, res) => {
    res.json(bc.chain.getChain())
})


!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!! 여기서 존나 에러 터짐 씨발년아 !!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Error: Cannot find module '@core/config'

import할 때 좀 편하게 경로 잡을수 있도록 해주는 라이브러리 설치, 셋업을 안해서 이 사단이 났다.

npm i tsconfig-paths

설치하고

tsconfig.json에서  
"ts-node" : {
    "files": true,
    "require" : ["tsconfig-paths/register"]
}

이렇게 하니까 됨..

!!!!!!!!!!!!!!!!!!!

이제 블럭을 생성하는 것도 해보자.

2.2 블럭 생성

app.post("/mineBlock", (req, res) => {
    const { data } = req.body
    const newBlock = bc.chain.addBlock(data)
    if(newBlock.isError == true ) {
        return res.status(500).send(newBlock.error)
    }
    res.send('done')
})

2.3 웹 소켓 활용

npm i ws @types/ws

src/serve/p2p.ts

import { WebSocket } from 'ws'


export class P2PServer {
    listen () {
        const server = new WebSocket.Server( { port :7545 })
        server.on( 'connection', (socket) => {
            console.log( 'websocket connection')
        })
    }

    connectToPeer( newPeer : string ) {
        const socket = new WebSocket(newPeer)
    }
}

/*  index.ts  */

import { P2PServer } from './src/serve/p2p'

app.post('/addToPeer', (req, res) => {
    const { peer } = req.body
    ws.connectToPeer(peer)
})

// ...중략

ws.listen()

// 

이렇게 하고 addToPeer URI에 post로 요청을 보내보자.

req.body = { "peer":"ws://192.168.0.214:7545" }

요청을 전송하면 서버에서

ws.connectToPeer(peer) 함수가 발동하고

매개변수 peer (ws 어쩌구 ip주소) 를 매개변수로 새로운 WebSocket class가 생성된다.

//

p2p.ts로 돌아와 P2PServer class를 수정한다.

우선 sockets 속성을 추가하는데, 이 sockets는 WebSocket을 즉, 나와 현재 연결되어 있는 달느 노드들을

원소로 가지는 배열이다.

다른 노드와 내가 연결이 된다면

> connection 에 의해 발동하는 콜백함수가 실행된다.

> websocket connection이 출력되고, sockets 배열에 매개변수 socket이 (새로 연결된) 추가된다.

> 그 후, connectSocket 함수가 실행되는데,

이 connectSocket 함수도 아래에 추가해주어야 한다.

connectSocket( socket : WebSocket ) {
    //  this.soekcts.push(socket)
    socket.on('message', (data : string) => {
        console.log(Buffer.from(data).toString())
    })
    // 연결된 노드에서 메시지를 받을 경우 그 메시지를 해석해 출력한다.
    socket.send('bitcoin is ponzi')
    // 연결된 노드에 메시지를 보낸다.
}

이 과정은 나와 상대방에게서 동시에 일어나는 일이기 때문에 연결된느 순간 서로가 서로에게
메시지를 주고 받는다.

반대로 내가 상대방에게 연결하고 싶다면, 

addToPeer URI에 post method로 요청을 보낸다.

이때, body에 peer의 정보를 입력해 보내고,

서버는 이를 매개변수로 삼아 connectToPeer 함수를 실행한다. (p2p.ts)

그러면 newPeer를 매개 변수로 갖는 WebSocket 객체가 생성되고,

socket이 open될때 발동하는 콜백함수로 connectSocket 함수가 실행된다.

//

이제 여기서 우리가 지금까지 한 일 =  블럭체인을 만드는 것을 조합해보면 된다.

서로 다른 두 노드가 연결되었을 때,

우선 각자의 블럭체인 길이가 어떤지에 따라 진행하는 일이 달라질 것이다.

a)서로의 블록 체인 길이가 차이가 없을 경우 특별히 다른 일이 일어나진 않을 것이고,

b)체인의 길이가 하나 차이가 날 경우, 체인 길이가 짧은 쪽이 긴 쪽에게 가장 최근의 블럭의

정보를 요청해 검증을 거친 후, 자신의 체인에 추가해 블럭을 최신화 할 것이고,

c) 체인의 길이차이가 더 클 경우, 전체 체인 데이터를 요구해 (혹은 충분히 긴 길이를 가진 체인의 최근 몇 개 블럭)

이를 순차적으로 자신의 체인에 추가할 것이다.

우선 Chain을 P2PServer 클래스에 가져온다.

import { Chain } from '@core/blockchain/chain'

export class P2PServer extends Chain // 이 줄을 수정하고

super() < 를 constructor 함수에 추가

각각의 경우에 따라 코드를 실행하기 용이하기 위해 리액트때 dispatch를 사용한 것처럼

타입과 페이로드를 가진 메시지, 메시지타입 class를 생성해 활용할 것이다.

P2PServer에 Chain 속성을 가져온다.

enum MessageType {
    latest_Block : 0
}

interface Message {
    type : MessageType
    payload : any
}

a,b,c 각각의 경우에 대해 Messagetype에서 다른 속성값을 정하고,

(지금은 latest_block : 0 뿐이지만 계속 추가될 것이다)

이를 Message로 전당해줌으로써 각 경우에 따른 실행 코드를 정할 것이다.

//

이제 클라이언트로부터 메시지를 잡았을 때 이를 우선 읽어야 체인 길이를 비교하는 등의 작업을 할 수 있으므로

connectSocket 함수안의 'message' 수신시 발동하는 콜백 함수를 본격적으로 작성해주어야 한다.

socket.on('message', (data : string) => {
    const message : Message = P2PServer.dataParse<Message>(data)
    // 데이터는 우선 JSON으로 바꾸는 작업이 선행되어야 한다.
    // 이를 실행할 함수 dataparse는 connectSocket 함수 바깥에 작성해준다.
})

static dataParse<T> (_data : string) : T{
    return JSON.parse(Buffer.from(_data).toString())
}

노드간 주고받는 data라는 매개변수 자체가 Message class임을 가정하고 있으므로

이를 객체로 다시 만들면 이 또한 Message class에 속하는 객체일 것이다.

이 객체의 type 속성값을 읽어 이에 따라 다른 코드를 실행하기 위해 다음과 같이 switch-case문을 작성할 것이다.

우선 최신 블럭을 요청하는 코드를 작성해보자.

switch (message.type) {
    case MessageType.latest_block :
        console.log(message)
        break
}
const Block : IBlock = message.payload
console.log(Block)

const data : Message = {
    type : MessageType.latest_block,
    payload : this.getLatestBlock()
}

이렇게 메시지를 만들어 상대방에게 전송한다.
( 가장 최근 블럭을 요청하는 코드 )

socket.send(JSON.stringify(data))
// data를 객체로 만들어 상대방 node에게 전송한다.
const send = this.send(socket)
send(data)
// 여기서 변수 send는 '우리가 만든' socket, data를 매개변수로 갖는 고차함수이다.

send 함수의 구체적 내용은 다음과 같다.

send(_socket : WebSocket ) {
    return (_data : Message) => {
        _socket.send(JSON.stringify(_data))
    }
}

보기엔 좀 헷갈리짐나 결국 상대방 node (socket)으로 내가 만든 data를 보내겠다는 말이다.

코드 실행 순서에 주의해야하는데,

내가 선언한 변수 data : Message는 connectSocket 함수 실행시 바로 실행되는 코드이고,

switch case문을 포함한 코드문은 상대방으로부터 메시지를 받은 시점에서 실행된다.

즉 data를 지정된 socket으로 보내는 함수가 먼저 실행된다.

그 후, 상대방 소켓 쪽에서 응답을 주면 그 때 메시지 수신을 트리거로 발동하는 콜백함수가 발동한다.

//

