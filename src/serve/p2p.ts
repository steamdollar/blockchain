import { WebSocket } from 'ws'

export class P2PServer {

    public sockets : WebSocket[]

    constructor() {
        this.sockets=[]
    }

    listen () {
        const server = new WebSocket.Server( { port :7545 })
        server.on( 'connection', (socket) => {
            console.log( 'websocket connection')
            this.sockets.push(socket)
        })
    }

    connectToPeer( newPeer : string ) {
        const socket = new WebSocket(newPeer)
    }
}