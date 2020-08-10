<template>
  <ValidationObserver ref="observer" v-slot="{ invalid }">
    <form @submit="submitFunction">
      <ValidationProvider
        v-if="usernameRequired"
        v-slot="{ errors }"
        name="Name"
        rules="required|max:50"
      >
        <v-text-field
          v-model="username"
          :error-messages="errors"
          label="Name"
          required
        ></v-text-field>
      </ValidationProvider>
      <ValidationProvider v-slot="{ errors }" name="Email" rules="required|email">
        <v-text-field
          v-model="email"
          :error-messages="errors"
          label="E-mail"
          required
        ></v-text-field>
      </ValidationProvider>
      <ValidationProvider v-slot="{ errors }" name="password" rules="required|min:8|max:100">
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :error-messages="errors"
          :type="showPassword ? 'text' : 'password'"
          :label="$t('AUTHENTICATION.ENTER_PASSWORD')"
          :hint="$t('AUTHENTICATION.PASSWORD_HINT')"
          required
          @click:append="showPassword = !showPassword"
        ></v-text-field>
      </ValidationProvider>
      <v-btn bottom :disabled="invalid" class="" block :loading="isLoading" @click="submit">{{
        usernameRequired ? $t('AUTHENTICATION.REGISTER') : $t('AUTHENTICATION.LOGIN')
      }}</v-btn>
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
</template>

<script lang="ts">
import 'reflect-metadata';
import { required, email, min, max } from 'vee-validate/dist/rules';
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate';
import { Vue, Component, Prop } from 'vue-property-decorator';

setInteractionMode('eager');

extend('required', { ...required });

extend('email', { ...email });

extend('min', { ...min });

extend('max', { ...max });

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class AuthenticationForm extends Vue {
  @Prop({ required: true }) usernameRequired!: boolean;
  @Prop({ required: true }) submitFunction!: (data: {
    username?: string;
    email: string;
    password: string;
  }) => Promise<string[]>;

  async submit(): Promise<void> {
    if (
      !this.isLoading &&
      (await (this.$refs.observer as Vue & { validate: () => boolean }).validate())
    ) {
      this.isLoading = true;
      this.additionalErrors = await this.submitFunction({
        username: this.username,
        email: this.email,
        password: this.password,
      });
      this.isLoading = false;
    }
  }

  additionalErrors: string[] = [];

  validate(): boolean {
    return true;
  }

  isLoading = false;

  username = '';
  email = '';
  password = '';

  showPassword = false;
}
</script>
