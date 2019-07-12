import Vue from 'vue';
import { store } from './StorePlugin';

declare module 'vue/types/vue' {
  interface Vue {
    $store: typeof store;
  }
}
