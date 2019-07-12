<template lang='pug'>
section.section
    .container
        .level.header
            .level-left
                h1.title.level-item Your cookbooks
            .level-right
                b-button.level-item(type='is-primary' icon-left='plus-circle' @click='newCookbook') New cookbook
        .grid(v-if='Object.keys(cookbooks).length !== 0')
            .grid-item(v-for='(cookbook, key) in cookbooks')
                CookbookLibraryCookbook(v-model='cookbooks[key]' :id='key' @refresh='fetchData')
        .content(v-else)
            h1.is-size-4 No cookbooks found

    b-modal(:active.sync='newCookbookModalActive' has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title New cookbook
            section.modal-card-body
                b-field(label='Title')
                    b-input(v-model='title')
                b-field(label='Description')
                    b-input(v-model='description' type='textarea', maxlength='200')
            footer.modal-card-foot
                a.button(@click='newCookbookModalActive = false;') Close
                a.button.is-primary(@click='newCookbookSave') Save

</template>
        

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import CookbookValue from '../CookbookValue';
import CookbookLibraryCookbook from './CookbookLibraryCookbook.vue';
import { db } from '../firebase';
import { notificationSuccess, dialogAlert } from '../utils';
import { firestore } from 'firebase';

@Component({
    components: {
        CookbookLibraryCookbook,
    },
})
export default class CookbookLibrary extends Vue {
    // Vetur doesn't have proper type for $store stuff
    [x: string]: any;
    private newCookbookModalActive = false;
    private title: string = '';
    private description: string = '';

    private cookbooks: { [id: string]: CookbookValue } = {};

    private newCookbook() {
        this.title = '';
        this.description = '';
        this.newCookbookModalActive = true;
    }

    private newCookbookSave() {
        this.newCookbookModalActive = false;

        const cookbook = new CookbookValue(
            this.title,
            this.description,
            this.$store.user!.displayName!,
            this.$store.user!.uid,
            [],
            '',
        );

        db.collection('cookbooks').add(cookbook.toObject()).then((docRef) => {
            notificationSuccess(`Successfully created new cookbook with id: ${docRef.id}`);
            this.fetchData();
        }).catch((error) => {
            dialogAlert(`Error creating cookbook: ${error}`);
        });
    }

    private created() {
        this.fetchData();
    }

    @Watch('$route')
    @Watch('$store.user', { immediate: true })
    private fetchData() {
        if (this.$store.user) {
            this.cookbooks = {};
            const inner = (querySnapshot: firestore.QuerySnapshot) => {
                this.cookbooks = {
                    ...this.cookbooks, ...querySnapshot.docs.reduce((map: { [id: string]: CookbookValue }, doc) => {
                        const data = doc.data();
                        const cookbook = CookbookValue.fromObject(data);
                        map[doc.id] = cookbook;
                        return map;
                    }, {}),
                };
            };
            db.collection('cookbooks').where('authorUid', '==', this.$store.user.uid).onSnapshot(inner);
            db.collection('cookbooks').where('sharedWith', 'array-contains', this.$store.user.email).onSnapshot(inner);
        }
    }
}
</script>

<style>
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
}
.grid-item .box:not(:last-child) {
    margin: 0;
}
.header .level-left .level-item {
    justify-content: start;
}
@media (max-width: 1216px) {
    .grid  {
        grid-template-columns: 1fr;
    }
}
</style>
