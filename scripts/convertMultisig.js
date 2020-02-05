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

const alice = Account.createFromPrivateKey(
  'F220F14DE5044A0C03E04767E10AE03128969708E49CAB42BC974D464EFA09C1',
  networkType
)
const bob = Account.generateNewAccount(networkType)
const carol = Account.generateNewAccount(networkType)
const dave = Account.generateNewAccount(networkType)
const ellen = Account.generateNewAccount(networkType)
const frank = Account.generateNewAccount(networkType)
const steve = Account.generateNewAccount(networkType)
const trent = Account.generateNewAccount(networkType)

const accounts = [alice, bob, carol, dave, ellen, frank, steve, trent]

const distributeTransfers = accounts.map((a) => {
  return TransferTransaction.create(
    Deadline.create(),
    a.address,
    [new Mosaic(new MosaicId('51A99028058245A8'), UInt64.fromUint(1000000))],
    PlainMessage.create(''),
    networkType
  )
})
const distributeTx = AggregateTransaction.createComplete(
  Deadline.create(),
  distributeTransfers.map((t) => {
    return t.toAggregate(initiator.publicAccount)
  }),
  networkType,
  [],
  UInt64.fromUint(200000)
)
const distributeSignedTx = initiator.sign(distributeTx, generationHash)

const steveConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [trent, dave].map((co) => co.publicAccount),
  [],
  networkType
)
const steveTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [steveConvertTx.toAggregate(steve.publicAccount)],
  networkType,
  [],
  UInt64.fromUint(200000)
)
const steveSignedTx = steve.signTransactionWithCosignatories(
  steveTx,
  [trent, dave],
  generationHash
)
const ellenConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [frank, steve].map((co) => co.publicAccount),
  [],
  networkType
)
const ellenTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ellenConvertTx.toAggregate(ellen.publicAccount)],
  networkType,
  [],
  UInt64.fromUint(200000)
)
const ellenSignedTx = ellen.signTransactionWithCosignatories(
  ellenTx,
  [frank, trent, dave],
  generationHash
)
const bobConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [carol, dave].map((co) => co.publicAccount),
  [],
  networkType
)
const bobTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [bobConvertTx.toAggregate(bob.publicAccount)],
  networkType,
  [],
  UInt64.fromUint(200000)
)
const bobSignedTx = bob.signTransactionWithCosignatories(
  bobTx,
  [carol, dave],
  generationHash
)
const aliceConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [bob, ellen].map((co) => co.publicAccount),
  [],
  networkType
)
const aliceTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [aliceConvertTx.toAggregate(alice.publicAccount)],
  networkType,
  [],
  UInt64.fromUint(200000)
)
const aliceSignedTx = alice.signTransactionWithCosignatories(
  aliceTx,
  [carol, dave, frank, trent],
  generationHash
)

const transactionHttp = new TransactionHttp(url)
transactionHttp
  .announce(distributeSignedTx)
  .toPromise()
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 20000))
  })
  .then(() => {
    console.log(`steve tx sending ${steveSignedTx.hash}`)
    return transactionHttp.announce(steveSignedTx).toPromise()
  })
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 20000))
  })
  .then(() => {
    return transactionHttp.getTransactionStatus(steveSignedTx.hash).toPromise()
  })
  .then(() => {
    console.log(`ellen tx sending ${ellenSignedTx.hash}`)
    return transactionHttp.announce(ellenSignedTx).toPromise()
  })
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 20000))
  })
  .then(() => {
    return transactionHttp.getTransactionStatus(ellenSignedTx.hash).toPromise()
  })
  .then(() => {
    console.log(`bob tx sending ${bobSignedTx.hash}`)
    return transactionHttp.announce(bobSignedTx).toPromise()
  })
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 20000))
  })
  .then(() => {
    return transactionHttp.getTransactionStatus(bobSignedTx.hash).toPromise()
  })
  .then(() => {
    console.log(`alice tx sending ${aliceSignedTx.hash}`)
    return transactionHttp.announce(aliceSignedTx).toPromise()
  })
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 20000))
  })
  .then(() => {
    return transactionHttp.getTransactionStatus(aliceSignedTx.hash).toPromise()
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
