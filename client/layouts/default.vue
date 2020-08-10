<template>
  <nuxt></nuxt>
</template>

<script lang="ts">
import 'reflect-metadata';
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class NuxtLayout extends Vue {}
</script>
