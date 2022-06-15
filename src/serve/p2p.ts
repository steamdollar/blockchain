import { WebSocket } from 'ws'
import { Chain } from '@core/blockchain/chain'

enum MessageType {
    latest_block = 0
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

    connectSocket( socket : WebSocket) {
        this.sockets.push(socket)

        socket.on('message', (data : string ) => {
            console.log(Buffer.from(data).toString())

            const message : Message = P2PServer.dataParse<Message>(data)

            switch (message.type) {
                case MessageType.latest_block :
                    console.log(message)
                    break
            }
            const Block : IBlock = message.payload
            console.log(Block)
        })

        const data : Message = {
            type : MessageType.latest_block,
            payload : this.getLatestBlock()
        }
        // socket.send('bitcoin is ponzi')
        // 이건 상대방이 내게 연결할 때 실행 
        socket.send(JSON.stringify(data))

        const send =this.send(socket)
        // 이건 내가 상대방에게 연결할 때
        send(data)
    }

    send( _socket : WebSocket ) {
        return (_data : Message) => {
            _socket.send(JSON.stringify(_data))
        }
    }

    static dataParse<T>(_data : string) : T {
        return JSON.parse(Buffer.from(_data).toString())
    }
}