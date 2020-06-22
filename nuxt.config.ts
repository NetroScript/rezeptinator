import { resolve } from 'path';
import colors from 'vuetify/es5/util/colors'

const {
  NODE_ENV,
  PORT: port = 8080,
  HOST: host = '0.0.0.0',
  DOMAIN: domain = 'http://localhost'
} = process.env

const isDev = !(NODE_ENV === 'production');
const baseURL = `${domain}:${port}`;

const configFile = resolve(process.cwd(), 'client', 'tsconfig.json');

export default {
  mode: 'universal',
  modern: isDev ? false : 'client',

  srcDir: 'client/',
  buildDir: 'dist/client',

  env: {
    NODE_ENV,
    port,
    host,
    domain
  },

  dev: isDev,

  globalName: 'root',

  loading: false,
  loadingIndicator: false,


  /*
   ** Headers of the page
   */
  head: {
    title: 'title',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'description' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],

  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
  ],

  axios: {
    baseURL,
  },

  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxt/typescript-build',
    '@nuxtjs/stylelint-module',
  ],

  typescript: {
    typeCheck: {
      tsconfig: configFile
    },

    loaders: {
      ts: {
        configFile
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    cache: false,
    extractCSS: true,
    publicPath: '/bundles/',

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // config.resolve.alias.vue = 'vue/dist/vue.common'

      if (isDev) {
        const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

        config.resolve.plugins = [
          ...(config.resolve.plugins || []),
          new TsconfigPathsPlugin({ configFile }),
        ];
      }
    },
  },

  render: {
    http2: { push: true }
  },

  stylelint: {
    /* module options */
  },

  vuetify: {
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

};
