<template>
  <MainLayout>
    <template #content>
      <v-row justify="center" align="center" align-content="center" class="fill-height">
        <v-col md="12">
          <v-alert v-if="error.statusCode === 404" prominent type="error">
            {{ pageNotFound }}
          </v-alert>
          <v-alert v-else prominent type="error">
            {{ otherError }}
          </v-alert>
        </v-col>
      </v-row>
    </template>
  </MainLayout>
</template>

<script>
import MainLayout from '~/layout/default';

export default {
  layout: 'empty',
  components: {
    MainLayout,
  },
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: this.$t('ERROR.NOTFOUND'),
      otherError: this.$t('ERROR.UNKNOWN'),
    };
  },
  head() {
    const title = this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title,
    };
  },
};
</script>
