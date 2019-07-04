<template lang="pug">
nav.navbar.has-shadow.is-spaced.is-light(role='navigation' aria-label='main navigation')
    .container
        .navbar-brand
            a.navbar-item(href='/')
                b-icon(icon='book-open-page-variant')
                p.title Mommy's Cookbook
            
            a.navbar-burger.burger(role='button' aria-label='menu' aria-expanded='false' data-target='navbar')
                span(aria-hidden=true)
                span(aria-hidden=true)
                span(aria-hidden=true)
        .navbar-start
            a.navbar-item(href='/') Home
            a.navbar-item(href='/') About
        
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
export default class Navbar extends Vue { }
</script>


<style scoped>
.navbar-brand .icon {
    margin-right: 0.5rem;
}
</style>
