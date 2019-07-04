<template lang='pug'>
div
    div.recipeContainer(v-for='(recipeValue, index) in recipeValues')
        CookbookRecipe(v-model='recipeValues[index]')

</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

import CookbookRecipe from './CookbookRecipe.vue';
import RecipeValue from '../RecipeValue';


@Component({
    components: {
        CookbookRecipe,
    },
})
export default class CookbookItem extends Vue {
    private recipeValues: RecipeValue[] = [];

    private created() {
        this.recipeValues = [];

        console.log(this.$route.params);
        const id = this.$route.params.id;

        for (let i = 0; i <= 10; i++) {
            if (id === '0') {
                this.recipeValues.push(
                    new RecipeValue(
                        'Raspberry Pie',
                        'A pie with raspberries... duh',
                        ['Desert', 'π'],
                        [
                            '500g Raspberries',
                            '75g Powdered Sugar',
                            'Probably other stuff',
                        ],
                        { repeat: 0, tastiness: 0, cost: 0, time: 0 },
                    )
                );
            } else {
                this.recipeValues.push(
                    new RecipeValue(
                        'Not raspberry Pie',
                        'A pie without raspberries... duh',
                        ['Desert', 'π'],
                        [
                            '75g Powdered Sugar',
                            'Probably other stuff',
                        ],
                        { repeat: 0, tastiness: 0, cost: 0, time: 0 },
                    )
                );
            }
        }
    }
}
</script>

<style scoped>
.recipeContainer {
    margin-bottom: 2rem;
    margin-top: 2rem;
}
</style>
