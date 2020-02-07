/* eslint-disable no-console */
const {
  Account,
  AggregateTransaction,
  Deadline,
  Mosaic,
  MosaicId,
  MultisigAccountModificationTransaction,
  NetworkType,
  PlainMessage,
  TransactionHttp,
  TransferTransaction,
  UInt64
} = require('nem2-sdk')

/*
Alice
├─Bob
│  ├─Carol
│  └─Dave
└─Ellen
   ├─Frank
   └─Steve
     ├─Trent
     └─Dave
 */

const networkType = NetworkType.TEST_NET
const generationHash =
  '45870419226A7E51D61D94AD728231EDC6C9B3086EF9255A8421A4F26870456A'
const url = 'https://test-api.48gh23s.xyz:3001'
const initiator = Account.createFromPrivateKey(
  '25B3F54217340F7061D02676C4B928ADB4395EB70A2A52D2A11E2F4AE011B03E',
  networkType
)

// const alice = Account.createFromPrivateKey(
//   'F220F14DE5044A0C03E04767E10AE03128969708E49CAB42BC974D464EFA09C1',
//   networkType
// )
const alice = Account.generateNewAccount(networkType)
const bob = Account.generateNewAccount(networkType)
const carol = Account.generateNewAccount(networkType)
const dave = Account.generateNewAccount(networkType)
const ellen = Account.generateNewAccount(networkType)
const frank = Account.generateNewAccount(networkType)
const steve = Account.generateNewAccount(networkType)
const trent = Account.generateNewAccount(networkType)

const accounts = [alice, bob, carol, dave, ellen, frank, steve, trent]

const dummyTx = TransferTransaction.create(
  Deadline.create(),
  initiator.address,
  [new Mosaic(new MosaicId('51A99028058245A8'), UInt64.fromUint(0))],
  PlainMessage.create(''),
  networkType
)

const steveConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [trent, dave].map((co) => co.publicAccount),
  [],
  networkType
)
const ellenConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [frank, steve].map((co) => co.publicAccount),
  [],
  networkType
)
const bobConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [carol, dave].map((co) => co.publicAccount),
  [],
  networkType
)
const aliceConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [bob, ellen].map((co) => co.publicAccount),
  [],
  networkType
)
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [
    dummyTx.toAggregate(initiator.publicAccount),
    steveConvertTx.toAggregate(steve.publicAccount),
    ellenConvertTx.toAggregate(ellen.publicAccount),
    bobConvertTx.toAggregate(bob.publicAccount),
    aliceConvertTx.toAggregate(alice.publicAccount)
  ],
  networkType,
  [],
  UInt64.fromUint(200000)
)
const aggregateSignedTx = initiator.signTransactionWithCosignatories(
  aggregateTx,
  accounts,
  generationHash
)

const transactionHttp = new TransactionHttp(url)
transactionHttp
  .announce(aggregateSignedTx)
  .toPromise()
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 30000))
  })
  .then(() => {
    return transactionHttp
      .getTransactionStatus(aggregateSignedTx.hash)
      .toPromise()
  })
  .then((result) => {
    console.log(`hash: ${aggregateSignedTx.hash}`)
    console.log(`status: ${JSON.stringify(result)}`)
  })
  .catch((e) => {
    console.log(e)
  })

accounts.map((a, index) => {
  console.log(`account ${index + 1}`)
  console.log(`private: ${a.privateKey}`)
  console.log(`public : ${a.publicKey}`)
  console.log(`address: ${a.address.plain()}`)
})
