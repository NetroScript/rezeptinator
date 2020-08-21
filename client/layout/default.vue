<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" clipped app>
      <v-list>
        <UserInfo />
        <v-divider></v-divider>

        <v-list-item
          v-for="(item, i) in drawerUrls"
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
            <v-list-item-title v-text="$t(item.title)" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-if="$auth.loggedIn" #append>
        <div class="pa-2">
          <v-btn block @click="logout">
            <v-icon left>mdi-logout</v-icon>
            {{ $t('AUTHENTICATION.LOGOUT') }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <slot name="drawer"></slot>
    <v-app-bar clipped-left dark fixed app color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title style="width: 250px;" class="ml-0 pl-4 hidden-sm-and-down" v-text="title" />
      <slot name="header"></slot>
    </v-app-bar>
    <v-main>
      <v-container>
        <slot name="content"></slot>
      </v-container>
    </v-main>
    <v-footer app inset absolute elevation="4">
      <v-col class="text-center" cols="12">
        &copy; {{ new Date().getFullYear() }} — <strong>Rezeptinator</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import 'reflect-metadata';
import { Component, Vue } from 'nuxt-property-decorator';
import UserInfo from '~/components/UserInfo.vue';
@Component({
  components: { UserInfo },
})
export default class MainLayout extends Vue {
  drawer = false;

  async logout() {
    await this.$auth.logout();
  }

  get drawerUrls(): {
    icon: string;
    title: string;
    to: string;
    loggedInOnly: boolean;
    onclick: (Event) => void;
  }[] {
    if (this.$auth.loggedIn) {
      return this.items;
    } else {
      return this.items.filter((item) => !item.loggedInOnly);
    }
  }

  items: {
    icon: string;
    title: string;
    to: string;
    loggedInOnly: boolean;
    onclick: (Event) => void;
  }[] = [
    {
      icon: 'mdi-home',
      title: 'MAINPAGE',
      to: '/',
      loggedInOnly: false,
      onclick: () => {},
    },
    {
      icon: 'mdi-plus-circle',
      title: 'CREATERECIPE',
      to: '/create',
      loggedInOnly: true,
      onclick: () => {},
    },
    {
      icon: 'mdi-invert-colors',
      title: 'CHANGETHEME',
      to: '',
      loggedInOnly: false,
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
