import axios from 'axios'
import { Convert, RawAddress } from 'symbol-sdk'
import template from '~/assets/multisigAccountTemplate.ejs'

function hexAddressToPlain(hex) {
  return RawAddress.addressToString(Convert.hexToUint8(hex))
}

/**
 * accountAddressPlainを付加
 * @param {object} multisig
 * @param {string} multisig.accountAddress
 * @return {{accountAddress}|*}
 */
function addEncodedAddress(multisig) {
  multisig.accountAddressPlain = multisig.accountAddress
    ? hexAddressToPlain(multisig.accountAddress)
    : null
  return multisig
}

async function generateAccountData(graph) {
  if (graph.length === 0) return []
  const accounts = []
  // 小さいレベルから開始
  const rootLevel = graph[0].level
  for (const root of graph[0].multisigEntries) {
    const rootKey =
      Math.random().toString(32).substring(2) +
      '-' +
      root.multisig.accountAddress
    accounts.push({
      level: rootLevel,
      key: rootKey,
      parent: null,
      ...addEncodedAddress(root.multisig),
    })
    for (const cosignatoryAddress of root.multisig.cosignatoryAddresses) {
      await findChildRecursive(
        cosignatoryAddress,
        rootLevel + 1,
        rootKey,
        accounts,
        graph
      )
    }
  }
  return accounts
}

async function findChildRecursive(
  address,
  level,
  parentKey,
  accumulator,
  originalGraph
) {
  const levelGraph = originalGraph.find((g) => g.level === level)
  if (levelGraph === undefined) {
    // レベルが見つからなかった場合はなにもしない
    return
  }
  const accountKey = Math.random().toString(32).substring(2) + '-' + address
  let multisigEntry = levelGraph.multisigEntries.find(
    (multisigEntry) => multisigEntry.multisig.accountAddress === address
  )
  if (multisigEntry === undefined) {
    // アドレスからエントリーが見つからなかった場合は新規取得
    const multisigRes = await getGraph(address)
    multisigEntry = multisigRes.data
  }
  accumulator.push({
    level,
    key: accountKey,
    parent: parentKey,
    ...addEncodedAddress(multisigEntry.multisig),
  })
  for (const cosignatoryAddress of multisigEntry.multisig
    .cosignatoryAddresses) {
    await findChildRecursive(
      cosignatoryAddress,
      level + 1,
      accountKey,
      accumulator,
      originalGraph
    )
  }
}

function getSelfAddressPlain(graph) {
  const level0GraphIndex = graph.findIndex((g) => g.level === 0)
  return graph[level0GraphIndex].multisigEntries[0].multisig.accountAddress
}

function generateChartData(accountData, selfAccount) {
  return accountData.map((account) => {
    return [
      {
        v: account.key,
        f: template({ account, selfAccount }),
      },
      account.parent,
      null,
    ]
  })
}

function getGraph(account) {
  const url = `${process.env.REST}/account/${account}/multisig/graph`
  return axios.get(url).then((res) => res.data)
}

export default (context, inject) => {
  inject('graphUtil', {
    generateAccountData,
    getSelfAddressPlain,
    generateChartData,
    getGraph,
    hexAddressToPlain,
  })
}
