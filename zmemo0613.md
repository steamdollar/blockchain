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


2. websoccket을 이용한 다른 node와의 통신

