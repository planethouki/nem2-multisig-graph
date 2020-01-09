<template>
  <div>
    <nav class="navbar navbar-light bg-light justify-content-between">
      <span class="navbar-brand">nem2 multisig graph</span>
      <form class="form-inline">
        <input
          v-model="inputAccount"
          type="search"
          class="form-control mr-sm-2"
          aria-label="Search"
          placeholder="Address, PublicKey"
        />
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!ready"
          @click="clickHandler"
        >
          Search
        </button>
      </form>
    </nav>
    <div class="container-fluid">
      <div id="chart_div" ref="chart_div"></div>
    </div>
    <div class="container">
      <div v-if="errorMessage" class="alert alert-warning my-5" role="alert">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
/* global google */
import ScrollBooster from 'scrollbooster'
import template from '~/assets/multisigAccountTemplate.ejs'
import convert from '~/assets/nem2-library/convert.js'
import base32 from '~/assets/nem2-library/base32.js'

export default {
  components: {},
  data() {
    return {
      graph: [],
      inputAccount: 'TCQPNIWEPQLTXDCDNWQ4UO7HZKQSPTZNWKZSFTE7',
      ready: false,
      errorMessage: '',
      scrollBooster: null,
      selectedElementIndex: null
    }
  },
  computed: {
    accountData() {
      const accounts = []
      // 小さいレベルから開始
      const rootLevel = this.graph[0].level
      for (const root of this.graph[0].multisigEntries) {
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
        root.multisig.cosignatoryPublicKeys.map((cosignatoryPublicKey) => {
          findChildRecursive(
            cosignatoryPublicKey,
            rootLevel + 1,
            rootKey,
            accounts,
            this.graph
          )
        })
      }
      return accounts
    }
  },
  mounted() {
    google.charts.load('current', { packages: ['orgchart'] })
    google.charts.setOnLoadCallback(() => {
      this.ready = true
    })
  },
  methods: {
    clickHandler() {
      this.errorMessage = ''
      this.graph = []
      // this.clearScrollBooster()
      const account = this.inputAccount.replace(/-/g, '').replace(/^0x/, '')
      this.getGraph(account)
        .then((graph) => {
          const level0GraphIndex = graph.findIndex((g) => g.level === 0)
          graph[level0GraphIndex].multisigEntries[0].multisig.isSelf = true
          this.graph = graph
        })
        .catch((e) => {
          this.errorMessage = e.message
        })
        .finally(() => {
          this.$nextTick(() => {
            const chartData = generateChatData(this.accountData)
            const chartElement = this.$refs.chart_div
            this.drawGraph(chartData, chartElement)
            // this.updateScrollBooster()
          })
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
      const url = `https://test-api.48gh23s.xyz:3001/account/${account}/multisig/graph`
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

function generateChatData(accountData) {
  console.log(accountData)
  return accountData.map((account) => {
    return [
      {
        v: account.key,
        f: template({ account })
      },
      account.parent,
      null
    ]
  })
}

function findChildRecursive(
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
  const multisigEntry = levelGraph.multisigEntries.find(
    (multisigEntry) => multisigEntry.multisig.accountPublicKey === publicKey
  )
  if (multisigEntry === undefined) {
    // 公開鍵からエントリーが見つからなかった場合は公開鍵だけを登録
    accumulator.push({
      level,
      key: accountKey,
      parent: parentKey,
      accountPublicKey: publicKey
    })
    return
  }
  accumulator.push({
    level,
    key: accountKey,
    parent: parentKey,
    ...addEncodedAddress(multisigEntry.multisig)
  })
  multisigEntry.multisig.cosignatoryPublicKeys.map((cosignatoryPublicKey) => {
    findChildRecursive(
      cosignatoryPublicKey,
      level + 1,
      accountKey,
      accumulator,
      originalGraph
    )
  })
}
</script>
