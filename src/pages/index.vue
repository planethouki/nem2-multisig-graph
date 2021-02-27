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
    <div class="container-fluid">使用ノード {{ restUrl }}</div>
  </div>
</template>

<script>
export default {
  components: {},
  computed: {
    tryAnywayTo() {
      return '/graph?account=' + process.env.REF_ADDRESS
    },
    restUrl() {
      return process.env.REST
    },
  },
}
</script>
