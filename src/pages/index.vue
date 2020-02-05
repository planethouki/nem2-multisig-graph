<template>
  <div>
    <nav class="navbar navbar-light bg-light">
      <span class="navbar-brand text-dark">
        nem2 multisig graph
      </span>
      <div class="form-inline">
        <input
          v-model="inputAccount"
          type="text"
          class="form-control mr-sm-2"
          aria-label="Search"
          placeholder="Address, PublicKey"
        />
        <button
          type="button"
          class="btn btn-primary text-dark"
          :disabled="!ready"
          @click="clickHandler"
        >
          Search
        </button>
      </div>
    </nav>
    <div v-if="!tried" class="jumbotron bg-white">
      <h1 class="display-4">Multisig Graph</h1>
      <p class="lead">
        マルチシグの構成を図で表します。
      </p>
      <hr class="my-4" />
      <button
        class="btn btn-primary btn-lg"
        type="button"
        :disabled="!ready"
        @click="tryAnyway"
      >
        Try Anyway
      </button>
    </div>
    <div class="container-fluid">
      <div id="chart_div" ref="chart_div"></div>
      <div v-if="errorMessage" class="alert alert-warning my-5" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="!tried"></div>
      <div v-else-if="selectedElementIndex === null">
        <ul class="list-group list-group-dl">
          <li class="list-group-item">
            <span class="title">PublicKey</span>
            <span class="text">-</span>
          </li>
          <li class="list-group-item">
            <span class="title">Address</span>
            <span class="text">-</span>
          </li>
          <li class="list-group-item">
            <span class="title">Min Removal</span>
            <span class="text">-</span>
          </li>
          <li class="list-group-item">
            <span class="title">Min Approval</span>
            <span class="text">-</span>
          </li>
          <li class="list-group-item">
            <span class="title">Cosignatory PublicKey</span>
            <span class="text">-</span>
          </li>
          <li class="list-group-item">
            <span class="title">Multisig PublicKey</span>
            <span class="text">-</span>
          </li>
        </ul>
      </div>
      <div v-else>
        <ul class="list-group list-group-dl">
          <li class="list-group-item">
            <span class="title">PublicKey</span>
            <span class="text">
              {{ accountData[selectedElementIndex].accountPublicKey }}
            </span>
          </li>
          <li class="list-group-item">
            <span class="title">Address</span>
            <span class="text">
              {{ accountData[selectedElementIndex].accountAddressPlain }}
            </span>
          </li>
          <li class="list-group-item">
            <span class="title">Min Removal</span>
            <span class="text">
              {{ accountData[selectedElementIndex].minRemoval }}
            </span>
          </li>
          <li class="list-group-item">
            <span class="title">Min Approval</span>
            <span class="text">
              {{ accountData[selectedElementIndex].minApproval }}
            </span>
          </li>
          <li class="list-group-item">
            <span class="title">Cosignatory PublicKey</span>
            <span class="text">
              <template
                v-if="
                  accountData[selectedElementIndex].cosignatoryPublicKeys.length
                "
              >
                <span
                  v-for="p in accountData[selectedElementIndex]
                    .cosignatoryPublicKeys"
                  :key="p"
                  class="d-block"
                >
                  {{ p }}
                </span>
              </template>
              <template v-else>
                -
              </template>
            </span>
          </li>
          <li class="list-group-item">
            <span class="title">Multisig PublicKey</span>
            <span class="text">
              <template
                v-if="
                  accountData[selectedElementIndex].multisigPublicKeys.length
                "
              >
                <span
                  v-for="p in accountData[selectedElementIndex]
                    .multisigPublicKeys"
                  :key="p"
                  class="d-block"
                >
                  {{ p }}
                </span>
              </template>
              <template v-else>
                -
              </template>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="navbar navbar-light bg-light">
      <a
        href="https://github.com/planethouki/nem2-multisig-graph"
        target="_blank"
        rel="noreferrer"
      >
        <img src="~/assets/GitHub-Mark-Light-32px.png" />
      </a>
    </div>
  </div>
</template>

<script>
/* global google */
import ScrollBooster from 'scrollbooster'
import axios from 'axios'
import template from '~/assets/multisigAccountTemplate.ejs'
import convert from '~/assets/nem2-library/convert.js'
import base32 from '~/assets/nem2-library/base32.js'

export default {
  components: {},
  data() {
    return {
      accountData: [],
      inputAccount: '',
      ready: false,
      errorMessage: '',
      scrollBooster: null,
      selectedElementIndex: null,
      tried: false
    }
  },
  mounted() {
    google.charts.load('current', { packages: ['orgchart'] })
    google.charts.setOnLoadCallback(() => {
      this.ready = true
    })
  },
  methods: {
    tryAnyway() {
      this.inputAccount = 'TDOGRYNLJ4LFJAECPX62NW6SKZITP2KCHQIXBXBJ'
      this.$nextTick(() => {
        this.clickHandler()
      })
    },
    clickHandler() {
      this.errorMessage = ''
      this.selectedElementIndex = null
      this.accountData = []
      this.clearScrollBooster()
      const account = this.inputAccount.replace(/-/g, '').replace(/^0x/, '')
      let selfPublicKey
      return this.getGraph(account)
        .then((graph) => {
          const level0GraphIndex = graph.findIndex((g) => g.level === 0)
          selfPublicKey =
            graph[level0GraphIndex].multisigEntries[0].multisig.accountPublicKey
          return generateAccountData(graph)
        })
        .then((accountData) => {
          this.accountData = accountData
        })
        .catch((e) => {
          this.errorMessage = e.message
        })
        .finally(() => {
          const chartData = generateChatData(this.accountData, selfPublicKey)
          const chartElement = this.$refs.chart_div
          this.drawGraph(chartData, chartElement)
          this.updateScrollBooster()
          this.tried = true
        })
    },
    drawGraph(chartData, chartElement) {
      const chartOptions = {
        allowHtml: true,
        nodeClass: 'myNodeClass',
        selectedNodeClass: 'mySelectedNodeClass'
      }
      const data = new google.visualization.DataTable()
      data.addColumn('string', 'Account')
      data.addColumn('string', 'ParentAccount')
      data.addColumn('string', 'ToolTip')
      data.addRows(chartData)
      const chart = new google.visualization.OrgChart(chartElement)
      chart.draw(data, chartOptions)
      google.visualization.events.addListener(chart, 'select', () => {
        if (chart.getSelection().length > 0) {
          this.selectedElementIndex = chart.getSelection()[0].row
        } else {
          this.selectedElementIndex = null
        }
      })
    },
    getGraph(account) {
      // TADB6HFQDX7R5YBY5FNVWXAICG7I23A2JNIPOIX6
      // TCQPNIWEPQLTXDCDNWQ4UO7HZKQSPTZNWKZSFTE7
      // 0659175E1E9AB0F768EC796E6ED0954EEBC6AD3681BAE5211BE3FFA4DB4DC546
      // 2716AF99DA032C5EC5374973780A2371E9402459475AD665DA74DBD7EC641A5C
      // F3F282AC74FDECFB2C397D29D9A4C2CF938F228299B8B79E7521271B5A06F74D
      // 32DBF3536FBFDD65E862734EE56EAD919AB966F61061699BB0C601052DE4A900
      // TDZ54ZWJNXHFEDUAB2NNGAAFVCO4TA36N2KKUN4E
      const url = `${process.env.REST}/account/${account}/multisig/graph`
      return this.$axios.$get(url)
    },
    clearScrollBooster() {
      if (this.scrollBooster === null) return
      this.scrollBooster.destroy()
    },
    updateScrollBooster() {
      const viewport = this.$refs.chart_div
      const content = viewport.querySelector(
        '.google-visualization-orgchart-table'
      )
      this.scrollBooster = new ScrollBooster({
        viewport,
        content,
        mode: 'x',
        onUpdate: (data) => {
          viewport.scrollLeft = data.position.x
        }
      })
    }
  }
}

function addEncodedAddress(multisig) {
  multisig.accountAddressPlain = multisig.accountAddress
    ? base32.encode(convert.hexToUint8(multisig.accountAddress))
    : null
  return multisig
}

function generateChatData(accountData, selfPublicKey) {
  return accountData.map((account) => {
    return [
      {
        v: account.key,
        f: template({ account, selfPublicKey })
      },
      account.parent,
      null
    ]
  })
}

async function generateAccountData(graph) {
  if (graph.length === 0) return []
  const accounts = []
  // 小さいレベルから開始
  const rootLevel = graph[0].level
  for (const root of graph[0].multisigEntries) {
    const rootKey =
      Math.random()
        .toString(32)
        .substring(2) +
      '-' +
      root.multisig.accountPublicKey
    accounts.push({
      level: rootLevel,
      key: rootKey,
      parent: null,
      ...addEncodedAddress(root.multisig)
    })
    for (const cosignatoryPublicKey of root.multisig.cosignatoryPublicKeys) {
      await findChildRecursive(
        cosignatoryPublicKey,
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
  publicKey,
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
  const accountKey =
    Math.random()
      .toString(32)
      .substring(2) +
    '-' +
    publicKey
  let multisigEntry = levelGraph.multisigEntries.find(
    (multisigEntry) => multisigEntry.multisig.accountPublicKey === publicKey
  )
  if (multisigEntry === undefined) {
    // 公開鍵からエントリーが見つからなかった場合は新規取得
    const url = `${process.env.REST}/account/${publicKey}/multisig`
    const multisigRes = await axios.get(url)
    multisigEntry = multisigRes.data
  }
  accumulator.push({
    level,
    key: accountKey,
    parent: parentKey,
    ...addEncodedAddress(multisigEntry.multisig)
  })
  for (const cosignatoryPublicKey of multisigEntry.multisig
    .cosignatoryPublicKeys) {
    await findChildRecursive(
      cosignatoryPublicKey,
      level + 1,
      accountKey,
      accumulator,
      originalGraph
    )
  }
}
</script>
