<template>
  <v-col cols="12" lg="4" :xl="$vuetify.breakpoint.width > 2500 ? 3 : 4">
    <v-card
      rounded="lg"
      nuxt
      hover
      outlined
      :to="'/show/' + recipe.id"
      :style="
        recipe.recipeSummary.vegan === 1
          ? 'border-bottom: 4px solid #7CB342'
          : recipe.recipeSummary.vegan === 2
          ? 'border-bottom: 4px solid #33691E'
          : ''
      "
    >
      <v-row no-gutters>
        <v-img
          :src="recipe.images.length > 0 ? '/images/' + recipe.images[0] : ''"
          :lazy-src="recipe.images.length > 0 ? '/images/preview/' + recipe.images[0] : ''"
          class="rounded-lg grey lighten-1 align-end elevation-2"
          height="280px"
          width="100%"
          :gradient="
            recipe.images.length === 0
              ? 'to top right, rgba(90,109,83,.33), rgba(248,255,247,.7)'
              : ''
          "
        />

        <v-col>
          <v-row dense no-gutters>
            <v-col
              class="text-truncate pa-2 px-3"
              style="
                font-size: 1.25rem;
                font-weight: 500;
                letter-spacing: 0.0125em;
                line-height: 2rem;
              "
            >
              {{ recipe.title }}
            </v-col>
            <v-btn large icon color="amber accent-3" :loading="recipeLoading" @click="favorite">
              <v-icon>mdi-star{{ recipe.isFavorited ? '' : '-outline' }}</v-icon>
            </v-btn>
          </v-row>
          <v-card-subtitle class="pb-0 pt-0">
            {{ recipe.creator.username }}
          </v-card-subtitle>

          <v-card-text class="pt-0">
            <v-row no-gutters align="center" justify="space-between" class="pb-2">
              <div>
                <v-rating
                  color="#FFD740"
                  half-increments
                  dense
                  class="d-inline-block"
                  readonly
                  half-icon="mdi-star-half-full"
                  length="5"
                  :value="recipe.rating * 5"
                />
                <div class="grey--text pl-2 d-inline-block" style="padding-top: 5px;">
                  ({{ recipe.ratingAmount }})
                </div>
              </div>

              <div>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">
                      <v-rating
                        color="#EF5350"
                        background-color="#EF5350"
                        half-increments
                        dense
                        class="d-inline-block"
                        readonly
                        half-icon="mdi-circle-half-full"
                        full-icon="mdi-circle"
                        empty-icon="mdi-circle-outline"
                        length="5"
                        :value="recipe.difficulty * 5"
                      />
                    </div>
                  </template>
                  <span>{{ $t('DIFFICULTY') }}</span>
                </v-tooltip>
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
            <v-row
              v-if="allergiesWithout0.length > 0"
              no-gutters
              class="py-1"
              align="center"
              align-content="center"
            >
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
            <v-row no-gutters class="py-1" align="center" align-content="center">
              <v-icon class="pr-1">mdi-clock</v-icon> {{ recipe.cookTime + ' ' + $t('MINUTES') }}
              <v-spacer />
              <v-icon class="pr-1">mdi-account-group</v-icon>
              {{ recipe.servingSize + ' ' + $t('PORTIONS') }}
              <v-spacer />
              <v-tooltip v-if="recipe.recipeSummary.dataForAll === true" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon class="pr-1" :color="ingredientRating" v-bind="attrs" v-on="on"
                    >mdi-circle</v-icon
                  >
                </template>
                <span>{{ $t('HEALTHYNESS') }}</span>
              </v-tooltip>
              {{
                recipe.recipeSummary.dataForAll === true
                  ? stepify(recipe.recipeSummary.totalNutritions.calories, 10) +
                    ' ' +
                    $t('CALORIESINFO')
                  : ''
              }}
            </v-row>
            <v-row
              v-if="recipe.recipeSummary.dataForAll === false"
              no-gutters
              class="py-1"
              align="center"
              align-content="center"
            >
              <v-alert class="mb-0 pa-1" text color="orange" type="warning" dense>{{
                $t('MISSINGINGREDIENTS')
              }}</v-alert>
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
import { IRecipeSummary } from '@common/Model/Recipe/Recipe';
import { mapRange, stepify } from '@common/utils/general';
import { get100gSummaryFromIPortion } from '@common/utils/summary';
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import 'reflect-metadata';
import { IconsForAllergyGroups, IconsForIngredientCategories } from '~/utils/enumToIcon';
import tinygradient from 'tinygradient';

@Component({})
export default class RecipeOverviewCard extends Vue {
  @Prop() recipe: IRecipe;

  recipeLoading = false;

  async favorite(): Promise<void> {
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
    return this.allergiesWithout0.map<string>((allergy) => IconsForAllergyGroups[allergy] || '');
  }

  stepify = stepify;

  get allergiesWithout0(): AllergyGroups[] {
    return this.recipe.recipeSummary.allergies.filter((allergy) => allergy != AllergyGroups.None);
  }

  get summaryFor100g(): IRecipeSummary {
    return get100gSummaryFromIPortion(this.recipe.ingredients);
  }

  get ingredientRating(): string {
    const gradient = tinygradient('#64DD17', '#FFEB3B', '#B71C1C');
    const sugarValue = mapRange(this.summaryFor100g.totalNutritions.sugar, 5, 22.5, 0, 1);
    const fatValue = mapRange(this.summaryFor100g.totalNutritions.fat, 3, 17.5, 0, 1);
    return gradient.rgbAt(Math.max(0, Math.min(1, (sugarValue + fatValue) / 2))).toHexString();
  }
}
</script>
