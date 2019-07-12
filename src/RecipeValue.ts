import { firestore } from 'firebase';

export default class RecipeValue {
    public static fromObject(data: {
        title: string,
        subtitle: string,
        content: string,
        tags: string,
        ingredients: string,
        ratings: {
            cost: number,
            time: number,
            tastiness: number,
        },
        cookbookId: string,
        lastEaten: firestore.Timestamp | null,
    } | firestore.DocumentData) {
        return new this(
            data.title,
            data.subtitle,
            data.content,
            [...data.tags],
            [...data.ingredients],
            { ...data.ratings },
            data.cookbookId,
            data.lastEaten ? data.lastEaten.toDate() : null,
        );
    }

    constructor(
        public title: string,
        public subtitle: string,
        public content: string,
        public tags: string[],
        public ingredients: string[],
        public ratings: {
            cost: number,
            time: number,
            tastiness: number,
        },
        public cookbookId: string,
        public lastEaten: Date | null,
    ) { }

    public toObject() {
        return {
            title: this.title,
            subtitle: this.subtitle,
            content: this.content,
            tags: this.tags,
            ingredients: this.ingredients,
            ratings: this.ratings,
            cookbookId: this.cookbookId,
            lastEaten: this.lastEaten,
        };
    }

}
