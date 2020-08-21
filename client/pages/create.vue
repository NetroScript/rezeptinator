<template>
  <main-layout>
    <template #content>
      <h1 class="text-center text-h3 text-md-h2">Erstelle ein Rezept</h1>
      <div class="pa-4">
        <ValidationObserver ref="observer" v-slot="{ invalid, validate }">
          <v-form :disabled="isLoading">
            <h2 class="text-h5 text-md-h4 my-2 text-center">{{ $t('CREATE.TITLEHEADER') }}</h2>
            <ValidationProvider v-slot="{ errors }" name="CREATE.TITLE" rules="required">
              <v-text-field
                v-model.trim="createRecipe.title"
                :error-messages="errors"
                :label="$t('CREATE.TITLE')"
                required
              ></v-text-field>
            </ValidationProvider>

            <v-divider class="ma-9" />
            <h2 class="text-h5 text-md-h4 my-2 text-center">{{ $t('CREATE.IMAGESHEADER') }}</h2>
            <div @drop.prevent="dragImages" @dragover.prevent>
              <v-carousel>
                <v-carousel-item v-if="previews.length === 0">
                  <v-sheet color="warning" height="100%">
                    <v-row class="fill-height" align="center" justify="center">
                      <div class="display-3 ma-4">{{ $t('CREATE.NOIMAGES') }}</div>
                    </v-row>
                  </v-sheet>
                </v-carousel-item>
                <v-carousel-item
                  v-for="(item, i) in previews"
                  :key="i"
                  :src="item"
                  reverse-transition="fade-transition"
                  transition="fade-transition"
                >
                  <v-btn
                    color="error"
                    class="ma-4 mt-12"
                    absolute
                    top
                    right
                    fab
                    @click.stop="removeImage(i)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-carousel-item>
              </v-carousel>
              <v-file-input
                v-model="files"
                multiple
                :disabled="editingDisallowed"
                prepend-icon="mdi-image"
                clearable
                :label="$t('CREATE.UPLOADIMAGES')"
                accept="image/*"
                @click:clear="allFiles = []"
                @change="calculatePreviews"
              >
                <template #selection="{index, text}">
                  <v-chip close color="accent" @click:close="removeImage(index)">
                    <v-icon left>mdi-camera</v-icon>
                    {{ text }}
                  </v-chip>
                </template>
              </v-file-input>
            </div>

            <v-divider class="ma-9" />
            <h2 class="text-h5 text-md-h4 my-2 text-center">
              {{ $t('CREATE.INGREDIENTSHEADER') }}
            </h2>

            <div v-for="(ingredient, index) in createRecipe.ingredients" class="ma-3">
              <v-row no-gutters>
                <v-col>
                  <EditablePortion v-model="createRecipe.ingredients[index]"></EditablePortion>
                </v-col>
                <v-btn icon class="mx-2 my-auto" @click="createRecipe.ingredients.splice(index, 1)">
                  <v-icon color="error">mdi-delete</v-icon>
                </v-btn>
              </v-row>
            </div>

            <div class="text-center">
              <v-btn
                class="mx-auto my-2"
                color="accent"
                @click="
                  createRecipe.ingredients.push({
                    amount: 0,
                    ingredient: 0,
                    ingredientNameIndex: 0,
                    instanceType: 0,
                    type: 1,
                  })
                "
              >
                {{ $t('CREATE.ADDINGREDIENT') }}
              </v-btn>
            </div>

            <v-divider class="ma-9" />
            <h2 class="text-h5 text-md-h4 my-2 text-center">
              {{ $t('CREATE.STEPSHEADER') }}
            </h2>

            <div v-for="(step, index) in createRecipe.recipeSteps" class="ma-3">
              <v-row no-gutters>
                <v-col>
                  <EditableRecipeStep
                    v-model="createRecipe.recipeSteps[index]"
                  ></EditableRecipeStep>
                </v-col>
                <div class="d-flex flex-column justify-center">
                  <v-btn
                    icon
                    class="mx-2 my-auto"
                    :disabled="index === 0"
                    @click="swapRecipeStep(index, index - 1)"
                  >
                    <v-icon :color="index > 0 ? 'primary' : 'gray'">mdi-arrow-up-bold</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    class="mx-2 my-auto"
                    @click="createRecipe.recipeSteps.splice(index, 1)"
                  >
                    <v-icon color="error">mdi-delete</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    class="mx-2 my-auto"
                    :disabled="index === createRecipe.recipeSteps.length - 1"
                    @click="swapRecipeStep(index, index + 1)"
                  >
                    <v-icon
                      :color="index < createRecipe.recipeSteps.length - 1 ? 'primary' : 'gray'"
                      >mdi-arrow-down-bold</v-icon
                    >
                  </v-btn>
                </div>
              </v-row>
            </div>

            <div class="text-center">
              <v-btn
                class="mx-auto my-2"
                color="accent"
                @click="
                  createRecipe.recipeSteps.push({
                    payloadNumber: 0,
                    payloadType: 0,
                    text: '',
                    time: 0,
                    type: 0,
                  })
                "
              >
                {{ $t('CREATE.ADDSTEP') }}
              </v-btn>
            </div>

            <v-divider class="ma-9" />
            <h2 class="text-h5 text-md-h4 my-2 text-center">
              {{ $t('CREATE.TAGSHEADER') }}
            </h2>

            <TagSelect v-model="createRecipe.tags" />

            <v-divider class="ma-9" />
            <h2 class="text-h5 text-md-h4 my-2 text-center">
              {{ $t('CREATE.MISCHEADER') }}
            </h2>

            <v-row no-gutters align="center" justify="center">
              <v-col lg="4" cols="6">
                <ValidationProvider
                  v-slot="{ errors }"
                  :name="$t('CREATE.COOKTIME')"
                  rules="required"
                >
                  <v-text-field
                    v-model.number="createRecipe.cookTime"
                    type="number"
                    :error-messages="errors"
                    :label="$t('CREATE.COOKTIME')"
                    class="my-4 mx-2"
                    :hide-details="errors.length <= 0"
                    dense
                    step="0.5"
                    prepend-icon="mdi-clock-outline"
                    :suffix="$t('MINUTES')"
                    required
                  >
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <v-col lg="4" cols="6">
                <ValidationProvider
                  v-slot="{ errors }"
                  :name="$t('CREATE.TOTALTIME')"
                  rules="required"
                >
                  <v-text-field
                    v-model.number="createRecipe.totalTime"
                    type="number"
                    :error-messages="errors"
                    :label="$t('CREATE.TOTALTIME')"
                    class="my-4 mx-2"
                    :hide-details="errors.length <= 0"
                    dense
                    step="0.5"
                    prepend-icon="mdi-clock-outline"
                    :suffix="$t('MINUTES')"
                    required
                  >
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <v-col lg="4" cols="12">
                <ValidationProvider
                  v-slot="{ errors }"
                  :name="$t('CREATE.PORTION')"
                  rules="required"
                >
                  <v-text-field
                    v-model.number="createRecipe.servingSize"
                    type="number"
                    :error-messages="errors"
                    :label="$t('CREATE.PORTION')"
                    class="my-4 mx-2"
                    :hide-details="errors.length <= 0"
                    dense
                    prepend-icon="mdi-account-group"
                    :suffix="$t('PORTIONS')"
                    required
                  >
                  </v-text-field>
                </ValidationProvider>
              </v-col>
              <v-col lg="12" cols="12">
                <v-subheader>
                  {{ $t('CREATE.DIFFICULTY') }}
                </v-subheader>
                <v-slider
                  v-model="createRecipe.difficulty"
                  max="1"
                  min="0"
                  step="0.05"
                  :messages="
                    $t(
                      'RECIPEDIFFICULTIES.' + Math.min(Math.floor(createRecipe.difficulty * 10), 9),
                    )
                  "
                  color="primary"
                  append-icon="mdi-circle"
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
                </v-slider>
              </v-col>
            </v-row>

            <v-divider class="ma-9" />

            <v-btn
              bottom
              :disabled="invalid || isLoading"
              block
              :loading="isLoading"
              @click="submit"
            >
              {{ $t('SEND') }}
            </v-btn>
            <v-alert v-if="invalid" class="my-4 mx-2" type="error" dense @click="validate">
              {{ $t('CREATE.INVALIDFORM') }}
            </v-alert>
            <div class="my-4">
              <v-alert
                v-for="(error, index) in additionalErrors"
                :key="`error-${index}`"
                dense
                class="my-1"
                outlined
                type="error"
              >
                {{ $t(error) }}
              </v-alert>
            </div>
          </v-form>
        </ValidationObserver>
      </div>
    </template>
  </main-layout>
</template>

<script lang="ts">
import EditablePortion from '~/components/EditablePortion.vue';
import EditableRecipeStep from '~/components/EditableRecipeStep.vue';
import TagSelect from '~/components/TagSelect.vue';
import MainLayout from '~/layout/default.vue';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { ICreateRecipe } from '@common/Model/Recipe/Recipe';
import { RecipeStepTypes } from '@common/Model/Recipe/RecipeStep';

import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import responseErrorHandler from '~/utils/responseErrorHandler';

extend('required', { ...required });

@Component({
  components: {
    TagSelect,
    EditableRecipeStep,
    MainLayout,
    ValidationObserver,
    ValidationProvider,
    EditablePortion,
  },
  middleware: 'auth',
})
export default class CreateRecipePage extends Vue {
  // The recipe which is being created
  createRecipe: ICreateRecipe = {
    cookTime: 15,
    difficulty: 0,
    images: [],
    ingredients: [
      {
        amount: 0,
        ingredient: 0,
        ingredientNameIndex: 0,
        instanceType: 0,
        type: 1,
      },
    ],
    language: AvailableLanguages.German,
    recipeSteps: [
      {
        payloadNumber: 0,
        payloadType: 0,
        text: '',
        time: 0,
        type: RecipeStepTypes.Normal,
      },
    ],
    servingSize: 1,
    tags: [],
    title: '',
    totalTime: 30,
  };

  editingDisallowed = false;
  isLoading = false;
  additionalErrors: string[] = [];

  // Keep track of all files
  allFiles: File[] = [];
  // The files specifically in the upload
  files: File[] = [];
  // Strings representing the images
  previews: string[] = [];

  async submit(): Promise<void> {
    if (
      !this.isLoading &&
      (await (this.$refs.observer as Vue & { validate: () => boolean }).validate())
    ) {
      this.isLoading = true;

      // Upload the images and then save their ids in the recipe

      const formData = new FormData();

      this.files.forEach((file) => {
        formData.append('file', file, file.name);
      });

      try {
        const uploadedFiles = await this.$axios.$post<{ success: boolean; ids: number[] }>(
          '/images',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        this.createRecipe.images = uploadedFiles.ids;
      } catch (e) {
        this.additionalErrors.push('ERROR.FAILEDIMAGEUPLOAD');
      }

      try {
        const uploadedRecipe = await this.$axios.$post<{ success: boolean; id: number }>(
          'recipes',
          this.createRecipe,
        );

        await this.$router.push('/show/' + uploadedRecipe.id);
      } catch (error) {
        this.additionalErrors = responseErrorHandler(error);
      }

      this.isLoading = false;
    }
  }

  swapRecipeStep(oldIndex, newIndex) {
    this.$set(
      this.createRecipe.recipeSteps,
      newIndex,
      this.createRecipe.recipeSteps.splice(oldIndex, 1, this.createRecipe.recipeSteps[newIndex])[0],
    );
  }

  dragImages(event: DragEvent) {
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/'),
    );
    console.log(files);
    this.files = [];
    this.calculatePreviews(files);
  }

  // Remove a single image in the image list
  removeImage(index: number) {
    this.allFiles.splice(index, 1);
    this.files.splice(index, 1);
    this.previews.splice(index, 1);
  }

  // Parse the new selected files and create previews for all of them
  async calculatePreviews(files: File[]): Promise<void> {
    // Only change files when the list is changed, this is why deleting requires an additional event
    if (this.allFiles.length == 0 || !this.allFiles.every((file, index) => file == files[index])) {
      this.allFiles = [...this.allFiles, ...files];
      this.previews = [];
      for (const file of this.allFiles) {
        this.previews.push(await this.getImage(file));
      }
      this.files = [...this.allFiles];
    }
  }

  // Turn a File from the form into a data url for display
  getImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}
</script>
