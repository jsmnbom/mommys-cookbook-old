import Vue from 'vue';
import './registerServiceWorker';

import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

import VueRouter from 'vue-router';

import { StorePlugin } from './StorePlugin';

import App from './App.vue';
import CookbookLibrary from './components/CookbookLibrary.vue';
import CookbookItem from './components/CookbookItem.vue';
import HomeView from './components/HomeView.vue';

Vue.use(Buefy);
Vue.use(VueRouter);
Vue.use(StorePlugin);

Vue.config.productionTip = false;

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/library', name: 'library', component: CookbookLibrary },
  { path: '/cookbook/:id', name: 'cookbook', component: CookbookItem },
];

const router = new VueRouter({
  routes,
  linkExactActiveClass: 'is-active',
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount('#app');
