<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list>
        <div v-if="$auth.loggedIn">
          <v-list-item two-line>
            <v-list-item-avatar>
              <img :src="$auth.user.profilePicture" />
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ $auth.user.username }}</v-list-item-title>
              <v-list-item-subtitle>{{
                $t('AUTHENTICATION.CURRENTLYLOGGEDIN')
              }}</v-list-item-subtitle>
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

        <v-divider></v-divider>

        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          link
          router
          nuxt
          exact
          @click="item.onclick"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-if="$auth.loggedIn" #append>
        <div class="pa-2">
          <v-btn block @click="logout">
            <v-icon left>mdi-logout</v-icon>
            {{ $t('AUSLOGGEN') }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-app-bar clipped-left dark fixed app color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title style="width: 250px;" class="ml-0 pl-4 hidden-sm-and-down" v-text="title" />
      <v-text-field
        flat
        solo-inverted
        hide-details
        clearable
        dark
        dense
        :label="$t('SEARCH')"
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on"><v-icon>mdi-filter</v-icon></v-btn>
        </template>
        <span>{{ $t('ADVANCEDFILTERS') }}</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import 'reflect-metadata';
import { Component, Vue } from 'nuxt-property-decorator';
import AuthenticationForm from '@client/components/AuthenticationForm.vue';
import responseErrorHandler from '@client/utils/responseErrorHandler';
@Component({
  components: { AuthenticationForm },
})
export default class MainLayout extends Vue {
  drawer = false;

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
      console.log(data);
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

  async logout() {
    await this.$auth.logout();
  }

  items = [
    {
      icon: 'mdi-apps',
      title: 'Welcome',
      to: '/',
      onclick: () => {},
    },
    {
      icon: 'mdi-chart-bubble',
      title: 'Inspire',
      to: '/inspire',
      onclick: () => {},
    },

    {
      icon: 'mdi-invert-colors',
      title: 'Switch Theme',
      to: '',
      onclick: (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      },
    },
  ];
  miniVariant = false;
  title = 'Rezeptinator';
}
</script>
