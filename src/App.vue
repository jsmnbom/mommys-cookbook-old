<template lang="pug">
#app
    NavbarWidget
    router-view
        
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

import NavbarWidget from './components/NavbarWidget.vue';

@Component({
    components: {
        NavbarWidget,
    },
})
export default class App extends Vue {
}
</script>
