<template>
  <v-card outlined>
    <v-row no-gutters>
      <v-col>
        <v-btn-toggle v-model="value.instanceType" borderless>
          <v-btn>
            <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-weight-kilogram</v-icon>
            <span class="hidden-sm-and-down">{{ $t('PORTIONTYPES0') }}</span>
          </v-btn>
          <v-btn>
            <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-egg-outline</v-icon>
            <span class="hidden-sm-and-down">{{ $t('PORTIONTYPES1') }}</span>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import 'reflect-metadata';
import { ICreatePortion } from '@common/Model/Portion';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class EditablePortion extends Vue {
  @Prop() value: ICreatePortion;

  reEmit() {
    this.$emit('input', this.value);
  }
}
</script>
