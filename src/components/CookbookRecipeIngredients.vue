<template lang="pug">
div
    b-table(:data='value' :checked-rows.sync='checkedRows' checkable :mobile-cards='false')
        template(slot-scope='props')
            b-table-column(key=0 label='Ingredients' visible=true)
                span {{ props.row }}
            b-table-column(key=1 label='' :visible='editing')
                a.delete(@click='onDelete')
        template(slot='empty')
            td(colspan=2) No ingredients added
    div
        b-field.add(v-if='editing')
            b-input(placeholder='Add ingredients (one per line)' v-model='ingredientsToAdd' type='textarea')
        b-field.add(v-if='editing')
            b-button(type='is-primary' icon-left='playlist-plus' @click='addIngredients') Add ingredients
</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CookbookRecipeIngredients extends Vue {
    @Prop(Boolean) private readonly editing: boolean | undefined;
    @Prop({ default: [] }) private readonly value!: string[];

    private ingredientsToAdd = '';

    private checkedRows = [];

    private addIngredients(e: Event) {
        this.ingredientsToAdd.match(/[^\r\n]+/g)!.forEach((ingredient) => {
            if (ingredient && ingredient.length > 0) {
                this.value.push(ingredient);
            }
        });
        this.ingredientsToAdd = '';
    }

    private onDelete(e: Event) {
        // Traverse to <tr>
        const element = (e.target as HTMLElement).parentElement!.parentElement!.parentElement!;
        // Get index of row
        const index = Array.from(element.parentElement!.children).indexOf(element);
        // Remove it
        this.value.splice(index, 1);
    }
}
</script>

<style scoped>
table td:nth-child(3) {
    text-align: right;
}

.field.add {
    padding: 0 0.5rem;
}
</style>
