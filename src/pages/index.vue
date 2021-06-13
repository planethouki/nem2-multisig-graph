<template>
  <div>
    <div class="jumbotron bg-white">
      <h1 class="display-4">Multisig Graph</h1>
      <p class="lead">マルチシグの構成を図で表します。</p>
      <hr class="my-4" />
      <b-button variant="secondary" size="lg" :to="tryAnywayTo">
        Try Anyway
      </b-button>
    </div>
    <div class="container-fluid mb-3">
      <table>
        <body>
          <tr>
            <td class="pr-3">使用ノード</td>
            <td>{{ restUrl }}</td>
          </tr>
          <tr>
            <td>Node Version</td>
            <td>{{ nodeVersion }}</td>
          </tr>
          <tr>
            <td class="pr-3">Generation Hash</td>
            <td>{{ generationHash }}</td>
          </tr>
          <tr>
            <td>Height</td>
            <td>{{ chainHeight }}</td>
          </tr>
          <tr>
            <td>Network</td>
            <td>{{ networkIdentifier }}</td>
          </tr>
          <tr>
            <td>Deployment</td>
            <td>{{ deploymentTool }}</td>
          </tr>
          <tr>
            <td>Last Updated</td>
            <td>{{ lastUpdatedDate }}</td>
          </tr>
        </body>
      </table>
    </div>
  </div>
</template>

<script>
import { RepositoryFactoryHttp } from 'symbol-sdk'
import { from as observableFrom } from 'rxjs'
import { map } from 'rxjs/operators'

export default {
  components: {},
  data() {
    return {
      nodeVersion: null,
      generationHash: null,
      chainHeight: null,
      networkIdentifier: null,
      deploymentTool: null,
      lastUpdatedDate: null,
    }
  },
  computed: {
    tryAnywayTo() {
      return '/graph?account=' + process.env.REF_ADDRESS
    },
    restUrl() {
      return process.env.REST
    },
  },
  mounted() {
    const f = new RepositoryFactoryHttp(this.restUrl)
    const ch = f.createChainRepository()
    const ne = f.createNetworkRepository()
    const no = f.createNodeRepository()
    ch.getChainInfo()
      .pipe(map((chIf) => chIf.height))
      .subscribe((height) => {
        this.chainHeight = height
      })
    ne.getNetworkProperties()
      .pipe(map((nePr) => nePr.network.identifier))
      .subscribe((id) => {
        this.networkIdentifier = id
      })
    no.getNodeInfo()
      .pipe(
        map((noIf) => {
          return {
            v: this.parseNodeVersion(noIf.version),
            gh: noIf.networkGenerationHashSeed,
          }
        })
      )
      .subscribe(({ v, gh }) => {
        this.nodeVersion = v
        this.generationHash = gh
      })
    observableFrom(
      this.$axios.$request({
        baseURL: this.restUrl,
        url: '/node/server',
      })
    )
      .pipe(
        map((res) => {
          const d = res.serverInfo.deployment
          return {
            deployment: `${d.deploymentTool}@${d.deploymentToolVersion}`,
            lastUpdatedDate: d.lastUpdatedDate,
          }
        })
      )
      .subscribe(({ deployment, lastUpdatedDate }) => {
        this.deploymentTool = deployment
        this.lastUpdatedDate = lastUpdatedDate
      })
  },
  methods: {
    parseNodeVersion(num) {
      const hex = `00000000${Number(num).toString(16)}`.substr(-8)
      const strArray = []
      for (let i = 0; i < 8; i += 2) {
        const octet = Number(`0x${hex[i]}${hex[i + 1]}`).toString(10)
        strArray.push(octet)
      }

      return strArray.join('.')
    },
  },
}
</script>
