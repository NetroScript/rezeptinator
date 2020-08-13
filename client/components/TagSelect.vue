<template>
  <v-autocomplete
    v-model="value"
    :items="displayTags"
    hide-details
    :no-data-text="$t('CREATE.NODATA')"
    class="my-1 mx-2"
    :label="$t('CREATE.SEARCHTAGS')"
    solo
    dense
    multiple
    @change="reEmit"
  >
    <template v-slot:selection="data">
      <v-chip
        v-bind="data.attrs"
        :input-value="data.selected"
        close
        color="primary"
        @click:close="
          value.splice(data.index, 1);
          reEmit;
        "
      >
        <v-icon left>
          {{ data.item.icon }}
        </v-icon>
        {{ data.item.text }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>
<script lang="ts">
import 'reflect-metadata';
import { ITag } from '@common/Model/Recipe';
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import { IconsForTagGroups } from '~/utils/enumToIcon';

interface ListEntry {
  text?: string;
  value?: number;
  icon?: string;
  group?: string;
  header?: string;
  divider?: boolean;
}

@Component
export default class TagSelect extends Vue {
  @Prop() value: number[];

  displayTags: ListEntry[] = [];

  reEmit() {
    this.$emit('input', this.value);
  }

  async mounted(): Promise<void> {
    try {
      this.displayTags = (await this.$axios.$get<ITag[]>('recipes/tags/'))
        .map((tag) => {
          return {
            text: tag.tag,
            icon: IconsForTagGroups[tag.group] || 'mdi-pound',
            value: tag.id,
            group: tag.group,
          };
        })
        // Have all groups next to each other
        .sort((a, b) => {
          return a.group.localeCompare(b.group);
        });
      let previousGroup = '';

      // Add headers for all groups
      for (let index = 0; index < this.displayTags.length; index++) {
        let tag = this.displayTags[index];
        if (tag.group != previousGroup) {
          previousGroup = tag.group;
          this.displayTags.splice(index++, 0, { divider: true });
          this.displayTags.splice(index++, 0, { header: tag.group });
          this.displayTags.splice(index++, 0, { divider: true });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
</script>
