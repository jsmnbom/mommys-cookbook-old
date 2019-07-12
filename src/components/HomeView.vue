<template lang="pug">
div
    section.hero.is-medium.is-primary.is-bold
        .hero-body
            .container
                h1.title.is-size-1 Mommy's cookbook
                h2.subtitle.is-italic For all your little cookbook needs
    section.section
        .container
            .content
                h1 What is mommy's cookbook?
                p Mommy's cookbook is a collaborative and featureful cookbook and recipe manager.
                p(v-if='$store.user') Click the button below to get started.
                p(v-else) Login to get started.
            .level(v-if='$store.user')
                .level-left
                    b-button.level-item(size='is-large' type='is-primary' tag='router-link' :to="{ name: 'library' }") Go to my cookbooks
</template>



<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class HomeView extends Vue {
}
</script>


<style scoped>

</style>

