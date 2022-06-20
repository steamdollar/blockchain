0616

wallet, tx 에 대해 알아보자..

tx도 암호화가 있다.

누가 누구에게 얼마를 주는지..

1. 일단 sender가 얼마를 들고 있는지 알아야 함.

2. 정말 sender가 그 sender가 맞는지 확인해야 함.

오티피, 비밀번호 같은거라도 보면 된다..


- 지갑 생성

지갑은 누가 만드나? 내가 만든다.

지갑 문자열 조합이 매우 많아서 겹칠일은 없다고 봐도 되기 때문에

근야 내가 난수 생성으로 만들면 된다. (인터넷 끄고도 만들 수 있음)

8비트 = 2 니블

지갑은 256비트. 해시가 64자리였던 것 처럼 지갑도 마찬가지.

- 개인키

지갑의 용도는 이 개인키를 안전하게 보관하는 것이다.

비밀번호 = 개인키

개인키를 기반으로 공개키를 생성한다.

다시 공개키를 통해 계좌를 만든다.

계정과 공개키는 오픈되어있다. 계정은 공개키에서 앞 12자리만 빼서 만들어준다.

해보자.

//

core/wallet/wallet.test.ts  생성

npm i crypto
npm i --save-dev @types/crypto

npm i elliptic
npm i --save-dev elliptic

elliptic < 타원 곡선 그거 가져와서 암호화 해주는거

이를 통해 메소드 한 두개로 개인키, 공개키, 계좌를 어렵지 않게 생성할 수 있다.

privKey = randomBytes(32).toString('hex')
// c50f2744a35be1e56306d3bcdb3f24efafe8fb664cc616e386cd1ebad1ca133d

64자리 16진수가 나온다.

얘를 가지고 공개 키를 만들어보자.

const keyPair = ec.keyFromPrivate(privKey)
// privKey를 암호화 알고리즘에 투입

pubKey = KeyPair.getPublic().encode('hex', true)
console.log(pubKey)
// 생성한 문자열 KeyPair를 이용해 공개 키 생성

이제 다시 이걸 이용해 서명을 만든다.

it('digital sign', () => {
    const keyPair = ec.keyFromPrivate(privKey)
    const hash = SHA256('txhash').toString()
    // 서명을 하는 쪽에서  'txhash' 라는 문자열을 암호화에 넣는다. (이하 hash 생성값)
    // 이와 동일한 값을 가지고 서명이 진짜인지 아닌지 판별 가능
    signature = keyPair.sign(hash, 'hex')
    // 내가 만든 hash값과 keyPair를 조합해 서명을 만든다.
    // hash를 만든데 사용한 문자열과 keyPair를 상대방(검증자)에게 주면
    // 검증자는 나와 동일한 연산을 수행해 내가 준 서명과 동일한지 확인
    // 동일하다면 서명자가 키 소유자와 동일 인물임이 증명, vice versa
})

// 서명 검증

it('sig verify', () => {
    const hash = 'txhash'
    // 검증자의 입장에서 전달받은 hash 생성값, 공개키를 가지고
    // 함께 전달받은 서명을 검증한다.
    const verify = ec.verify(hash, signature, ec.keyFromPublic(pubKey, 'hex'))
    // verify method를 이용해 서명을 만든다.
})
// 이 서명의 검증은 블록 체인 안에 있어야 한다.

