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
    '@nuxtjs/eslint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/google-gtag'
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
    base:
      process.env.NODE_ENV === 'development'
        ? '/'
        : `/${process.env.npm_package_name}/`,
  },
  env: {
    REST: process.env.REST_BASE_URL,
    REF_ADDRESS: process.env.REF_ADDRESS,
  },
  srcDir: 'src/',


  'google-gtag': {
    id: process.env.GTAG,
    config: {
      anonymize_ip: true, // anonymize IP
      send_page_view: false, // might be necessary to avoid duplicated page track on page reload
      linker: {
        domains: [
          process.env.GTAG_DOMAIN
        ]
      }
    },
    debug: false, // enable to track in dev mode
    disableAutoPageTrack: false // disable if you don't want to track each page route with router.afterEach(...).
  }
}
