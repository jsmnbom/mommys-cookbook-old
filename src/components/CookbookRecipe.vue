<template lang='pug'>
section
    b-collapse.card(aria-id='contentIdForA11y3' :open='false')
        div.card-header(slot='trigger' slot-scope='props' role='button' aria-controls='contentIdForA11y3')
            figure.image.is-128x128
                img(src='https://bulma.io/images/placeholders/128x128.png')

            .text
                span.title {{ value.title }}
                span.subtitle {{ value.subtitle }}
                b-taglist.tags
                    b-tag(type='is-info' v-for='tag in value.tags' :key='tag') {{ tag }}

            .ratings
                CookbookRecipeRating(icon='repeat', :rating='value.ratings.repeat' title='Repeat of this dish')
                CookbookRecipeRating(icon='currency-usd' :rating='value.ratings.cost' title='Cost of this dish')
                CookbookRecipeRating(icon='timer' :rating='value.ratings.time' title='Time/difficulty of cooking this dish')
                CookbookRecipeRating(icon='heart', :rating='value.ratings.tastiness' title='Tastiness of this dish')
                CookbookRecipeRating(icon='checkbox-marked-circle', :rating='total' title='Total dish score')

            a.card-header-icon
                b-icon(:icon='props.open ? "menu-down" : "menu-up"' size='is-medium')

        .card-content
            .columns
                .column.contnet.is-two-thirds Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris.
                .column
                    b-field(label='Title' labelPosition='on-border' v-if='editing')
                        b-input(v-model.trim='value.title')
                    b-field(label='Subtitle' labelPosition='on-border' v-if='editing')
                        b-input(v-model.trim='value.subtitle')
                    b-field(label='Tags' labelPosition='on-border' v-if='editing')
                        b-taginput(v-model='value.tags' ellipsis icon='label' placeholder='Add a tag')
                    br( v-if='editing')
                    CookbookRecipeIngredients(:editing='editing' v-model='value.ingredients')
                    br( v-if='editing')
                    fieldset.controls(v-if='editing')
                        b-field(label='Cost')
                            b-numberinput(controls-position='compact' min=0 max=10 v-model.number='value.ratings.cost')
                        b-field(label='Time/difficulty')
                            b-numberinput(controls-position='compact' min=0 max=10 v-model.number='value.ratings.time')
                        b-field(label='Tastiness')
                            b-numberinput(controls-position='compact' min=0 max=10 v-model.number='value.ratings.tastiness')


        footer.card-footer
            a.card-footer-item(@click='toggleEdit')
                span(v-if='editing') Save
                span(v-else) Edit
            a.card-footer-item Delete
</template>
        

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import CookbookRecipeRating from './CookbookRecipeRating.vue';
import CookbookRecipeIngredients from './CookbookRecipeIngredients.vue';
import RecipeValue from '../RecipeValue';

@Component({
    components: {
        CookbookRecipeRating,
        CookbookRecipeIngredients,
    },
})
export default class CookbookRecipe extends Vue {
    @Prop(RecipeValue) private readonly value: RecipeValue | undefined;

    private editing = false;
    private get total() {
        return this.value ? Math.round((
            this.value.ratings.repeat +
            this.value.ratings.cost +
            this.value.ratings.time +
            this.value.ratings.tastiness
        ) / 4) : 0;
    }

    private toggleEdit() {
        this.editing = !this.editing;
    }
}
</script>

<style scoped>
.ratings {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.card-header .text {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    padding: 0.75rem;
    flex-direction: column;
}
.card-header .text .subtitle {
    margin-bottom: 0.25rem;
}
.b-numberinput >>> div {
    width: 100%;
}
</style>