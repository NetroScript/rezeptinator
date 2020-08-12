<template>
  <main-layout>
    <template #content>
      <h1 class="text-center text-h3 text-md-h2">Erstelle ein Rezept</h1>
      <div class="pa-4">
        <ValidationObserver ref="observer" v-slot="{ invalid }">
          <form>
            <h2 class="text-h5 text-md-h4 my-2 text-center">{{ $t('CREATE.TITLEHEADER') }}</h2>
            <ValidationProvider v-slot="{ errors }" name="CREATE.TITLE" rules="required">
              <v-text-field
                v-model.trim="createRecipe.title"
                :error-messages="errors"
                :label="$t('CREATE.TITLE')"
                required
              ></v-text-field>
            </ValidationProvider>

            <v-divider class="ma-5"></v-divider>
            <h2 class="text-h5 text-md-h4 my-2 text-center">{{ $t('CREATE.IMAGESHEADER') }}</h2>
            <div @drop.prevent="dragImages" @dragover.prevent>
              <v-carousel>
                <v-carousel-item v-if="previews.length === 0">
                  <v-sheet color="warning" height="100%">
                    <v-row class="fill-height" align="center" justify="center">
                      <div class="display-3">{{ $t('CREATE.NOIMAGES') }}</div>
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

            <v-divider class="ma-5"></v-divider>
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

            <v-divider class="ma-5"></v-divider>
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
                <v-btn icon class="mx-2 my-auto" @click="createRecipe.recipeSteps.splice(index, 1)">
                  <v-icon color="error">mdi-delete</v-icon>
                </v-btn>
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
                    type: RecipeStepTypes.Normal,
                  })
                "
              >
                {{ $t('CREATE.ADDSTEP') }}
              </v-btn>
            </div>

            <v-btn bottom :disabled="invalid" class="" block :loading="isLoading" @click="submit">
              {{ $t('SEND') }}
            </v-btn>
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
          </form>
        </ValidationObserver>
      </div>
      <v-divider class="ma-5"></v-divider>
    </template>
  </main-layout>
</template>

<script lang="ts">
import EditablePortion from '@client/components/EditablePortion.vue';
import MainLayout from '@client/layout/default.vue';
import { ICreateRecipe } from '@common/Model/Recipe';
import { RecipeStepTypes } from '@common/Model/RecipeStep';

import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import EditableRecipeStep from '@client/components/EditableRecipeStep.vue';

extend('required', { ...required });

@Component({
  components: {
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
    cookTime: 0,
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
    language: undefined,
    recipeSteps: [
      {
        payloadNumber: 0,
        payloadType: 0,
        text: '',
        time: 0,
        type: RecipeStepTypes.Normal,
      },
    ],
    servingSize: 0,
    tags: [],
    title: '',
    totalTime: 0,
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

      // TODO: Send create Recipe to Server

      this.isLoading = false;
    }
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
