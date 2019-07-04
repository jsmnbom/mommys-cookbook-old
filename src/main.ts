import Vue from 'vue';
import './registerServiceWorker';

import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

import VueRouter from 'vue-router';

import App from './App.vue';
import CookbookLibrary from './components/CookbookLibrary.vue';
import CookbookItem from './components/CookbookItem.vue';

Vue.use(Buefy);
Vue.use(VueRouter);

Vue.config.productionTip = false;

const routes = [
  { path: '/', component: CookbookLibrary },
  { path: '/cookbook/:id', name: 'cookbook', component: CookbookItem },
];

const router = new VueRouter({
  routes,
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount('#app');
