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
        v-if="recipeQueryResult.totalCount === 0"
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
      <RecipeFilters
        :current-query="currentFilters"
        :search-again="searchAgain"
        :show-search-drawer="showSearchDrawer"
      />

      <v-btn v-if="$auth.loggedIn" color="secondary" nuxt to="/create" dark fixed bottom right fab>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <template #header>
      <v-text-field
        v-model="currentFilters.name"
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
      <v-btn
        dark
        icon
        @click="
          currentFilters.ascending = !currentFilters.ascending;
          searchAgain();
        "
        ><v-icon>{{
          currentFilters.ascending ? 'mdi-sort-descending' : 'mdi-sort-ascending'
        }}</v-icon></v-btn
      >
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on" @click="showSearchDrawer = !showSearchDrawer"
            ><v-icon>mdi-filter</v-icon></v-btn
          >
        </template>
        <span>{{ $t('ADVANCEDFILTERS') }}</span>
      </v-tooltip>
    </template>
  </main-layout>
</template>

<script lang="ts">
import 'reflect-metadata';

import { IAdvancedRecipeSearch } from '@common/Model/Recipe/IAdvacedRecipeSearch';
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { IRecipeQueryResult, RecipeOrderVariants } from '@common/Model/Recipe/Recipe';

import { Context } from '@nuxt/types';
import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';
import RecipeFilters from '~/components/RecipeFilters.vue';
import RecipeOverviewCard from '~/components/RecipeOverviewCard.vue';
import MainLayout from '~/layout/default.vue';
import Timeout = NodeJS.Timeout;

@Component({
  components: { RecipeFilters, RecipeOverviewCard, MainLayout },
})
export default class IndexPage extends Vue {
  recipeQueryResult: IRecipeQueryResult = { recipes: [], totalCount: 0 };
  recipes: IRecipe[] = [];

  currentFilters: IAdvancedRecipeSearch = {
    ascending: false,
    order: RecipeOrderVariants.Default,
    pageSize: 25,
  };

  isLoading = false;

  showSearchDrawer = false;

  searchDebounce: Timeout;

  async asyncData({ $axios }: Context) {
    let recipeQueryResult: IRecipeQueryResult;
    let recipes: IRecipe[] = [];
    try {
      recipeQueryResult = await $axios.$post('recipes/find', {
        ascending: false,
        order: RecipeOrderVariants.Default,
        pageSize: 25,
      });
      recipes = recipeQueryResult.recipes;
    } catch (e) {
      console.log(e);
    }

    return {
      recipeQueryResult,
      recipes,
    };
  }

  // Debounce the search
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
      this.currentFilters.lastId != this.recipeQueryResult.lastId &&
      // Did we not already load all entries
      this.recipes.length != this.recipeQueryResult.totalCount
    ) {
      // Continue after the last search and then search
      this.currentFilters.lastId = this.recipeQueryResult.lastId;
      this.currentFilters.lastValue = this.recipeQueryResult.lastValue;
      await this.search();
    }
  }

  async search() {
    this.isLoading = true;
    this.recipeQueryResult = await this.$axios.$post<IRecipeQueryResult>(
      'recipes/find',
      this.currentFilters,
    );
    // Add new recipes to the list
    this.recipes.push(...this.recipeQueryResult.recipes);
    this.isLoading = false;
  }

  // The combination Nuxt and Vue seems to mess up the model, and the drawer will always set its state to true on load
  // so we use this to force set it to false
  async mounted() {
    this.$nextTick(() => {
      this.showSearchDrawer = false;
    });
  }
}
</script>
