<template>
  <v-card outlined>
    <ValidationProvider v-slot="{ errors }" name="CREATE.STEPDESCRIPTION" rules="required">
      <v-textarea
        :key="$vuetify.breakpoint.width"
        v-model="value.text"
        :error-messages="errors"
        :label="$t('CREATE.STEPDESCRIPTION')"
        class="my-4 mx-2"
        :hide-details="errors.length <= 0"
        dense
        rows="1"
        auto-grow
        required
        @change="reEmit"
      ></v-textarea>
    </ValidationProvider>
    <v-row no-gutters align="center" justify="center">
      <v-col lg="3" cols="7">
        <ValidationProvider v-slot="{ errors }" :name="$t('CREATE.TIME')" rules="required">
          <v-text-field
            v-model.number="value.time"
            type="number"
            :error-messages="errors"
            :label="$t('CREATE.TIME')"
            class="my-4 mx-2"
            :hide-details="errors.length <= 0"
            dense
            step="0.5"
            prepend-icon="mdi-clock-outline"
            :suffix="$t('MINUTES')"
            required
            @change="reEmit"
          >
          </v-text-field>
        </ValidationProvider>
      </v-col>
      <v-col v-if="value.type == 1" lg="3" cols="6">
        <ValidationProvider
          v-slot="{ errors }"
          :name="$t('RECIPESTEPTYPESSELECT.' + value.type)"
          rules="required"
        >
          <v-select
            v-model="value.payloadType"
            :items="types"
            :error-messages="errors"
            :label="$t('RECIPESTEPTYPESSELECT.' + value.type)"
            :prepend-icon="ovenIcon"
            data-vv-name="select"
            class="my-4 mx-2"
            :hide-details="errors.length <= 0"
            dense
            required
            @change="reEmit"
          ></v-select>
        </ValidationProvider>
      </v-col>
      <v-col v-if="value.type == 1" lg="3" cols="6">
        <ValidationProvider v-slot="{ errors }" :name="$t('CREATE.DEGREE')" rules="required">
          <v-text-field
            v-model.number="value.payloadNumber"
            type="number"
            :error-messages="errors"
            :label="$t('CREATE.DEGREE')"
            class="my-4 mx-2"
            :hide-details="errors.length <= 0"
            dense
            prepend-icon="mdi-thermometer"
            suffix="°C"
            required
            @change="reEmit"
          >
          </v-text-field>
        </ValidationProvider>
      </v-col>

      <v-btn-toggle
        v-model="value.type"
        dense
        borderless
        mandatory
        color="primary"
        @change="reEmit"
      >
        <v-btn :x-small="$vuetify.breakpoint.smAndDown" height="58px">
          <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-text</v-icon>
          <span class="hidden-sm-and-down">{{ $t('RECIPESTEPTYPES.0') }}</span>
        </v-btn>
        <v-btn :x-small="$vuetify.breakpoint.smAndDown" height="58px">
          <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-stove</v-icon>
          <span class="hidden-sm-and-down">{{ $t('RECIPESTEPTYPES.1') }}</span>
        </v-btn>
        <v-btn :x-small="$vuetify.breakpoint.smAndDown" height="58px">
          <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-pot-steam</v-icon>
          <span class="hidden-sm-and-down">{{ $t('RECIPESTEPTYPES.2') }}</span>
        </v-btn>
        <v-btn :x-small="$vuetify.breakpoint.smAndDown" height="58px">
          <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-sleep</v-icon>
          <span class="hidden-sm-and-down">{{ $t('RECIPESTEPTYPES.3') }}</span>
        </v-btn>
      </v-btn-toggle>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IRecipeStep } from '@common/Model/Recipe/IRecipeStep';
import { OvenTypes, RecipeStepTypes } from '@common/Model/Recipe/RecipeStep';
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import 'reflect-metadata';
import { extend, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { IconsForOvenTypes } from '@client/utils/enumToIcon';

extend('required', { ...required });

@Component({
  components: { ValidationProvider },
})
export default class EditablePortion extends Vue {
  @Prop() value: IRecipeStep;

  get ovenIcon() {
    return IconsForOvenTypes[this.value.payloadType as OvenTypes];
  }

  get types(): { value: number; text: string }[] {
    if (this.value.type == RecipeStepTypes.Oven) {
      return Object.keys(OvenTypes)
        .filter((value) => !(parseInt(value) >= 0))
        .map((entry) => {
          return {
            value: OvenTypes[entry],
            text: this.$t('OVENTYPES.' + OvenTypes[entry]) as string,
          };
        });
    } else {
      return [];
    }
  }

  reEmit() {
    this.$emit('input', this.value);
  }
}
</script>
