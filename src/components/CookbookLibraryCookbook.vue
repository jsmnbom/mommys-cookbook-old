<template lang='pug'>
div
    router-link.box(:to="{ name: 'cookbook', params: { id: value.id } }")
        article.media
            .media-left
                figure.image.is-4by5.cover
                    img(src='https://bulma.io/images/placeholders/480x600.png')
            .media-content
                .content
                    p.title {{ value.title }}
                    p.subtitle By {{ value.author }}
                    p {{ value.description }}
                .level
                    .level-left
                        b-button.level-item(type='is-info' icon-left='share-variant' @click.prevent='onShare') Share
                        b-button.level-item(type='is-info' icon-left='settings' @click.prevent='onOptions') Options
                        b-button.level-item(type='is-danger' icon-left='delete' @click.prevent='onDelete') Delete

    b-modal(:active.sync='optionsModalActive' has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title Edit cookbook
            section.modal-card-body
                b-field(label='Title')
                    b-input(v-model='value.title')
                b-field(label='Description')
                    b-input(v-model='value.description')
            footer.modal-card-foot
                a.button(@click='optionsModalActive = false;') Close
                a.button.is-primary Save

    b-modal(:active.sync='shareModalActive' has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title Share {{ value.title }}
            
            section.modal-card-body
                b-field(label='Shared with')
                    b-table(:data='value.sharedWith')
                        template(slot-scope='props')
                            b-table-column(key=0 label='Email')
                                span {{ props.row }}
                            b-table-column(key=1 label='')
                                a.delete(@click='onDelete')
                form()
                    b-field.add
                        b-input(placeholder='Share with email' icon='account-plus')
                br
                b-field(label='Readonly share link')
                    b-input(:value='href')
            footer.modal-card-foot
                a.button(@click='shareModalActive = false;') Close
                a.button.is-primary Save

</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

import CookbookValue from '../CookbookValue';

@Component({
    components: {},
})
export default class CookbookLibraryCookbook extends Vue {
    @Prop(CookbookValue) private readonly value!: CookbookValue;

    private shareModalActive = false;
    private optionsModalActive = false;

    private onShare() {
        this.shareModalActive = true;
    }

    private get href() {
        const a = document.createElement('a');
        // @ts-ignore
        a.href = this.$router.resolve({ name: 'cookbook', params: { id: this.value.id } }).href;
        return a.href;
    }

    private onOptions() {
        this.optionsModalActive = true;
    }

    private onDelete() {

    }
}
</script>

<style scoped>
.cover {
    width: 10rem;
}
</style>
