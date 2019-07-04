<template lang="pug">
div
    b-table(:data='value' :checked-rows.sync='checkedRows' checkable)
        template(slot-scope='props')
            b-table-column(key=0 label='Ingredients' visible=true)
                span {{ props.row }}
            b-table-column(key=1 label='' :visible='editing')
                a.delete(@click='onDelete')
    form(@submit.prevent='addIngredient')
        b-field.add(v-if='editing')
            b-input(placeholder='Add ingredient' icon='playlist-plus' v-model='ingredient')
</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CookbookRecipeIngredients extends Vue {
    @Prop(Boolean) private readonly editing: boolean | undefined;
    @Prop({ default: [] }) private readonly value!: string[];

    private ingredient = '';

    private checkedRows = [];

    private addIngredient(e: Event) {
        this.value.push(this.ingredient);
        this.ingredient = '';
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
