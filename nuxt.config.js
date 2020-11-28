require('dotenv').config()

export default {
  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    script: [
      {
        src: 'https://www.gstatic.com/charts/loader.js',
        type: 'text/javascript',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#FF94CB' },
  /*
   ** Global CSS
   */
  css: ['~/assets/app.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [{ src: '~/plugins/graphUtil.js', model: 'client' }],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/google-analytics',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.ejs$/,
        loader: 'ejs-loader',
      })
    },
    publicPath: '/n/',
  },
  bootstrapVue: {
    bootstrapCSS: false, // Or `css: false`
    bootstrapVueCSS: false, // Or `bvCSS: false`
  },
  router: {
    base: `/${process.env.npm_package_name}/`,
  },
  env: {
    REST: process.env.REST_BASE_URL,
    REF_ADDRESS: process.env.REF_ADDRESS,
  },
  srcDir: 'src/',
  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS,
  },
}
