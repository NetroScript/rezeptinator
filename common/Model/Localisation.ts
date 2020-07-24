import { StringMap, TOptionsBase } from 'i18next';

export interface LocalisationInformation {
  key: string | string[];
  options?: (TOptionsBase & StringMap) | string;
}
