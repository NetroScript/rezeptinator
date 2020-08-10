<template>
  <main-layout>
    <template #content>
      <h1>index</h1>
      <ul>
        <li v-for="(recipe, i) in recipeQuery.recipes" :key="recipe.id">
          Titel: {{ recipe.title }}
        </li>
      </ul>
    </template>
    <template #header>
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
    </template>
  </main-layout>
</template>

<script lang="ts">
import MainLayout from '@client/layout/default.vue';
import {
  IAdvancedRecipeSearch,
  RecipeOrderVariants,
} from '@common/Model/dto/advancedRecipeSearch.dto';
import { IRecipe, IRecipeQueryResult } from '@common/Model/Recipe';

import { IUser } from '@common/Model/User';
import { Context } from '@nuxt/types';
import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';

@Component({
  components: { MainLayout },
})
export default class IndexPage extends Vue {
  users: IUser[] = [];
  recipeQuery: IRecipeQueryResult;
  currentQuery: IAdvancedRecipeSearch = {
    ascending: false,
    order: RecipeOrderVariants.Favourites,
    pageSize: 25,
  };

  async asyncData({ $axios }: Context) {
    /*
    const recipeQuery = await $axios.$post('recipes/find', {
      ascending: false,
      order: RecipeOrderVariants.Favourites,
      pageSize: 25,
    });


    return {
      recipeQuery,
    };
     */
  }
}
</script>
