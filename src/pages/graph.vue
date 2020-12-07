<template>
  <div class="container-fluid">
    <div id="chart_div" ref="chart_div"></div>
    <div v-if="errorMessage" class="alert alert-warning my-5" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="!tried"></div>
    <div v-else-if="selectedElementIndex === null">
      <ul class="list-group list-group-dl">
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
          <span class="title">Cosignatory Address</span>
          <span class="text">-</span>
        </li>
        <li class="list-group-item">
          <span class="title">Multisig Address</span>
          <span class="text">-</span>
        </li>
      </ul>
    </div>
    <div v-else>
      <ul class="list-group list-group-dl">
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
          <span class="title">Cosignatory Address</span>
          <span class="text">
            <template
              v-if="
                accountData[selectedElementIndex].cosignatoryAddresses.length
              "
            >
              <span
                v-for="p in accountData[selectedElementIndex]
                  .cosignatoryAddresses"
                :key="p"
                class="d-block"
              >
                {{ $graphUtil.hexAddressToPlain(p) }}
              </span>
            </template>
            <template v-else> - </template>
          </span>
        </li>
        <li class="list-group-item">
          <span class="title">Multisig Address</span>
          <span class="text">
            <template
              v-if="
                accountData[selectedElementIndex].cosignatoryAddresses.length
              "
            >
              <span
                v-for="p in accountData[selectedElementIndex]
                  .cosignatoryAddresses"
                :key="p"
                class="d-block"
              >
                {{ $graphUtil.hexAddressToPlain(p) }}
              </span>
            </template>
            <template v-else> - </template>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
/* global google */
import ScrollBooster from 'scrollbooster'

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
      tried: false,
    }
  },
  watch: {
    $route(to) {
      this.inputAccount = this.$route.query.account
      this.clickHandler()
    },
  },
  mounted() {
    this.inputAccount = this.$route.query.account
    google.charts.load('current', { packages: ['orgchart'] })
    google.charts.setOnLoadCallback(() => {
      this.ready = true
      this.clickHandler()
    })
  },
  methods: {
    clickHandler() {
      this.errorMessage = ''
      this.selectedElementIndex = null
      this.accountData = []
      this.clearScrollBooster()
      const account = this.inputAccount.replace(/-/g, '').replace(/^0x/, '')
      let selfAddressPlain
      return this.$graphUtil
        .getGraph(account)
        .then((graph) => {
          selfAddressPlain = this.$graphUtil.getSelfAddressPlain(graph)
          return this.$graphUtil.generateAccountData(graph)
        })
        .then((accountData) => {
          this.accountData = accountData
        })
        .catch((e) => {
          this.errorMessage = e.message
        })
        .finally(() => {
          const chartData = this.$graphUtil.generateChartData(
            this.accountData,
            selfAddressPlain
          )
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
        selectedNodeClass: 'mySelectedNodeClass',
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
        },
      })
    },
  },
}
</script>
