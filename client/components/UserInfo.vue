<template>
  <div v-if="$auth.loggedIn">
    <v-list-item two-line>
      <v-list-item-avatar>
        <img :src="$auth.user.profilePicture" :alt="$t('DESCRIPTION.PROFILEPICTURE')" />
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>{{ $auth.user.username }}</v-list-item-title>
        <v-list-item-subtitle>{{ $t('AUTHENTICATION.CURRENTLYLOGGEDIN') }} </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </div>
  <div v-else>
    <v-row justify="center">
      <v-snackbar v-model="loginSuccessful" color="success" timeout="5000" top>
        {{ $t('AUTHENTICATION.LOGGEDIN') }}
        <template #action="{ attrs }">
          <v-btn dark text v-bind="attrs" @click="loginSuccessful = false">
            {{ $t('CLOSE') }}
          </v-btn>
        </template>
      </v-snackbar>
      <v-dialog v-model="loginDialog" max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            <v-icon left>mdi-account-arrow-left</v-icon>
            {{ $t('AUTHENTICATION.LOGIN') }}
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline"> {{ $t('AUTHENTICATION.LOGIN') }}</span>
          </v-card-title>
          <v-card-text>
            <AuthenticationForm
              :username-required="false"
              :submit-function="login"
            ></AuthenticationForm>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row justify="center" class="my-4">
      <v-snackbar v-model="registerSuccessful" color="success" timeout="5000" top>
        {{ $t('AUTHENTICATION.REGISTERED') }}
        <template #action="{ attrs }">
          <v-btn dark text v-bind="attrs" @click="registerSuccessful = false">
            {{ $t('CLOSE') }}
          </v-btn>
        </template>
      </v-snackbar>
      <v-dialog v-model="registerDialog" max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            <v-icon left>mdi-account-plus</v-icon>
            {{ $t('AUTHENTICATION.REGISTER') }}
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline"> {{ $t('AUTHENTICATION.REGISTER') }}</span>
          </v-card-title>
          <v-card-text>
            <AuthenticationForm
              :username-required="true"
              :submit-function="register"
            ></AuthenticationForm>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import AuthenticationForm from '~/components/AuthenticationForm.vue';
import responseErrorHandler from '~/utils/responseErrorHandler';

@Component({
  components: { AuthenticationForm },
})
export default class UserInfo extends Vue {
  loginDialog = false;
  loginSuccessful = false;
  registerDialog = false;
  registerSuccessful = false;

  async login({
    email,
    password,
  }: {
    username?: string;
    email: string;
    password: string;
  }): Promise<string[]> {
    try {
      const data = await this.$auth.loginWith('local', { data: { email, password } });
      this.loginDialog = false;
      this.loginSuccessful = true;
      return [];
    } catch (error) {
      return responseErrorHandler(error);
    }
  }

  async register(registerData: {
    username?: string;
    email: string;
    password: string;
  }): Promise<string[]> {
    try {
      const data = await this.$axios.$post('/user', registerData);
      this.registerSuccessful = true;
      this.registerDialog = false;
      this.$auth.setUser(data);
      this.$auth.setToken('local', 'Bearer ' + data.token);
      return [];
    } catch (error) {
      return responseErrorHandler(error);
    }
  }
}
</script>
