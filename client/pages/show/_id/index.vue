<template>
  <main-layout>
    <template #content>
      <v-card class="my-n3" style="background-color: rgba(0, 0, 0, 0.07);">
        <v-card class="my-3 py-4 px-1">
          <h1 class="text-center text-h2">{{ recipe.title }}</h1>
        </v-card>

        <v-row align="center" justify="space-around" class="mb-2" no-gutters>
          <v-card class="py-3 px-4 ma-2">
            <span class="caption"> {{ $t('SHOW.CREATOR') }}</span>
            <span class="grey--text">
              <v-icon left>mdi-account</v-icon>
              {{ recipe.creator.username }}
            </span>
          </v-card>
          <v-card class="py-3 px-4 ma-2">
            <span class="caption"> {{ $t('CREATE.COOKTIME') }}:</span>
            <span class="grey--text">
              <v-icon left>mdi-clock-outline</v-icon>
              {{ recipe.cookTime }}
              {{ $t('MINUTES') }}
            </span>
          </v-card>
          <v-card class="py-3 px-4 ma-2">
            <span class="caption"> {{ $t('CREATE.TOTALTIME') }}:</span>
            <span class="grey--text">
              <v-icon left>mdi-clock-outline</v-icon>
              {{ recipe.totalTime }}
              {{ $t('MINUTES') }}
            </span>
          </v-card>
          <v-card class="py-2 px-4 ma-2">
            <v-row no-gutters justify="center" align="center" align-content="center">
              <span class="caption"> {{ $t('SHOW.FAVORITES') }}</span
              >{{ recipe.favorites }}
              <v-spacer></v-spacer>
              <v-btn v-if="$auth.loggedIn" icon right color="amber accent-3" @click="favorite">
                <v-icon>mdi-star{{ recipe.isFavorited ? '' : '-outline' }}</v-icon>
              </v-btn>
            </v-row>
          </v-card>
          <v-card class="py-3 px-4 ma-2">
            <span class="caption"> {{ $t('DIFFICULTY') }}:</span>
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
          </v-card>
          <v-card class="py-3 px-4 mx-2">
            <span class="caption"> {{ $t('SHOW.RATING') }}</span>
            <v-rating
              :value="recipe.userRating * 5"
              color="#FFD740"
              half-increments
              background-color="grey darken-1"
              hover
              dense
              class="d-inline-block"
              half-icon="mdi-star-half-full"
              length="5"
              @input="changeRating"
            >
            </v-rating>
            <span v-if="recipe.userRating === undefined" class="caption">
              {{ $t('SHOW.NORATING') }}</span
            >
          </v-card>
        </v-row>
        <v-card class="pa-3">
          <span class="text-body-1">{{ $t('SHOW.TAGS') }}</span>
          <v-chip
            v-for="tag in recipe.tags"
            :key="'tag-' + tag.id"
            color="primary"
            class="mx-2 my-1"
          >
            <v-icon left>
              {{ getTagIcon[tag.group] || 'mdi-pound' }}
            </v-icon>
            {{ tag.tag }}
          </v-chip>
        </v-card>

        <v-responsive
          v-if="recipe.images.length > 0"
          max-width="1200px"
          aspect-ratio="2"
          class="mx-auto"
        >
          <v-carousel continuous height="800px">
            <v-carousel-item
              v-for="(item, i) in recipe.images"
              :key="i"
              :src="`/images/${item}`"
              reverse-transition="fade-transition"
              transition="fade-transition"
            >
            </v-carousel-item>
          </v-carousel>
        </v-responsive>

        <v-row>
          <v-col v-if="recipe.recipeSummary.dataForAll" md="12" lg="6" style="flex-basis: initial;">
            <v-card class="my-3 py-1 px-1" width="100%">
              <span class="text-h5 pa-2">
                {{ $t('NUTRIENTS') }}
              </span>
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th class="text-left"></th>
                    <th class="text-left">{{ $t('PER100G') }}</th>
                    <th class="text-left">{{ $t('PERPORTION') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(type, index) in nutrientKeys" :key="'nutrientkey-' + index">
                    <td class="text-right">{{ $t(type) }}</td>
                    <td>
                      {{
                        summary100g.totalNutritions[type.toLowerCase()].toFixed(1) +
                        (type === 'CALORIES' ? ' kcal' : ' g')
                      }}
                    </td>
                    <td>
                      {{
                        recipe.recipeSummary.totalNutritions[type.toLowerCase()].toFixed(1) +
                        (type === 'CALORIES' ? ' kcal' : ' g')
                      }}
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-col>
          <v-col
            md="12"
            :lg="recipe.recipeSummary.dataForAll ? 6 : 12"
            style="flex-basis: initial;"
          >
            <v-card class="my-3 py-1 px-1" width="100%">
              <v-row class="pa-2" no-gutters justify="center" align-content="center" align="center">
                <span class="text-h5">
                  {{ $t('SHOW.INGREDIENTS') }}
                </span>
                <v-text-field
                  v-model="recipe.servingSize"
                  class="mx-2 mt-n3"
                  hide-details
                  type="number"
                  prepend-icon="mdi-account-group"
                  :suffix="$t('PORTIONS')"
                />
              </v-row>
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th class="text-left">{{ $t('CREATE.INGREDIENTAMOUNT') }}</th>
                    <th class="text-left">{{ $t('CREATE.INGREDIENT') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(ingredient, index) in ingredientData"
                    :key="'ingredient-' + ingredient.ingredient.id"
                  >
                    <td class="text-right">{{ ingredientText[index] }}</td>
                    <td>{{ ingredient.ingredient.name }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-3 py-1 px-1">
          <span class="text-h5">
            {{ $t('SHOW.STEPS') }}
          </span>
        </v-card>
        <v-timeline dense>
          <v-timeline-item
            v-for="(step, index) in recipe.recipeSteps"
            :key="'step-' + index"
            :icon="stepIcons[index]"
            fill-dot
          >
            <v-card class="elevation-2">
              <v-card-actions v-if="step.time > 0 || step.type === 1">
                <div v-if="step.time > 0">
                  <v-icon left>mdi-clock-outline</v-icon>
                  {{ step.time }}
                  {{ $t('MINUTES') }}
                </div>

                <v-divider v-if="step.type === 1 && step.time > 0" vertical class="mx-4" />

                <div v-if="step.type === 1">
                  <v-icon left v-text="getOvenIcon[step.payloadType]" />
                  {{ $t('OVENTYPES.' + step.payloadType) }}
                </div>
                <div v-if="step.type === 1">
                  <v-icon left>mdi-temperature</v-icon>

                  {{ step.payloadNumber }} °C
                </div>
              </v-card-actions>
              <v-divider></v-divider>
              <v-container>
                {{ step.text }}
              </v-container>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card>
    </template>
  </main-layout>
</template>

<script lang="ts">
import MainLayout from '~/layout/default.vue';
import { Vegan } from '@common/Model/Ingredient';
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { PortionFunctions } from '@common/Model/Recipe/Portion';
import { IRecipeSummary } from '@common/Model/Recipe/Recipe';
import { get100gSummaryFromIPortion, getPortionClassFromInterface } from '@common/utils/summary';

import { Context } from '@nuxt/types';
import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';
import RecipeOverviewCard from '~/components/RecipeOverviewCard.vue';
import { IconsForOvenTypes, IconsForStepTypes, IconsForTagGroups } from '~/utils/enumToIcon';

@Component({
  components: { RecipeOverviewCard, MainLayout },
})
export default class IndexPage extends Vue {
  recipe: IRecipe;
  originalServingSize: number;

  getTagIcon = IconsForTagGroups;
  getOvenIcon = IconsForOvenTypes;

  favoriteLoading = false;

  get summary100g(): IRecipeSummary {
    return get100gSummaryFromIPortion(this.recipe.ingredients);
  }

  nutrientKeys = ['CALORIES', 'PROTEIN', 'FAT', 'SUGAR', 'CARBS', 'FIBERS'];

  // get Ingredient Data for the ingredients in the recipe
  get ingredientData(): PortionFunctions[] {
    const data = getPortionClassFromInterface(this.recipe.ingredients);
    data.forEach(
      (ingredient) => (ingredient.servingSize = this.recipe.servingSize / this.originalServingSize),
    );
    return data;
  }

  // Normalise the text from each ingredient and additionally translate nested keys
  get ingredientText(): string[] {
    return this.ingredientData.map((entry) => {
      const data = entry.getText();

      // If there is a fraction but no amount remove the leading zero
      if (data.options.fraction.length > 0 && data.options.amount == 0) {
        delete data.options['amount'];
      }

      // Iterate the translation parameters
      for (let option in data.options) {
        // If it is a string and contains another sub translation
        if (typeof data.options[option] === 'string' && data.options[option].startsWith('$t(')) {
          // extract the translation key
          const key = data.options[option].substr(3, data.options[option].length - 4);
          // Don't show it on normal size
          if (key == 'MediumPiecePortion') {
            data.options[option] = '';
          } else data.options[option] = this.$t(key);
        }
      }

      // limit the number of digits after the . or , and remove the leading zero
      if (data.options['amount'] != undefined) {
        data.options['amount'] = data.options['amount'].toFixed(1).replace(/\.0$/, '');
      }

      // Trim leading empty comma should there be one and return the translated string
      return (this.$t(data.key, data.options) as string).replace(/, $/, '');
    });
  }

  get stepIcons(): string[] {
    return this.recipe.recipeSteps.map((step) => {
      return IconsForStepTypes[step.type];
    });
  }

  // Update the rating
  async changeRating(rating: number) {
    try {
      // make the request
      await this.$axios.$post<{ success: boolean }>('/recipes/rating/' + this.recipe.id, {
        rating,
      });
      // If the not rated yes message was there, now disable it by setting a value
      this.recipe.userRating = rating;
    } catch (error) {}
  }

  // Favorite the current recipe
  async favorite(): Promise<void> {
    try {
      this.favoriteLoading = true;
      const result = await this.$axios.$post<{ success: boolean; result: boolean }>(
        '/recipes/favorite/' + this.recipe.id,
      );
      this.recipe.isFavorited = result.result;
      // Decrease / increase the amount of favorites
      if (result.result) {
        this.recipe.favorites++;
      } else {
        this.recipe.favorites--;
      }
      this.favoriteLoading = false;
    } catch (error) {
      this.favoriteLoading = false;
    }
  }

  // Load the data from the server on page load
  async asyncData({ $axios, route, error, app }: Context) {
    let recipe: IRecipe;
    try {
      recipe = await $axios.$get<IRecipe>('recipes/' + route.params.id);

      if (recipe.recipeSummary.vegan == Vegan.Vegan) {
        recipe.tags.splice(0, 0, { group: 'Vegan', tag: app.i18n.t('VEGAN') as string });
      } else if (recipe.recipeSummary.vegan == Vegan.Vegetarion) {
        recipe.tags.splice(0, 0, { group: 'Vegan', tag: app.i18n.t('VEGETARIAN') as string });
      }
    } catch (e) {
      if (route.params.id != undefined) console.log(e);
      error({ statusCode: 418, message: 'ERROR.UNKNOWN' });
      return {};
    }

    return {
      originalServingSize: recipe.servingSize,
      recipe,
    };
  }
}
</script>
