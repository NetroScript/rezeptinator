import { Context } from '@nuxt/types';
import { configure } from 'vee-validate';

export default function ({ app }: Context) {
  configure({
    defaultMessage: (field, values) => {
      values._field_ = app.i18n.t(`${field.toUpperCase()}`);
      return app.i18n.t(`VALIDATION.${values._rule_.toUpperCase()}`, values) as string;
    },
  });
}
