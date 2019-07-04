<template lang='pug'>
div
    h1.title Your cookbooks
    .columns
        .column(v-for='(cookbook, index) in cookbooks')
            CookbookLibraryCookbook(v-model='cookbooks[index]')

</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

import CookbookValue from '../CookbookValue';
import CookbookLibraryCookbook from './CookbookLibraryCookbook.vue';

@Component({
    components: {
        CookbookLibraryCookbook,
    },
})
export default class CookbookLibrary extends Vue {
    private cookbooks = [
        new CookbookValue(0, 'Raspberry pie cookbook', 'A cookbook with raspberry pie in it... duh', 'Jasmin Bom', ['test@test.com']),
        new CookbookValue(0, 'Not raspberry pie cookbook', 'A cookbook without raspberry pie in it... duh', 'Jasmin Bom', ['test@test.com']),
    ];
}
</script>

<style scoped>
</style>
