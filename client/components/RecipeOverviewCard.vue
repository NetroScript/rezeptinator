<template>
  <v-col cols="12" lg="4" :xl="$vuetify.breakpoint.width > 2500 ? 3 : 4">
    <v-card rounded="lg">
      <v-row no-gutters>
        <v-img
          :src="recipe.images.length > 0 ? '/images/' + recipe.images[0] : ''"
          :lazy-src="recipe.images.length > 0 ? '/images/preview/' + recipe.images[0] : ''"
          class="rounded-lg grey lighten-1 align-end"
          height="240px"
          width="100%"
          :gradient="
            recipe.images.length === 0
              ? 'to top right, rgba(90,109,83,.33), rgba(248,255,247,.7)'
              : ''
          "
        />

        <v-col>
          <v-row dense no-gutters>
            <v-col>
              <v-card-title>
                <div class="d-inline-block text-truncate">{{ recipe.title }}</div>
              </v-card-title>

              <v-card-subtitle class="pb-0">
                {{ recipe.creator.username }}
              </v-card-subtitle>
            </v-col>
            <v-btn v-if="$auth.loggedIn" right large icon color="amber accent-3" @click="favourite">
              <v-icon>mdi-star{{ recipe.isFavorited ? '' : '-outline' }}</v-icon>
            </v-btn>
          </v-row>

          <v-card-text class="pt-0">
            <v-row no-gutters align="center" class="pb-2">
              <v-rating
                color="#FFD740"
                half-increments
                dense
                readonly
                half-icon="mdi-star-half-full"
                length="5"
                :value="recipe.rating * 5"
              />
              <div class="grey--text pl-2" style="padding-top: 2px;">
                ({{ recipe.ratingAmount }})
              </div>
            </v-row>
            <v-row no-gutters class="py-1" align="center" align-content="center">
              <div class="pt-1">{{ $t('INGREDIENTCATEGORIES') }}:</div>
              <v-tooltip v-for="(category, i) in recipe.recipeSummary.categories" :key="i" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    class="px-1"
                    v-bind="attrs"
                    v-on="on"
                    v-text="ingredientCategoriesIcons[i]"
                  />
                </template>
                <span>{{ $t('CATEGORIES.' + category) }}</span>
              </v-tooltip>
            </v-row>
            <v-row no-gutters class="py-1" align="center" align-content="center">
              <div class="pt-1">{{ $t('ALLERGIES') }}:</div>
              <v-tooltip v-for="(allergy, i) in allergiesWithout0" :key="i" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    color="#FDD835"
                    class="px-1"
                    v-bind="attrs"
                    v-on="on"
                    v-text="allergiesCategories[i]"
                  />
                </template>
                <span>{{ $t('ALLERGY.' + allergy) }}</span>
              </v-tooltip>
            </v-row>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { AllergyGroups } from '@common/Model/Ingredient';
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import 'reflect-metadata';
import { IconsForAllergyGroups, IconsForIngredientCategories } from '~/utils/enumToIcon';

@Component({})
export default class RecipeOverviewCard extends Vue {
  @Prop() recipe: IRecipe;

  recipeLoading = false;

  async favourite(): Promise<void> {
    try {
      this.recipeLoading = true;
      const result = await this.$axios.$post<{ success: boolean; result: boolean }>(
        '/recipes/favorite/' + this.recipe.id,
      );
      this.recipe.isFavorited = result.result;
      this.recipeLoading = false;
    } catch (error) {
      this.recipeLoading = false;
    }
  }

  get ingredientCategoriesIcons(): string[] {
    return this.recipe.recipeSummary.categories.map<string>(
      (category) => IconsForIngredientCategories[category] || '',
    );
  }

  get allergiesCategories(): string[] {
    return this.recipe.recipeSummary.allergies.map<string>(
      (allergy) => IconsForAllergyGroups[allergy] || '',
    );
  }

  get allergiesWithout0(): AllergyGroups[] {
    return this.recipe.recipeSummary.allergies.filter((allergy) => allergy != AllergyGroups.None);
  }
}
</script>
