<template lang='pug'>
section.section
    .container
        .level
            .level-left
                h1.title.level-item Recipes in {{ cookbook ? cookbook.title : ''}}
            .level-right
                b-button.level-item(type='is-primary' icon-left='plus-circle' @click='newRecipe') New recipe
        div.recipeContainer(v-for='(recipe, key) in recipes')
            CookbookRecipe(v-model='recipes[key]' :id='key' @refresh='fetchData' :allowEdit='allowRecipeEdit' :allowDelete='allowRecipeDelete' :tags='tags')
    b-loading(:active='!cookbook' isFullPage)
</template>
        

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import CookbookRecipe from './CookbookRecipe.vue';
import RecipeValue from '../RecipeValue';
import CookbookValue from '../CookbookValue';
import { dialogAlert, notificationSuccess } from '../utils';
import { db } from '@/firebase';
import { firestore } from 'firebase';


@Component({
    components: {
        CookbookRecipe,
    },
})
export default class CookbookItem extends Vue {
    private recipes: { [id: string]: RecipeValue } = {};
    private cookbook: CookbookValue | null = null;

    private created() {
        this.fetchData();
    }

    private newRecipe() {
        const id = this.$route.params.id;

        if (this.cookbook) {
            const recipe = new RecipeValue('New recipe', '', '', [], [], {
                cost: 0,
                time: 0,
                tastiness: 0,
            }, id, null);

            db.collection('recipes').add(recipe.toObject()).then((docRef) => {
                notificationSuccess(`Successfully created new recipe with id: ${docRef.id}`);
            }).catch((error) => {
                dialogAlert(`Error creating recipe: ${error}`);
            });
        }
    }

    @Watch('$route')
    @Watch('$store.user', { immediate: true })
    private fetchData() {
        const id = this.$route.params.id;

        db.collection('cookbooks').doc(id).onSnapshot((querySnapshot) => {
            if (querySnapshot.exists) {
                const data = querySnapshot.data();
                this.cookbook = CookbookValue.fromObject(data!);
            } else {
                dialogAlert('Cookbook not found!');
            }
        }, (error) => {
            dialogAlert(`Error getting cookbook: ${error}`);
        });

        this.recipes = {};
        const inner = (querySnapshot: firestore.QuerySnapshot) => {
            this.recipes = {...querySnapshot.docs.reduce((map: { [id: string]: RecipeValue }, doc) => {
                    const data = doc.data();
                    const cookbook = RecipeValue.fromObject(data);
                    map[doc.id] = cookbook;
                    return map;
                }, {}),
            };
        };
        db.collection('recipes').where('cookbookId', '==', id).onSnapshot(inner);
    }

    private get allowRecipeEdit(): boolean {
        if (this.cookbook) return this.cookbook!.authorUid === this.$store.user!.uid || this.cookbook!.sharedWith.includes(this.$store.user!.email!);
        return false;
    }

    private get allowRecipeDelete(): boolean {
        if (this.cookbook) return this.cookbook!.authorUid === this.$store.user!.uid;
        return false;
    }

    private get tags(): string[] {
        return Array.from(new Set(Object.values(this.recipes).map((recipe) => recipe.tags).flat()));
    }
}
</script>

<style scoped>
.recipeContainer {
    margin-bottom: 2rem;
    margin-top: 2rem;
}
</style>
