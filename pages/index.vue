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

export default {
  components: {},
  data() {
    return {
      graph: [],
      inputAccount: '',
      ready: false,
      errorMessage: '',
      scrollBooster: null,
      selectedElement: null
    }
  },
  computed: {
    chartData() {
      return this.graph
        .map((level) => {
          return level.multisigEntries
            .map((entry) => {
              if (entry.multisig.multisigPublicKeys.length === 0) {
                return [
                  [
                    {
                      v: entry.multisig.accountPublicKey,
                      f: template({ entry, level: level.level })
                    },
                    '',
                    entry.multisig.accountAddress
                  ]
                ]
              }
              return entry.multisig.multisigPublicKeys.map(
                (multisigPublicKey) => {
                  return [
                    {
                      v: entry.multisig.accountPublicKey,
                      f: template({ entry, level: level.level })
                    },
                    multisigPublicKey,
                    entry.multisig.accountAddress
                  ]
                }
              )
            })
            .flat()
        })
        .flat()
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
          this.graph = graph
        })
        .catch((e) => {
          this.errorMessage = e.message
        })
        .finally(() => {
          this.$nextTick(() => {
            const chartData = this.chartData
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
          this.selectedElement = chartData[chart.getSelection()[0].row]
        } else {
          this.selectedElement = null
        }
      })
    },
    getGraph(account) {
      // TADB6HFQDX7R5YBY5FNVWXAICG7I23A2JNIPOIX6
      // TCQPNIWEPQLTXDCDNWQ4UO7HZKQSPTZNWKZSFTE7
      // 0659175E1E9AB0F768EC796E6ED0954EEBC6AD3681BAE5211BE3FFA4DB4DC546
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
</script>
