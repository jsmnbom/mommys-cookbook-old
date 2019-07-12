import { firestore } from 'firebase';


export default class CookbookValue {
    public static fromObject(data: {
        title: string,
        description: string,
        authorDisplayName: string,
        authorUid: string,
        sharedWith: string[],
        thumbURL: string,
    } | firestore.DocumentData) {
        return new this(
            data.title,
            data.description,
            data.authorDisplayName,
            data.authorUid,
            [...data.sharedWith],
            data.thumbURL,
        );
    }

    constructor(
        public title: string,
        public description: string,
        public authorDisplayName: string,
        public authorUid: string,
        public sharedWith: string[],
        public thumbURL: string,
    ) { }

    public toObject() {
        return {
            title: this.title,
            description: this.description,
            authorDisplayName: this.authorDisplayName,
            authorUid: this.authorUid,
            sharedWith: this.sharedWith,
            thumbURL: this.thumbURL,
        };
    }
}
