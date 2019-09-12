<template lang='pug'>
section.section
    .container
        .level
            .level-left
                h1.title.level-item Recipes in {{ cookbook ? cookbook.title : ''}}
            .level-right
                b-dropdown.level-item(aria-role='list')
                    button.button.is-info.is-outlined(slot='trigger')
                        b-icon(v-if='sortDirection == 0' icon='sort-descending')
                        b-icon(v-else icon='sort-ascending')
                        span {{ sortString }}
                        b-icon(icon='menu-down')
                    template(v-for='s in 6')
                        b-dropdown-item(aria-role='listitem' @click='setSort(s-1)') {{ getSortString(s-1) }}
                b-dropdown.level-item.tag-dropdown(aria-role='list')
                    button.button.is-info.is-outlined(slot='trigger')
                        b-icon(icon='tag')
                        span Tag filter
                        b-icon(icon='menu-down')
                    b-dropdown-item(aria-role='listitem' :focusable="false" custom v-for='tag in tags' :key='tag')
                        b-checkbox(:native-value='tag' v-model='filteredTags') {{ tag }}
                div.level-item
                    b-button(type='is-primary' icon-left='plus-circle' @click='newRecipe') New recipe

        div.recipeContainer(v-for='[key, recipe] in recipes')
            CookbookRecipe(v-model='rawRecipes[key]' :id='key' @refresh='fetchData' :allowEdit='allowRecipeEdit' :allowDelete='allowRecipeDelete' :tags='tags')
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

interface RecipeList {
    [id: string]: RecipeValue;
}

enum SortType {
    RecentlyEdited = 0,
    LastEaten = 1,
    Cost = 2,
    Time = 3,
    Tastiness = 4,
    Total = 5,
}

enum SortDirection {
    Descending = 0,
    Ascending = 1,
}


@Component({
    components: {
        CookbookRecipe,
    },
})
export default class CookbookItem extends Vue {
    private rawRecipes: RecipeList = {};
    private cookbook: CookbookValue | null = null;

    private sort: SortType = SortType.RecentlyEdited;
    private sortDirection: SortDirection = SortDirection.Ascending;

    private filteredTags: string[] = [];

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
            }, id, null, null);

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

        this.rawRecipes = {};
        const inner = (querySnapshot: firestore.QuerySnapshot) => {
            this.rawRecipes = {
                ...querySnapshot.docs.reduce((map: RecipeList, doc) => {
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
        if (this.cookbook) {
            return this.cookbook!.authorUid === this.$store.user!.uid ||
                this.cookbook!.sharedWith.includes(this.$store.user!.email!);
        }
        return false;
    }

    private get allowRecipeDelete(): boolean {
        if (this.cookbook) {
            return this.cookbook!.authorUid === this.$store.user!.uid;
        }
        return false;
    }

    private get tags(): string[] {
        return Array.from(new Set(Object.values(this.rawRecipes).map((recipe) => recipe.tags).flat()));
    }

    private get sortString(): string {
        return this.getSortString(this.sort);
    }

    private getSortString(sort: SortType) {
        switch (sort) {
            case SortType.RecentlyEdited:
                return 'Recently edited';
            case SortType.LastEaten:
                return 'Last eaten';
            case SortType.Cost:
                return 'Dish cost';
            case SortType.Time:
                return 'Time/difficulty';
            case SortType.Tastiness:
                return 'Tastiness';
            case SortType.Total:
                return 'Total dish score';
        }
    }

    private setSort(newSort: SortType) {
        if (newSort === this.sort) {
            this.sortDirection = this.sortDirection === SortDirection.Ascending ?
                SortDirection.Descending : SortDirection.Ascending;
        } else {
            this.sortDirection = SortDirection.Ascending;
        }
        this.sort = newSort;
    }

    private get recipes(): Array<[string, RecipeValue]> {
        let recipeList: Array<[string, RecipeValue]> = [];

        if (this.filteredTags.length > 0) {
            for (const [key, val] of Object.entries(this.rawRecipes)) {
                if (val.tags.some((r) => this.filteredTags.includes(r))) {
                    recipeList.push([key, val]);
                }
            }
        } else {
            recipeList = Object.entries(this.rawRecipes);
        }

        recipeList = recipeList.sort((a, b) => {
            let c = null;
            let d = null;
            switch (this.sort) {
                case SortType.RecentlyEdited:
                    c = a[1].lastEdited;
                    d = b[1].lastEdited;
                    break;
                case SortType.LastEaten:
                    c = a[1].lastEaten;
                    d = b[1].lastEaten;
                    break;
                case SortType.Cost:
                    c = a[1].ratings.cost;
                    d = b[1].ratings.cost;
                    break;
                case SortType.Time:
                    c = a[1].ratings.time;
                    d = b[1].ratings.time;
                    break;
                case SortType.Tastiness:
                    c = a[1].ratings.tastiness;
                    d = b[1].ratings.tastiness;
                    break;
                case SortType.Total:
                    c = Math.round((
                        (10 - a[1].ratings.cost) +
                        (10 - a[1].ratings.time) +
                        a[1].ratings.tastiness
                    ) / 3);
                    d = Math.round((
                        (10 - b[1].ratings.cost) +
                        (10 - b[1].ratings.time) +
                        b[1].ratings.tastiness
                    ) / 3);
                    break;
            }
            if (c === null || d === null) {
                return 0;
            }
            if (c instanceof Date) {
                c = c.getTime();
            }
            if (d instanceof Date) {
                d = d.getTime();
            }
            if (this.sortDirection === SortDirection.Descending) {
                return c - d;
            } else {
                return d - c;
            }
        });

        return recipeList;
    }
}
</script>

<style scoped>
.recipeContainer {
    margin-bottom: 2rem;
    margin-top: 2rem;
}
@media (min-width: 1023px) {
    .tag-dropdown >>> .dropdown-content {
        max-height: 20rem;
        overflow-y: auto;
    }
}
</style>
