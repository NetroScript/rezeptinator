import Fan from '~/components/icons/Fan.vue';
import FullGrill from '~/components/icons/FullGrill.vue';
import GrillFan from '~/components/icons/GrillFan.vue';
import LowerHeat from '~/components/icons/LowerHeat.vue';
import LowerUpperHeat from '~/components/icons/LowerUpperHeat.vue';
import PartGrill from '~/components/icons/PartGrill.vue';
import UpperHeat from '~/components/icons/UpperHeat.vue';

export default {
  theme: {
    dark: false,
    themes: {
      dark: {
        primary: '#689F38',
        accent: '#FDD835',
        secondary: '#827717',
        success: '#4CAF50',
        info: '#2196F3',
        warning: '#FB8C00',
        error: '#FF5252',
      },
      light: {
        primary: '#9CCC65',
        accent: '#FDD835',
        secondary: '#827717',
        success: '#4CAF50',
        info: '#2196F3',
        warning: '#FB8C00',
        error: '#FF5252',
      },
    },
  },
  icons: {
    values: {
      lowerheat: {
        component: LowerHeat,
        props: {
          name: 'lowerheat',
        },
      },
      upperheat: {
        component: UpperHeat,
        props: {
          name: 'upperheat',
        },
      },
      lowerupperheat: {
        component: LowerUpperHeat,
        props: {
          name: 'lowerupperheat',
        },
      },
      fullgrill: {
        component: FullGrill,
        props: {
          name: 'fullgrill',
        },
      },
      partgrill: {
        component: PartGrill,
        props: {
          name: 'partgrill',
        },
      },
      fan: {
        component: Fan,
        props: {
          name: 'fan',
        },
      },
      grillfan: {
        component: GrillFan,
        props: {
          name: 'grillfan',
        },
      },
    },
  },
};
