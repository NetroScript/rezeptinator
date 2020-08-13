import { Context } from '@nuxt/types';

// When a client uses axios, don't use the default localhost baseURL but his current Domain
export default function ({ $axios }: Context) {
  if (process.client) {
    $axios.defaults.baseURL = `${window.location.protocol}//${window.location.hostname}${
      (window.location.port.length == 0 ? '' : ':') + window.location.port
    }`;
  }
}
