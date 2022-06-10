1. typscript

javascript랑 비슷한데, 타입을 잘 정해줘 좀더 strict한 문법을 들고 코드를 짤 수 있게 해주는 언어라고 보면 되겠다.

일단 첫 번째로 ts 파일을 하나 만들고, 그걸 js로 변환하는 가장 간단한 작업 먼저 해보자.

우선 몇 가지 라이브러리를 설치해준다.

npm i -D typescript

1. typescript : typescript

npm i -g ts-node

2. ts-node : nodejs 실행시 node 앞에 쓰는 것처럼 ts-node 쓰면 ts 파일을 바로 실행해준다.

e.g. ts-node index.ts 치면 실행됨.

npm i -g @types/node

3. @types/<라이브러리> 를 설치하면 해당 라이브러리를 ts에서 바로 사용할 수 있다.

어느 정도 알려진 라이브러리는 이걸로 편리하게 사용 가능.

/! index.ts !/

const str: string = "hello typescript";
console.log(str);

JS와 다른 점을 찾아보자면 변수를 선언할 때, 옆에 데이터 타입을 같이 지정해주는 것을 확인할 수 있다.

이제 이걸 실행해보려고 하면 에러가 뜰거다.

이는 ts는 따로 런타임이 없기 때문에 그렇다.

이 ts 파일을 실행하려면 react에서 webpack으로 jsx를 알아먹게 js로 변형한것처럼

변환해주는 작업이 필요하다.

방금 만든 index.ts를 변환하려면 터미널에 다음과 같이 입력한다.

npx tsc index.ts

좀 기다리면 새로운 js 파일이 나타나는 것을 알 수 있다.

///////////

이제 프로젝트의 루트 디렉토리에 tsconfig.json 파일을 만들고

변환에 대한 설정을 해준다.

여긴 어떤 ts 파일을 변환할건지, 변환된 파일은 어따 생성할 것인지 등에 대한 정보를 담는다.

/*  tsconfig.json  */

{
  "compilerOptions": {
    "outDir": "./dist/", // 파일 생성 위치
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "baseUrl": ".",
    "typeRoots": ["./node_modules/@types", "./@types"],
    "paths": {
      "@core/*": ["src/core/*"],
      "*": ["@types/*"]
    }
  }
}

대충 이렇게 적고 npx tsc --build 하면 이 파일을 읽고 맞춰서 js 파일을 새로 만들어준다.

이 중, baseUrl, paths 가 import를 좀 더 편하게 해주도록 프로젝트 루트 디렉토리를 절대경로로 지정해주는 일을 할 수 있다.

-------------------

근데 이러면

ts를 조금 수정 하고 > 이걸 다시 js로 컴파일하는데 시간을 너무 오래 사용하게 된다.

그래서 수정한 ts 파일을 바로 테스트 할 수 있게 해주는 툴을 사용할 것이다.

jest 라는 라이브러리로, npm을 이용해 설치할 수 있다.

npm i -D ts-jest @types/jest
npm i -D babel-core @babel/preset-typescript @babel/preset-env

babel은 일단 신경쓰지 말고, 루트 디렉토리에 jest.config.ts 파일을 생성한다.

/*  jest.config.ts  */

import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['<rootDir>/**/*.test.(js|ts)'],
    moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/src/core/$1',
    },
    testEnvironment: 'node',
    verbose: true,
    preset: 'ts-jest',
}

export default config

대충 테스트 실행해볼 확장자명, 경로를 제한해준다고 생각하면 된다.

예를 들어 여기서 testMatch를 보면 루트 디렉토리에서 .test.js 혹은 .test.ts 확장자를 가진

파일만을 테스트해본다는 것을 알 수 있다.

src 폴더 안에 example.test.ts 파일을 만들고 다음과 같이 작성해보자.

/*  src/example.test.ts  */

describe('let me test this test code', () => {
    it('1 is 1', () => {
        expect(1).toEqual(1)
    })
})

이 코드를 테스트하기 위해 터미널에

npx jest를 입력해보자.

좀 기다리면 코드에 문제가 없다면 pass, 그렇지 않다면 fail을 결과물로 줄 것이다.

toEqual의 인자를 2로 바꾸면 틀렸다는 결과를 출력해준다.


-------------------------------

이제 외부 라이브러리를 사용하는 방법을 알아보자.

16진수를 2진수로 바꿔주는 작업이 필요하다고 하자.

이를 위해서 우선 숫자를 넣으면 이를 16진수인 hash로 바꿔주는 crypto-js 라이브러리,

16진수를 2진수로 바꿔주는 hex-to-binary 라이브러리가 필요하다.

우선 이 둘을 터미널에서 설치해주자.

npm i hex-to-binary crypto-js


설치한 라이브러리를 사용하기 위해 src 폴더 하위에 ex_lib 폴더를 만들고,

index.ts 파일을 다음과 같이 작성한다.


/*  src/ex_lib/index.ts  */

import SHA256 from 'crypto-js/sha256'

const a : string = '10'

const hash:string = SHA256(a).toString()
console.log(hash)

const binary = hexToBinary(hash)
console.log(binary)


이를 실행하면 모듈을 찾을 수 없다고 나온다.

이는 방금 npm으로 설치한 라이브러리 둘이 ts에서는 구동되지 않기 때문에 발생하는 문제이다.

일부 라이브러리들은 typescript 전용으로도 만들어져 있어 설치하고 바로 사용할 수도 있지만,

그렇지 않은 라이브러리들도 많기 때문에 이를 ts에서 사용하는 방법도 알아두어야 한다.

우선 crypto-js 라이브러리는 ts에서 사용할 수 있도록 따로 나온게 있어서 다음과 같이 설치해주면 된다.

npm i --save-dev @types/crypto-js

하지만 hex-to-binary는 ts 전용으로 나온게 없어 다른 작업을 통해 이를 사용할 수 있게 해주어야 한다.

루트 디렉토리에 @types 폴더를 만들고 hex-to-binary.d.ts 파일을 생성한다.

다음과 같이 전역 라이브러리를 전역 설정해주면 js에서와 마찬가지로 라이브러리를 import해 사용할 수 있다.


/*  @types/hex-to-binary.d.ts  */

declare module "hex-to-binary"


이제 index.ts를 실행하면 다음과 같은 결과를 얻을 수 있다.

4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5 // 10을 해시화한 결과값

0100101001000100110111000001010100110110010000100000010010101000000011111110100000001110100100000011100101000101010111001100000101100000100000101000000110000010000011111110001010110010010011110001111001010010001100111010110111100110101011110001110111010101

// 10을 해시화한 결과값을 2진수로 바꾼 것


----------------------------------

지금까지 배운 것들을 이용해 ts에서 블럭을 생성하는 법을 알아보자.

아니 그에 앞서 ts에서 class 문법으로 객체를 생성하는 법에 대해 알아보자.

ts에서 하나의 객체 class를 생성할때는

interface 명령어를 이용해 이 객체가 어떤 key들을 가질 지, 그 key의 value의 데이터 타입은 어떤지를

미리 지정해준다.

/*  src/ex_class/interface.ts  */

interface IBoard {
  name: string
  phone : number
  army : boolean
  address : string
}
// 여기서 ':' 오른쪽에 있는 건 value가 아니라 data type을 지정해 준것임에 주의한다.

const data : IBoard {
  name : 'lsj',
  phone : 12345678,
  army: true,
  address : 'seoul'
}

이렇게 data라는 변수를 그 데이터 타입을 IBoard로 선언하면,

위해서 interface 명령어를 이용해 지정한 class의 key, data type을 모두 동일하게

만족해야만 에러가 발생하지 않는다.

//

다음으로 군집형 변수를 디테일하게 선언하는 방법에 대해 알아보자.

우리가 배열을 선언할 때, 데이터 타입에 array를 줄 수도 있지만 이보다는

그 배열의 element가 어떤 데이터 타입인지에 더 관심을 가지는 경우가 많다.

이런 경우 element의 data type을 먼저 지정 후, 그 뒤에 [] 를 붙여주면된다.

예를 들어

let a : number[] = [1,2,3,4]

라고 선언해주면

a는 number들을 원소로 갖는 배열이다라는 것을 의미한다.

//

함수의 경우, 매개 변수와 결과값의 데이터 타입을 각각 설정해주어야 한다.

예를 들어 0이라면 false, 그렇지 않은 경우 true를 return해주는 함수 binaryCode가 있다고 하자.

이 함수는 매개 변수는 number, 리턴 값은 boolean의 데이터 타입을 가지는데,

이 둘을 각각 설정해주어야 에러가 나지 않는다.

-----------------------------------

이제 지금까지 배운 것들을 활용해 블럭체인의 블럭을 하나 만들어보자.

npm i --save-dev @types/merkle

지난 번에 만든 블럭에 있었던 key들을 바탕으로 다시 한 번 블럭 class를 선언해준다면

다음과 같을 것이다.

declare interface IBlock {
  version: string
  height: number
  timestamp :number
  previousHash : string
  merkleRoot : string
  hash : string
  data : string[]
}

이 중 version, height, timestamp, previousHash는 따로 묶어서 BLockHeader로 빼줄 수가 있다.

declare interface IBlockHeader {
  version:string
  height: number
  timestamp : number
  previousHash : string
}

남은 값은 그대로 IBlock에 놔두되, IBlockHeader의 값을 그대로 상속받을 것이므로

다음과 같이 extends IBlockHeader를 추가한다.

declare interface IBlock extends IBlockHeader {
  merkleRoot : string
  hash: string
  data : string[]
}

이 두 class의 포맷을 어디에서나 끌어올 수 있도록 @types에 Block.d.ts 에 넣는다.

/*  @types/Block.d.ts  */

declare interface IBlockHeader {
  version : string
  height : number
  timestamp : number
  previousHash : string
}

declare interface IBlock extends IBlockHeader {
  merkleRoot : string
  hash : string
  data : string[]
}

///////////

이제 src 폴더 하위에 core 폴더를 만들고 그 안에 다시 blockchain 폴더를 만든 후 거기

blockHeader.ts 파일을 생성한다.

여기서 방금 만들어준 IBlock, IBlockHeader 를 바탕으로 블록을 만들기 시작할 것이다.

/*  src/core/blockchain/blockHeader.ts  */

export class BlockHeader implements IBlockHeader {
    public version : string
    public height : number
    public timestamp : number
    public previousHash : string

    constructor(_previousBlock : IBlock) {
        this.version = BlockHeader.getVersion()
        this.timestamp = BlockHeader.getTimeStamp()
        this.height = _previousBlock.height + 1
        this.previousHash = _previousBlock.hash
    }

    public static getVersion() {
        return '1.0.0'
    }

    public static getTimeStamp() {
        return new Date().getTime()
    }
}

마찬가지로 동일한 경로에 block.ts 파일을 생성해 Block class를 작성해주는데,

이 Block은 방금 작성한 BlockHeader의 key들을 상속받으며, IBlock의 key들을 그대로 가져온다.

이를 코드로 표현하면 다음과 같다.

/*  src/core/blockchain/block.ts  */

export class Block extends BlockHeader implements IBlock {
  public hash : string
  public merkleRoot : string
  public data : string[]

  constructor(_previousBlock : Block) {
    this.hash = ''
    this.merkleRoot = ''
    this.data= []
  }
}

//

이제 마지막으로 block.test.ts 파일을 만들어 지금까지 만들어준 Block class format에 맞게

제네시스 블럭을 만들어주자.

모든 블럭은 그 전 블럭과 연결되는 값을 가지므로 변수를 일반화하는 것이 가능하지만,

예외적으로 그 전 블럭이 없는 제네시스 블럭만은 우리가 초기값을 설정해주어야 한다.

/*  src/core/blockchain/block.test.ts  */

import { Block } from '@core/blockchain/block'

describe('Block 검증', () => {
    let genesisBlock : Block = {
        version: '1.0.0',
        height : 0,
        hash : '0'.repeat(64),
        timestamp : 1231006596,
        previousHash : '0'.repeat(64),
        merkleRoot : '0'.repeat(64),
        data : ['genesis block']
    }
    it('블록 생성', () => {
        const data = ['Block #2']
        const newBlock = new Block(genesisBlock)
        newBlock.data = [...data]
        console.log(newBlock)
    })
})

genesis 블록에서 초기값을 지정해주고, 이를 매개 변수로 가져 일부 값을 받아오는 

두번째 블럭을 만들어준다.

npx jest로 테스트 해보면 새로 만든 두 번째 블럭 (newBlock)이 출력되는 것을 확인할 수 있다.
