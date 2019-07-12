<template lang="pug">
div.parent
    b-tooltip(:label='title' position='is-bottom' animated)
        div.rating
            b-icon(:icon='icon' size='is-large')
            div
                span.score.is-size-3 {{ rating }}
                span.slash /
                span.total 10
</template>



<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CookbookRecipeRating extends Vue {
    @Prop() private rating!: string;
    @Prop() private title!: string;
    @Prop() private icon!: string;
}
</script>


<style scoped>
.parent {
    flex: 1;
    margin-right: 1rem;
    margin-left: 1rem;
}

.rating {
    display: block;
    flex: 1;
    flex-direction: row;
    align-items: center;
}
.rating .icon {
    flex: 1;
}
.score {
    padding-bottom: 0.25rem;
}
.slash,
.total {
    padding-top: 0.5rem;
}
@media (min-width: 1023px) {
    .rating {
        display: flex;
    }
}
</style>

