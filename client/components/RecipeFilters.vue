<template>
  <v-navigation-drawer
    v-model="showSearchDrawer"
    width="370px"
    disable-resize-watcher
    disable-route-watcher
    app
    right
  >
    <v-divider class="mb-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('INGREDIENTS') }}: </span>
    <v-autocomplete
      hide-details
      :no-data-text="$t('CREATE.NODATA')"
      class="my-2"
      :label="$t('FILTER.INCLUDEINGREDIENTS')"
      background-color="#DCEDC8"
      color="black"
      light
      multiple
      filled
      dense
      @change="searchAgain"
    >
    </v-autocomplete>
    <v-autocomplete
      hide-details
      :no-data-text="$t('CREATE.NODATA')"
      class="my-2"
      :label="$t('FILTER.EXCLUDEINGREDIENTS')"
      background-color="#FFCDD2"
      color="black"
      light
      multiple
      filled
      dense
      @change="searchAgain"
    >
    </v-autocomplete>
    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('ALLERGIES') }}: </span>
    <v-autocomplete
      hide-details
      :no-data-text="$t('CREATE.NODATA')"
      class="my-2"
      background-color="#FFCDD2"
      color="black"
      light
      :label="$t('FILTER.EXCLUDEALLERGIES')"
      multiple
      filled
      dense
      @change="searchAgain"
    >
    </v-autocomplete>
    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('SHOW.TAGS') }} </span>
    <v-autocomplete
      hide-details
      :no-data-text="$t('CREATE.NODATA')"
      class="my-2"
      background-color="#DCEDC8"
      color="black"
      light
      :label="$t('FILTER.INCLUDETAGS')"
      multiple
      filled
      dense
      @change="searchAgain"
    >
    </v-autocomplete>
    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('CATEGORIES') }}: </span>
    <v-autocomplete
      hide-details
      :no-data-text="$t('CREATE.NODATA')"
      class="my-2"
      background-color="#DCEDC8"
      color="black"
      light
      :label="$t('FILTER.INCLUDECATEGORIES')"
      multiple
      filled
      dense
      @change="searchAgain"
    >
      <v-autocomplete
        hide-details
        :no-data-text="$t('CREATE.NODATA')"
        class="my-2"
        background-color="#FFCDD2"
        color="black"
        light
        :label="$t('FILTER.EXCLUDECATEGORIES')"
        multiple
        filled
        dense
        @change="searchAgain"
      >
      </v-autocomplete>
    </v-autocomplete>
    <v-divider class="my-3" />
    <v-row no-gutters align="center" align-content="center">
      <span class="text-h6 mx-2 mb-1"> {{ $t('FILTER.RATING') }}: </span>
      <v-rating
        v-model="currentQuery.minimalRating"
        color="#FFD740"
        half-increments
        background-color="grey darken-1"
        hover
        dense
        class="d-inline-block"
        half-icon="mdi-star-half-full"
        length="5"
        @input="searchAgain"
      />
      <v-spacer />
      <v-btn
        v-if="currentQuery.minimalRating != 0"
        color="red"
        dark
        icon
        @click="
          currentQuery.minimalRating = 0;
          searchAgain();
        "
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-row>

    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('FILTER.DIFFICULTY') }}: </span>

    <v-range-slider
      v-model="rangeInput"
      max="1"
      min="0"
      step="0.05"
      color="primary"
      hide-details
      dense
      class="mx-2"
      append-icon="mdi-circle"
      @end="onRangeInput"
    >
      <template #prepend>
        <v-icon color="primary">
          mdi-baby-face-outline
        </v-icon>
      </template>
      <template #append>
        <v-icon color="primary">
          mdi-rocket-launch
        </v-icon>
      </template>
      <template #thumb-label="{ value }">
        {{
          ['😍', '😄', '😁', '😊', '🙂', '😐', '🙁', '☹️', '😢', '😭'][
            Math.min(Math.floor(value * 10), 9)
          ]
        }}
      </template>
    </v-range-slider>

    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('CREATE.TIME') }}: </span>
    <v-text-field
      v-model.number="currentQuery.maxCookTime"
      type="number"
      :label="$t('FILTER.COOKTIME')"
      class="my-4 mx-2"
      hide-details
      required
      dense
      step="0.5"
      prepend-icon="mdi-clock-outline"
      :suffix="$t('MINUTES')"
      @change="
        currentQuery.maxCookTime = currentQuery.maxCookTime || 0;
        searchAgain();
      "
    />
    <v-text-field
      v-model.number="currentQuery.maxTotalTime"
      type="number"
      :label="$t('FILTER.TOTALTIME')"
      class="my-4 mx-2"
      hide-details
      dense
      required
      step="0.5"
      prepend-icon="mdi-clock-outline"
      :suffix="$t('MINUTES')"
      @change="
        currentQuery.maxTotalTime = currentQuery.maxTotalTime || 0;
        searchAgain();
      "
    />
    <v-divider class="my-3" />
    <v-row no-gutters justify="center">
      <v-btn-toggle
        v-model="currentQuery.veganLevel"
        dense
        borderless
        color="primary"
        @change="searchAgain"
      >
        <v-btn>
          <span>{{ $t('VEGAN.0') }}</span>
        </v-btn>
        <v-btn>
          <span>{{ $t('VEGAN.1') }}</span>
        </v-btn>
        <v-btn>
          <span>{{ $t('VEGAN.2') }}</span>
        </v-btn>
      </v-btn-toggle>
    </v-row>

    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('FILTER.SORT') }}: </span>
    <v-row justify="space-around" align-content="center" align="center" no-gutters>
      <v-btn
        v-for="index in 6"
        :key="index"
        depressed
        class="ma-1"
        small
        :color="currentQuery.order === index - 1 ? 'primary' : ''"
        @click="
          currentQuery.order = index - 1;
          searchAgain();
        "
      >
        <span>{{ $t('ORDERVARIANTS.' + (index - 1)) }}</span>
      </v-btn>
    </v-row>

    <v-divider class="my-3" />
    <span class="text-h6 mx-2 mb-1"> {{ $t('AUTHOR') }}: </span>
    <v-autocomplete
      hide-details
      :no-data-text="$t('CREATE.NODATA')"
      class="my-2"
      :label="$t('FILTER.AUTHOR')"
      filled
      dense
      @change="searchAgain"
    >
    </v-autocomplete>
  </v-navigation-drawer>
</template>
<script lang="ts">
import 'reflect-metadata';

import { IAdvancedRecipeSearch } from '@common/Model/Recipe/IAdvacedRecipeSearch';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class EditablePortion extends Vue {
  @Prop() currentQuery: IAdvancedRecipeSearch;
  @Prop() showSearchDrawer: boolean;
  @Prop() searchAgain: () => void;

  rangeInput = [0, 1];

  onRangeInput(): void {
    this.currentQuery.minDifficulty = this.rangeInput[0];
    this.currentQuery.maxDifficulty = this.rangeInput[1];
    this.searchAgain();
  }
}
</script>
