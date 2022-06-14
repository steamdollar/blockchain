import { Chain } from "./blockchain/chain";

export class BlockChain {
    public chain : Chain

    constructor() {
        this.chain = new Chain()
    }
}