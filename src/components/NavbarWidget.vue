<template lang="pug">
nav.navbar.has-shadow.is-spaced.is-light(role='navigation' aria-label='main navigation')
    .container
        .navbar-brand
            router-link.navbar-item(:to="{ name: 'home' }" exact-active-class='')
                b-icon(icon='book-open-page-variant')
                p.title Mommy's Cookbook
            
            a.navbar-burger.burger(role='button' aria-label='menu' aria-expanded='false' data-target='navbar' @click='burgerIsActive = !burgerIsActive;' :class='{"is-active": burgerIsActive}')
                span(aria-hidden=true)
                span(aria-hidden=true)
                span(aria-hidden=true)
        .navbar-menu(:class='{"is-active": burgerIsActive}')
            .navbar-start
                router-link.navbar-item(:to="{ name: 'home' }") Home
                router-link.navbar-item(:to="{ name: 'library' }" v-if='$store.user') My cookbooks
            
            .navbar-end
                .navbar-item
                    LoginWidget
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

import LoginWidget from './LoginWidget.vue';

@Component({
    components: {
        LoginWidget,
    },
})
export default class Navbar extends Vue {
    private burgerIsActive = false;
}
</script>


<style scoped>
.navbar-brand .icon {
    margin-right: 0.5rem;
}
</style>
