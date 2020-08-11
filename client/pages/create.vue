<template>
  <main-layout>
    <template #content>
      <h1 class="text-center text-h3 text-md-h2">Erstelle ein Rezept</h1>
      <div class="pa-4">
        <ValidationObserver ref="observer" v-slot="{ invalid }">
          <form>
            <EditablePortion v-model="testIngredient"></EditablePortion>
            <h2 class="text-h5 text-md-h4 my-2 text-center">{{ $t('CREATE.TITLEHEADER') }}</h2>
            <ValidationProvider v-slot="{ errors }" name="email" rules="required">
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
import MainLayout from '@client/layout/default.vue';
import { ICreatePortion } from '@common/Model/Portion';
import { ICreateRecipe } from '@common/Model/Recipe';

import '@nuxtjs/axios';
import { Component, Vue } from 'nuxt-property-decorator';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import EditablePortion from '@client/components/EditablePortion.vue';

extend('required', { ...required });

//eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - needed because of some reason the editor won't accept the property middleware despite it being defined
@Component({
  components: { MainLayout, ValidationObserver, ValidationProvider, EditablePortion },
  middleware: 'auth',
})
export default class CreateRecipePage extends Vue {
  // The recipe which is being created
  createRecipe: ICreateRecipe = {
    cookTime: 0,
    difficulty: 0,
    images: [],
    ingredients: [],
    language: undefined,
    recipeSteps: [],
    servingSize: 0,
    tags: [],
    title: '',
    totalTime: 0,
  };

  testIngredient: ICreatePortion = {
    amount: 0,
    ingredient: 0,
    ingredientNameIndex: 0,
    instanceType: 0,
    type: 0,
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
