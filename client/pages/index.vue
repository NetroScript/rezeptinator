<template>
  <div>
    <h1>index</h1>
    <ul>
      <li v-for="(user, i) in users" :key="i">Vorname: {{ user.name }}</li>
    </ul>
    <AuthenticationForm :username-required="false" :submit-function="() => {}">
    </AuthenticationForm>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { Context } from '@nuxt/types';
import '@nuxtjs/axios';

import { IUser } from '@common/Model/User';
import AuthenticationForm from '@client/components/AuthenticationForm.vue';
@Component({
  components: { AuthenticationForm },
})
export default class IndexPage extends Vue {
  users: IUser[] = [];

  async asyncData({ $axios }: Context) {
    //const { data: users } = await $axios.get('users');

    return {
      /*users*/
    };
  }
}
</script>
