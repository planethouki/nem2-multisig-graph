<template>
  <div>
    <b-navbar type="dark" variant="secondary" class="justify-content-between">
      <b-navbar-brand to="/">
        nem2 multisig graph
      </b-navbar-brand>
      <div class="form-inline">
        <input
          v-model="inputAccount"
          type="text"
          class="form-control mr-sm-2"
          aria-label="Search"
          placeholder="Address, PublicKey"
        />
        <button type="button" class="btn btn-secondary" @click="clickHandler">
          Search
        </button>
      </div>
    </b-navbar>
    <nuxt class="main" />
    <div class="navbar navbar-dark bg-primary">
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
export default {
  components: {},
  data() {
    return {
      inputAccount: '',
    }
  },
  watch: {
    $route(to) {
      this.inputAccount = to.query.account || ''
    },
  },
  mounted() {
    this.inputAccount = this.$route.query.account || ''
  },
  methods: {
    clickHandler() {
      this.$router.push(`/graph?account=${this.inputAccount}`)
    },
  },
}
</script>

<style>
.main {
  min-height: calc(100vh - 56px - 48px);
}
</style>
