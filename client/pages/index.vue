<template>
  <main-layout>
    <template #content>
      <v-row align-content="center">
        <RecipeOverviewCard
          v-for="(recipe, i) in recipes"
          :key="recipe.id"
          v-intersect.once="i >= recipes.length - 6 ? loadMore : () => {}"
          :recipe="recipe"
        ></RecipeOverviewCard>
      </v-row>
      <v-row
        v-if="recipeQuery.totalCount === 0"
        justify="center"
        align-content="center"
        align="center"
      >
        <v-card-title>
          {{ $t('NORECIPESFOUND') }}
        </v-card-title>
      </v-row>
      <div class="text-center">
        <v-progress-circular
          v-if="isLoading"
          :width="10"
          size="100"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
    </template>
    <template #drawer>
      <v-btn v-if="$auth.loggedIn" color="secondary" nuxt to="/create" dark fixed bottom right fab>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <template #header>
      <v-text-field
        v-model="currentQuery.name"
        flat
        solo-inverted
        hide-details
        clearable
        dark
        dense
        :label="$t('SEARCH')"
        prepend-inner-icon="mdi-magnify"
        @input="searchAgain"
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
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import {
  IAdvancedRecipeSearch,
  IRecipeQueryResult,
  RecipeOrderVariants,
} from '@common/Model/Recipe/Recipe';

import { IUser } from '@common/Model/User';
import { Context } from '@nuxt/types';
import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';
import RecipeOverviewCard from '~/components/RecipeOverviewCard.vue';
import Timeout = NodeJS.Timeout;

@Component({
  components: { RecipeOverviewCard, MainLayout },
})
export default class IndexPage extends Vue {
  users: IUser[] = [];
  recipeQuery: IRecipeQueryResult = { recipes: [], totalCount: 0 };
  recipes: IRecipe[] = [];

  currentQuery: IAdvancedRecipeSearch = {
    ascending: false,
    order: RecipeOrderVariants.Favourites,
    pageSize: 25,
  };

  isLoading = false;

  searchDebounce: Timeout;

  async asyncData({ $axios }: Context) {
    let recipeQuery: IRecipeQueryResult;
    let recipes: IRecipe[] = [];
    try {
      recipeQuery = await $axios.$post('recipes/find', {
        ascending: false,
        order: RecipeOrderVariants.Favourites,
        pageSize: 25,
      });
      recipes = recipeQuery.recipes;
    } catch (e) {
      console.log(e);
    }

    return {
      recipeQuery,
      recipes,
    };
  }

  async searchAgain() {
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(() => {
      this.recipes = [];
      this.search();
    }, 200);
  }

  // Load more entries
  async loadMore(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
    isIntersecting: boolean,
  ) {
    if (
      // Is it actually already on screen or is it the initialising event
      isIntersecting &&
      // Did we not already try to load the new page
      this.currentQuery.lastId != this.recipeQuery.lastId &&
      // Did we not already load all entries
      this.recipes.length != this.recipeQuery.totalCount
    ) {
      // Continue after the last search and then search
      this.currentQuery.lastId = this.recipeQuery.lastId;
      this.currentQuery.lastValue = this.recipeQuery.lastValue;
      await this.search();
    }
  }

  async search() {
    this.isLoading = true;
    await new Promise((r) => setTimeout(r, 2000));
    this.recipeQuery = await this.$axios.$post<IRecipeQueryResult>(
      'recipes/find',
      this.currentQuery,
    );
    this.recipes.push(...this.recipeQuery.recipes);
    this.isLoading = false;
  }
}
</script>
