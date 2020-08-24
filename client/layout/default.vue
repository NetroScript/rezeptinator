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

<style>
/* Firefox specific */
body {
  scrollbar-color: dark;
  scrollbar-width: thin;
}
/* Webkit */

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-left: 1px solid #dadada;
}

::-webkit-scrollbar-thumb {
  background: #c8c8c8;
  border-radius: 7px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a7a7a7;
}

.theme--dark ::-webkit-scrollbar-track {
  background: #202020;
  border-left: 1px solid #2c2c2c;
}

.theme--dark ::-webkit-scrollbar-thumb {
  background: #3e3e3e;
  border-radius: 7px;
}

.theme--dark ::-webkit-scrollbar-thumb:hover {
  background: #999999;
}

/* Custom icons */

@font-face {
  font-family: 'oventypes';
  src: url('/fonts/oventypes.eot?u885ny');
  src: url('/fonts/oventypes.eot?u885ny#iefix') format('embedded-opentype'),
    url('/fonts/oventypes.ttf?u885ny') format('truetype'),
    url('/fonts/oventypes.woff?u885ny') format('woff'),
    url('/fonts/oventypes.svg?u885ny#oventypes') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

[class^='mdi-oven-'],
[class*=' mdi-oven-'] {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'oventypes' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.mdi-oven-fullgrill:before,
.mdi-oven-grillandfan:before,
.mdi-oven-lowerheat:before,
.mdi-oven-lowerupperheat:before,
.mdi-oven-partgrill:before,
.mdi-oven-upperheat:before,
.mdi-oven-fan:before {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'oventypes' !important;
}

.mdi-oven-fullgrill:before {
  content: '\e900';
}
.mdi-oven-grillandfan:before {
  content: '\e901';
}
.mdi-oven-lowerheat:before {
  content: '\e902';
}
.mdi-oven-lowerupperheat:before {
  content: '\e903';
}
.mdi-oven-partgrill:before {
  content: '\e904';
}
.mdi-oven-upperheat:before {
  content: '\e905';
}
.mdi-oven-fan:before {
  content: '\e906';
}
</style>
