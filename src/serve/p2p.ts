import { WebSocket } from 'ws'
import { Chain } from '@core/blockchain/chain'

enum MessageType {
    latest_block = 0,
    all_block = 1,
    receivedChain = 2
}

interface Message {
    type : MessageType
    payload : any
}

export class P2PServer extends Chain {

    public sockets : WebSocket[]

    constructor() {
        super()
        this.sockets=[]
    }

    getSockets() {
        return this.sockets
    }

    listen () {
        const server = new WebSocket.Server( { port :7545 })
        server.on( 'connection', (socket) => {
            console.log( 'websocket connection')
            this.connectSocket(socket)
        })
        // 이건 상대방이 나에게 연결될 때,
    }

    connectToPeer( newPeer : string ) {
        const socket = new WebSocket(newPeer)
        socket.on('open', ()=> {
            this.connectSocket(socket)
        })
        // 이건 내가 상대방에게 연결할때 각각 실행된다.
    }

    connectSocket( socket : WebSocket ) {
        this.sockets.push(socket)

        this.messageHandler(socket)

        const data : Message = {
            type : MessageType.latest_block,
            payload : {}
        }
        this.send(socket)(data)
    }

    messageHandler ( socket : WebSocket ) {
        const callback = (data : string) => {
            const result : Message = P2PServer.dataParse<Message>(data)
            const send = this.send(socket)

            switch(result.type) {
                case MessageType.latest_block : {
                    const message : Message = {
                        type : 1,
                        payload : [this.getLatestBlock()]
                        // 자신의 최신 블럭을 payload에 담아줌
                    }
                    send(message)
                    break
                }
                case MessageType.all_block : {
                    const message : Message = {
                        type : MessageType.receivedChain,
                        payload : this.getChain()
                    }

                    const [ receivedBlock ] = result.payload
                    const isValid = this.addToChain(receivedBlock)

                    if(!isValid.isError ) break
                    // 에러가 없다면 여기서 종료
                    send(message)
                    // 에러가 있다면 다음 케이스 코드를 실행할 message.type을 담아 다시 메시지 전송
                    break
                }
                
                case MessageType.receivedChain : {
                    const receivedChain : IBlock [] = result.payload
                    // Block 내부의 함수는 필요 없이 블럭 내용만 알고 싶으므로 IBlock 형탤르 가져온다.
                    this.handleChainResponse(receivedChain)
                    
                    break
                }
            }
        }
        socket.on('message', callback)
    }

    handleChainResponse (_receivedChain:IBlock[]) : Failable <Message | undefined, string> {
        const isValidChain = this.isValidChain(_receivedChain)
        // 전달받은 체인을 검증
        if(isValidChain.isError) {
            return { isError : true, error : isValidChain.error}
        }
        // isValidChain 함수에서 에러가 있을 경우 에러를 리턴
        
        const isValid = this.replaceChain(_receivedChain)
        // 받은 체인에 에러가 없을 경우, 내 체인을 상대방 체인으로 교체 (최신화)
        if( isValid.isError) {
            return { isError : true, error : isValid.error }
        }

        const message : Message = {
            type : MessageType.receivedChain,
            payload : _receivedChain
        }
        // replaceChain 함수에서 에러가 날 경우 에러 리턴
        this.broadCast(message)
        return { isError : false, value : undefined}
    }

    send( _socket : WebSocket ) {
        return (_data : Message) => {
            _socket.send(JSON.stringify(_data))
        }
    }

    public broadCast(message : Message) : void {
        this.sockets.forEach((socket) => this.send(socket)(message))
    }

    static dataParse<T>(_data : string) : T {
        return JSON.parse(Buffer.from(_data).toString())
    }
}