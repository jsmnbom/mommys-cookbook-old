<template lang="pug">
section.recipe
    b-collapse.card(aria-id='contentIdForA11y3' :open='false')
        div.card-header(slot='trigger' slot-scope='props' role='button' aria-controls='contentIdForA11y3')
            b-tooltip(label='Change picture by changing topmost picture in recipe text' position='is-bottom')
                figure.image.is-128x128
                    img.thumb(:src='imageUrl')

            .text
                span.title {{ value.title }}
                span.subtitle {{ value.subtitle }}
                b-taglist.tags
                    b-tag(type='is-info' v-for='tag in value.tags' :key='tag' :style='tagStyle(tag)') {{ tag }}

            .ratings
                //- CookbookRecipeRating(icon='repeat', :rating='value.ratings.repeat' title='Repeat of this dish')
                CookbookRecipeRating(icon='currency-usd' :rating='value.ratings.cost' title='Cost of this dish')
                CookbookRecipeRating(icon='timer' :rating='value.ratings.time' title='Time/difficulty of cooking this dish')
                CookbookRecipeRating(icon='heart', :rating='value.ratings.tastiness' title='Tastiness of this dish')
                CookbookRecipeRating(icon='checkbox-marked-circle', :rating='total' title='Total dish score')

            a.card-header-icon
                b-icon(:icon='props.open ? "menu-down" : "menu-up"' size='is-medium')

        .card-content
            .columns
                .column.is-two-thirds
                    RichEditor(v-if='editing' :content.sync='value.content')
                    div.recipeContent(v-else v-html='value.content')
                .column
                    b-field(label='Title' labelPosition='on-border' v-if='editing')
                        b-input(v-model.trim='value.title')
                    b-field(label='Subtitle' labelPosition='on-border' v-if='editing')
                        b-input(v-model.trim='value.subtitle')
                    b-field(label='Tags' labelPosition='on-border' v-if='editing')
                        b-taginput(v-model='value.tags' ellipsis icon='label' placeholder='Add a tag' autocomplete :allow-new='true' :data='filteredTags' @typing='filterTags')
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
                    br
                    b-field(label='Last eaten')
                        b-datepicker(v-model='value.lastEaten' :first-day-of-week='1' inline  v-if='editing')
                            .level.is-mobile
                                .level-left
                                    b-button.level-item(type='is-primary' @click='value.lastEaten = new Date();' icon-left='calendar-today') Today
                                .level-right
                                    b-button.level-item(type='is-danger' @click='value.lastEaten = null;' icon-left='close') Clear
                        p(v-else) {{formattedLastEaten}}


        footer.card-footer
            a.card-footer-item(@click='toggleEdit' v-if='allowEdit')
                span(v-if='editing') Save
                span(v-else) Edit
            a.card-footer-item(@click='onDelete' v-if='allowDelete') Delete
</template>
        

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import CookbookRecipeRating from './CookbookRecipeRating.vue';
import CookbookRecipeIngredients from './CookbookRecipeIngredients.vue';
import RichEditor from './RichEditor.vue';
import RecipeValue from '../RecipeValue';
import { notificationSuccess, dialogAlert, hashCode } from '@/utils';
import { db } from '@/firebase';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

@Component({
    components: {
        CookbookRecipeRating,
        CookbookRecipeIngredients,
        RichEditor,
    },
})
export default class CookbookRecipe extends Vue {
    @Prop({ type: RecipeValue, required: true }) private readonly value!: RecipeValue;
    @Prop({ type: String, required: true }) private readonly id!: string;
    @Prop({ type: Boolean, required: true }) private readonly allowEdit!: boolean;
    @Prop({ type: Boolean, required: true }) private readonly allowDelete!: boolean;
    @Prop({ type: Array, required: true }) private readonly tags!: string[];

    private filteredTags: string[] = [];

    private filterTags(text: string) {
        this.filteredTags = this.tags.filter((tag) => {
            return tag.toLowerCase().indexOf(text.toLowerCase()) >= 0 && !this.value.tags.includes(tag);
        });
    }

    private editing = false;
    private get total() {
        return this.value ? Math.round((
            (10-this.value.ratings.cost) +
            (10-this.value.ratings.time) +
            this.value.ratings.tastiness
        ) / 3) : 0;
    }

    private toggleEdit() {
        if (this.editing) {
            // Save
            this.value.lastEdited = new Date();
            db.collection('recipes').doc(this.id).update(this.value.toObject()).then(() => {
                notificationSuccess('Recipe successfully updated!');
            }).catch((error) => {
                dialogAlert(`Error updating recipe: ${error}`);
            });
        } else {
            // Edit
        }
        this.editing = !this.editing;
    }

    private get imageUrl() {
        const doc = new DOMParser().parseFromString(this.value.content, 'text/html');
        const img = doc.querySelector('img');
        if (img) {
            return img.src;
        } else {
            return `https://avatars.dicebear.com/v2/bottts/${this.id}.svg`;
        }
    }

    private get formattedLastEaten() {
        if (this.value.lastEaten) {
            const date = dayjs(this.value.lastEaten).hour(0).minute(0).second(0).millisecond(0);
            const today = dayjs().hour(0).minute(0).second(0).millisecond(0);
            const relative = date.unix() == today.unix() ? 'today' : date.from(today);
            return `${date.format("dddd, MMMM D, YYYY")} (${relative})`;
        } else {
            return 'Never';
        }
    }

    private onDelete() {
        this.$dialog.confirm({
            title: 'Deleting recipe',
            message: `Are you sure you want to <b>delete</b> "${this.value.title}"? This action cannot be undone.`,
            confirmText: `Delete "${this.value.title}"`,
            type: 'is-danger',
            hasIcon: true,
            onConfirm: () => db.collection('recipes').doc(this.id).delete().then(() => {
                notificationSuccess('Recipe successfully deleted!');
                this.$emit('refresh');
            }).catch((error) => {
                dialogAlert(`Error removing recipe: ${error}`);
            }),
        });
    }

    private tagStyle(tag: string) {
        const hue = (Math.abs(hashCode(tag)) % 45) * 8;
        return `background-color: hsl(${hue}, 100%, 30%);`;
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
.recipeContent >>> h1 {
    font-size: 2em;
}
.recipeContent >>> h2 {
    font-size: 1.5em;
}
.recipeContent >>> h3 {
    font-size: 1.17em;
}
.recipeContent >>> img {
    cursor: default !important;
}
.thumb {
    object-fit: cover;
    width: 128px;
    height: 128px;
}
.recipe .card-header {
    cursor: pointer;
}
.recipe .card-header:hover,
.recipe .card-header:focus {
    -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #7957d5;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #7957d5;
}
.recipe .card-header:active {
    -webkit-box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #7957d5;
    box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #7957d5;
}
.recipe >>> .datepicker .dropdown-menu {
    width: 100%;
}
.recipe >>> .datepicker .datepicker-content {
    height: initial;
}

@media (max-width: 1023px) {
    .card-header {
        flex-direction: column;
        align-items: center;
    }
    .tags {
        justify-content: center;
    }
    .card-header-icon {
        padding: 0;
    }
}

</style>