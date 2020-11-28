/* eslint-disable no-console */
const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '.env'),
})
const {
  Account,
  AggregateTransaction,
  Deadline,
  Mosaic,
  MosaicId,
  MultisigAccountModificationTransaction,
  NetworkType,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} = require('symbol-sdk')

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
const generationHash = process.env.GENERATION_HASH
const mosaicId = process.env.MOSAIC_ID

const nodeList = process.env.NODE_LIST_CSV.split(',')

const url = nodeList[0]
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  networkType
)

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
  [new Mosaic(new MosaicId(mosaicId), UInt64.fromUint(0))],
  PlainMessage.create(''),
  networkType
)

const steveConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [trent, dave].map((co) => co.address),
  [],
  networkType
)
const ellenConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [frank, steve].map((co) => co.address),
  [],
  networkType
)
const bobConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [carol, dave].map((co) => co.address),
  [],
  networkType
)
const aliceConvertTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  2,
  2,
  [bob, ellen].map((co) => co.address),
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
    aliceConvertTx.toAggregate(alice.publicAccount),
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

const repositoryFactory = new RepositoryFactoryHttp(url)
const transactionHttp = repositoryFactory.createTransactionRepository()
const transactionStatusHttp = repositoryFactory.createTransactionStatusRepository()

transactionHttp
  .announce(aggregateSignedTx)
  .toPromise()
  .then(() => {
    return new Promise((resolve) => setTimeout(resolve, 30000))
  })
  .then(() => {
    return transactionStatusHttp
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
