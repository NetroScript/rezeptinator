<template>
  <v-card outlined>
    <v-row justify="center">
      <v-dialog v-model="showAddIngredientDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ $t('CREATE.CREATENEWINGREDIENT') }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="currentCustomIngredient.name"
                    :label="$t('CREATE.INGREDIENTNAME')"
                    :error-messages="customIngredientErrors"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :loading="loadingCustomIngredient"
              :disabled="loadingCustomIngredient"
              color="secondary"
              text
              @click="closeAddIngredient"
              >{{ $t('CANCEL') }}</v-btn
            >
            <v-btn
              :loading="loadingCustomIngredient"
              :disabled="loadingCustomIngredient"
              color="secondary"
              text
              @click="saveAddIngredient"
              >{{ $t('CREATE.SAVEINGREDIENT') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-row no-gutters align="center" justify="center">
          <v-col lg="3" cols="5">
            <ValidationProvider v-slot="{ errors }" name="CREATE.INGREDIENTAMOUNT" rules="required">
              <v-text-field
                v-model.number="value.amount"
                :error-messages="errors"
                :label="$t('CREATE.INGREDIENTAMOUNT')"
                type="number"
                class="mt-2 mx-2"
                step="0.01"
                :hide-details="errors.length <= 0"
                dense
                required
                @change="reEmit"
              ></v-text-field>
            </ValidationProvider>
          </v-col>
          <v-col lg="3" cols="7">
            <ValidationProvider
              v-slot="{ errors }"
              :name="$t('PORTIONTYPESSELECT.' + value.instanceType)"
              rules="required"
            >
              <v-select
                v-model="value.type"
                :items="types"
                :error-messages="errors"
                :label="$t('PORTIONTYPESSELECT.' + value.instanceType)"
                data-vv-name="select"
                class="mt-2 mx-2"
                :hide-details="errors.length <= 0"
                dense
                required
                @change="reEmit"
              ></v-select>
            </ValidationProvider>
          </v-col>
          <v-col lg="6" cols="12">
            <ValidationProvider v-slot="{ errors }" name="CREATE.INGREDIENT" rules="ingredient">
              <v-autocomplete
                v-model="selectedIngredient"
                :search-input.sync="ingredientSearchInput"
                :items="displayIngredients"
                :loading="loadingIngredients"
                clearable
                :hide-details="errors.length <= 0"
                :no-data-text="$t('CREATE.NODATAINGREDIENT')"
                class="my-1 mx-2"
                :error-messages="errors"
                :label="$t('CREATE.SEARCHINGREDIENT')"
                solo
              >
                <template #append>
                  <v-tooltip v-model="showAddIngredientTooltip" left>
                    <template #activator="{attrs, on}">
                      <v-btn icon v-bind="attrs" v-on="on" @click="showAddIngredientDialog = true">
                        <v-icon color="info" large>mdi-plus-box</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('CREATE.CREATENEWINGREDIENT') }}</span>
                  </v-tooltip>
                </template>
              </v-autocomplete>
            </ValidationProvider>
          </v-col>
        </v-row>
      </v-col>
      <div style="margin: auto;">
        <v-btn-toggle
          v-model="value.instanceType"
          dense
          borderless
          mandatory
          color="primary"
          @change="typeOfPortionUpdated"
        >
          <v-btn :x-small="$vuetify.breakpoint.smAndDown" height="58px">
            <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-weight-kilogram</v-icon>
            <span class="hidden-sm-and-down">{{ $t('PORTIONTYPES.0') }}</span>
          </v-btn>
          <v-btn :x-small="$vuetify.breakpoint.smAndDown" height="58px">
            <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-egg-outline</v-icon>
            <span class="hidden-sm-and-down">{{ $t('PORTIONTYPES.1') }}</span>
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { PiecePortion } from '@common/Classes/PiecePortion';
import { UnitPortion } from '@common/Classes/UnitPortion';
import { ICreatePortion } from '@common/Model/Recipe/ICreatePortion';
import {
  ICreateIngredient,
  IIngredient,
  IngredientCategories,
  Vegan,
} from '@common/Model/Ingredient';
import { PortionTypes } from '@common/Model/Recipe/Portion';
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';
import 'reflect-metadata';
import { extend, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import Timeout = NodeJS.Timeout;

extend('required', { ...required });
extend(
  'ingredient',
  Object.assign({}, required, {
    validate: (value) => !isNaN(value.id),
  }),
);

interface ListEntry {
  text: string;
  value: { id: number; nameIndex: number };
}

@Component({
  components: { ValidationProvider },
})
export default class EditablePortion extends Vue {
  @Prop() value: ICreatePortion;

  typeOfPortionUpdated() {
    this.value.type = 1;
    this.reEmit();
  }

  loadingIngredients = false;

  // Only do a new search if the result wouldn't already be included in the previous searches
  cachedSearches: string[] = [];
  foundIngredients: Map<number, IIngredient> = new Map();

  customIngredients: ICreateIngredient[] = [];
  showAddIngredientTooltip = false;
  showAddIngredientDialog = false;
  loadingCustomIngredient = false;
  customIngredientErrors: string[] = [];
  currentCustomIngredient: ICreateIngredient = {
    allergies: [],
    category: IngredientCategories.Miscellaneous,
    name: '',
    vegan: Vegan.Neither,
  };

  currentIngredient: IIngredient;

  selectedIngredient: { id: number; nameIndex: number } = { id: NaN, nameIndex: 0 };

  debounceIngredient: Timeout;
  updateIngredients = 0;

  ingredientSearchInput = '';

  get types(): { value: number; text: string }[] {
    if (this.value.instanceType == PortionTypes.Unit) {
      return UnitPortion.getCandidates().map((data, index) => {
        return { text: this.$t(data.key, data.options) as string, value: index };
      });
    } else {
      return PiecePortion.getCandidates().map((data, index) => {
        return { text: this.$t(data.key, data.options) as string, value: index };
      });
    }
  }

  get displayIngredients(): ListEntry[] {
    const data: ListEntry[] = [];
    this.updateIngredients;
    this.foundIngredients.forEach((ingredient) => {
      data.push({
        text: ingredient.name,
        value: { id: ingredient.id, nameIndex: 0 },
      });
      ingredient.alias.forEach((alias, index) => {
        data.push({
          text: alias,
          value: { id: ingredient.id, nameIndex: index + 1 },
        });
      });
    });

    this.customIngredients.forEach((ingredient, index) => {
      data.push({
        text: ingredient.name,
        value: { id: -(index + 1), nameIndex: 0 },
      });
    });

    return data;
  }

  @Watch('selectedIngredient')
  onIngredientChange(newValue: { id: number; nameIndex: number }) {
    if (newValue != undefined) {
      this.value.ingredientNameIndex = newValue.nameIndex;
      if (newValue.id < 0) {
        this.value.ingredient = undefined;
        this.value.newIngredient = this.customIngredients[-(newValue.id + 1)];
        this.currentIngredient = Object.assign(
          { alias: [] },
          this.customIngredients[-(newValue.id + 1)],
        );
      } else {
        this.value.newIngredient = undefined;
        this.value.ingredient = newValue.id;
        this.currentIngredient = this.foundIngredients.get(newValue.id);
      }
      this.reEmit();
    }
  }

  @Watch('ingredientSearchInput')
  onSearch(newValue: string) {
    if (typeof newValue === 'string' && newValue.length > 1) this.loadingIngredients = true;
    clearTimeout(this.debounceIngredient);

    this.debounceIngredient = setTimeout(() => {
      this.searchIngredients();
    }, 200);
  }

  closeAddIngredient(): void {
    this.showAddIngredientDialog = false;
  }

  async saveAddIngredient(): Promise<void> {
    const name = this.currentCustomIngredient.name;

    if (name.length <= 1) {
      this.customIngredientErrors = [this.$t('VALIDATION.INGREDIENT') as string];
      return;
    }

    // First check if an ingredient with this name doesn't already exist
    this.loadingCustomIngredient = true;

    // Get all ingredients with that supplied name
    const ingredients = await this.fetchIngredients(name);

    let foundExisting = false;

    // Iterate all the names of the ingredients which matched
    for (let i = 0; i < ingredients.length && !foundExisting; i++) {
      let ingredient = ingredients[i];
      if (ingredient.name == name) {
        foundExisting = true;
        this.selectedIngredient = { id: ingredient.id, nameIndex: 0 };
      } else {
        for (let index = 0; index < ingredient.alias.length && !foundExisting; index++) {
          let alias = ingredient.alias[index];
          if (alias == name) {
            foundExisting = true;
            this.selectedIngredient = { id: ingredient.id, nameIndex: index + 1 };
          }
        }
      }
    }

    // If none matched create the current as a custom ingredient
    if (!foundExisting) {
      this.customIngredients.push(Object.assign({}, this.currentCustomIngredient));
      this.selectedIngredient = { id: -this.customIngredients.length, nameIndex: 0 };
    }

    // Reset all values to the initial state
    this.currentCustomIngredient.name = '';
    this.showAddIngredientDialog = false;
    this.loadingCustomIngredient = false;
  }

  async searchIngredients() {
    if (typeof this.ingredientSearchInput === 'string' && this.ingredientSearchInput.length > 1) {
      await this.fetchIngredients(this.ingredientSearchInput);
      this.loadingIngredients = false;
    } else {
      this.loadingIngredients = false;
    }
  }

  async fetchIngredients(name: string): Promise<IIngredient[]> {
    const query = name.toLowerCase();

    // Check if we previously already would have obtained the ingredient with a search
    // If so use the saved values to return the ingredient instead of making another request
    if (this.cachedSearches.some((search) => query.includes(search))) {
      return Array.from(this.foundIngredients.values()).filter((ingredient) => {
        return (
          ingredient.name.toLowerCase().includes(query) ||
          (ingredient.alias != undefined &&
            ingredient.alias.some((alias) => alias.toLowerCase().includes(query)))
        );
      });
    }

    const data: IIngredient[] = await this.$axios.$get('ingredients/' + query);
    data.forEach((ingredient) => {
      this.foundIngredients.set(ingredient.id, ingredient);
    });
    this.updateIngredients++;
    this.cachedSearches.push(query);

    return data;
  }

  reEmit() {
    this.$emit('input', this.value);
  }
}
</script>
